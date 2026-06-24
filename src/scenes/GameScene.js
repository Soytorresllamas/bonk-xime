import Phaser from 'phaser';
import { generateWave } from '../config/waves.js';
import { tileToScreen, isoDepth, isAdjacent, getOrthogonalNeighbors } from '../utils/isomath.js';
import { Block } from '../entities/Block.js';
import { Cheems } from '../entities/Cheems.js';
import { EnergySystem, CHAIN_COST, POWER_COST } from '../systems/EnergySystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { spawnMemeText, spawnBlockParticles } from '../effects/MemeText.js';
import { BLOCK_TYPES } from '../config/blocks.js';

export class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  preload() {
    this.load.image('chems', '/assets/chems.png');
    this.load.image('mazo',  '/assets/mazo.png');
  }

  create() {
    // Reset all state for restarts
    this._blocks = [];
    this._waveNum = 1;
    this._waveClear = false;

    this._wave = generateWave(this._waveNum);
    this._computeOrigin();
    this._spawnBlocks();

    this._cheems = new Cheems(
      this,
      -1,
      Math.floor(this._wave.gridH / 2),
      this._originX,
      this._originY,
      () => this._blocks,
    );

    this._energy = new EnergySystem(100);
    this._score  = new ScoreSystem();

    this._qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this._eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this._kKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this._charging = false;
    this._chargeStartTime = 0;

    this._timeLeft = this._wave.timer;

    this.events.emit('waveChanged', this._waveNum);
    this.events.emit('timerChanged', this._timeLeft);
    this.events.emit('energyChanged', this._energy.fraction);
    this.events.emit('scoreChanged', this._score.score);
  }

  _computeOrigin() {
    const { gridH } = this._wave;
    this._originX = 400 + (gridH - 1) * 16;
    this._originY = 130;
  }

  _spawnBlocks() {
    this._blocks = [];
    this._wave.blocks.forEach(({ col, row, type }) => {
      const block = new Block(this, col, row, type, this._originX, this._originY);
      this._blocks.push(block);
    });
  }

  _handleBonkKey() {
    if (!this._cheems || this._waveClear) return;
    const adjacent = this._blocks.filter(b => isAdjacent(this._cheems, b));
    if (adjacent.length === 0) return;
    const target = adjacent.reduce((best, b) =>
      Phaser.Math.Distance.Between(this._cheems.x, this._cheems.y, b.x, b.y) <
      Phaser.Math.Distance.Between(this._cheems.x, this._cheems.y, best.x, best.y) ? b : best
    );
    this._bonkBlock(target);
  }

  _bonkBlock(block) {
    this._cheems.swingBat(() => {
      const { x, y, type, def } = block;
      const destroyed = block.bonk();
      this._energy.gain(def.energy);
      this.events.emit('energyChanged', this._energy.fraction);

      if (destroyed) {
        this._blocks = this._blocks.filter(b => b !== block);
        spawnMemeText(this, x, y - 20, def.memeText);
        spawnBlockParticles(this, x, y, BLOCK_TYPES[type].topColor);

        const earned = this._score.addBlockScore(type, this._waveNum);
        this.events.emit('scoreChanged', this._score.score);

        if (def.timerPenalty) {
          this._timeLeft = Math.max(0, this._timeLeft - def.timerPenalty);
          spawnMemeText(this, x, y - 40, `-${def.timerPenalty}s`, '#ff4422');
        }
        if (def.scoreMultiplier) {
          this._score.activateMultiplier(def.scoreMultiplier, def.multiplierDurationMs);
          spawnMemeText(this, x, y - 40, '×2 SCORE!!', '#00ccff');
        }
        if (earned > 0) {
          spawnMemeText(this, x + 20, y - 40, `+${earned}`, '#aaffaa');
        }
      } else {
        spawnMemeText(this, x, y - 20, 'bonk', '#ffffff');
      }
    });
  }

  _executeChainBonk() {
    const adjacent = this._blocks.filter(b => isAdjacent(this._cheems, b));
    if (adjacent.length === 0) return;

    const origin = adjacent.reduce((best, b) =>
      Phaser.Math.Distance.Between(this._cheems.x, this._cheems.y, b.x, b.y) <
      Phaser.Math.Distance.Between(this._cheems.x, this._cheems.y, best.x, best.y) ? b : best
    );

    const toClear = [origin];
    getOrthogonalNeighbors(origin.col, origin.row).forEach(({ col, row }) => {
      const nb = this._blocks.find(b => b.col === col && b.row === row);
      if (nb) toClear.push(nb);
    });

    toClear.forEach(block => {
      const { x, y, type, def } = block;
      const destroyed = block.bonk();
      if (destroyed) {
        this._blocks = this._blocks.filter(b => b !== block);
        spawnMemeText(this, x, y - 20, def.memeText);
        spawnBlockParticles(this, x, y, BLOCK_TYPES[type].topColor);
        const earned = this._score.addBlockScore(type, this._waveNum);
        this.events.emit('scoreChanged', this._score.score);
        if (earned > 0) spawnMemeText(this, x + 20, y - 40, `+${earned}`, '#aaffaa');
      }
    });

    spawnMemeText(this, this._cheems.x, this._cheems.y - 60, 'such chain, very wow', '#00ccff');
  }

  _executePowerBonk() {
    const { col, row } = this._cheems;
    const inRange = this._blocks.filter(b =>
      Math.abs(b.col - col) <= 1 && Math.abs(b.row - row) <= 1
    );

    inRange.forEach(block => {
      const { x, y, type, def } = block;
      const destroyed = block.bonk();
      if (destroyed) {
        this._blocks = this._blocks.filter(b => b !== block);
        spawnMemeText(this, x, y - 20, def.memeText);
        spawnBlockParticles(this, x, y, BLOCK_TYPES[type].topColor);
        const earned = this._score.addBlockScore(type, this._waveNum);
        this.events.emit('scoreChanged', this._score.score);
        if (earned > 0) spawnMemeText(this, x + 20, y - 40, `+${earned}`, '#aaffaa');
      }
    });

    spawnMemeText(this, this._cheems.x, this._cheems.y - 80, 'MEGA BONK', '#FF4400');
    this.cameras.main.flash(200, 255, 100, 0, true);
  }

  _handleSpecialKeys() {
    if (Phaser.Input.Keyboard.JustDown(this._kKey)) {
      this._handleBonkKey();
    }

    if (Phaser.Input.Keyboard.JustDown(this._qKey)) {
      if (this._energy.spend(CHAIN_COST)) {
        this._executeChainBonk();
        this.events.emit('energyChanged', this._energy.fraction);
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this._eKey) && !this._charging) {
      if (this._energy.canAfford(POWER_COST)) {
        this._charging = true;
        this._chargeStartTime = this.time.now;
        this.events.emit('charging', true);
      }
    }
    if (this._charging && !this._eKey.isDown) {
      this._charging = false;
      this.events.emit('charging', false);
      const elapsed = this.time.now - this._chargeStartTime;
      if (elapsed >= 1500 && this._energy.spend(POWER_COST)) {
        this._executePowerBonk();
        this.events.emit('energyChanged', this._energy.fraction);
      }
    }
  }

  _onWaveCleared() {
    const bonus = this._score.addWaveBonus(this._timeLeft);
    if (bonus > 0) {
      spawnMemeText(this, 400, 300, `WAVE BONUS +${bonus}!`, '#FFD700');
      this.events.emit('scoreChanged', this._score.score);
    }

    this._waveNum += 1;
    this._wave = generateWave(this._waveNum);
    this._computeOrigin();

    this.time.delayedCall(800, () => {
      this._spawnBlocks();
      this._timeLeft = this._wave.timer;
      this._waveClear = false;
      this._energy.reset();
      this.events.emit('waveChanged', this._waveNum);
      this.events.emit('energyChanged', 0);
      if (this._wave.isDoge) this.events.emit('dogWave');
    });
  }

  _onGameOver() {
    this._waveClear = true;
    this._score.saveBest();

    this.registry.set('gameOver', true);
    this.registry.set('finalScore', this._score.score);
    this.registry.set('bestScore', this._score.getBest());
    this.registry.set('finalWave', this._waveNum);

    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7).setDepth(5000);
    this.add.text(400, 260, 'GAME OVER', {
      fontFamily: 'Impact, sans-serif', fontSize: '72px',
      color: '#ff4422', stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(5001);
    this.add.text(400, 340, `WAVE ${this._waveNum} · SCORE ${this._score.score.toLocaleString()}`, {
      fontFamily: 'Impact, sans-serif', fontSize: '24px',
      color: '#FFD700', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(5001);

    this.time.delayedCall(2000, () => {
      this.scene.stop('UI');
      this.scene.start('Menu');
    });
  }

  update(time, delta) {
    this._cheems.handleInput();
    this._handleSpecialKeys();

    if (this._waveClear) return;

    this._timeLeft -= delta / 1000;
    this.events.emit('timerChanged', Math.max(0, this._timeLeft));

    if (this._blocks.length === 0) {
      this._waveClear = true;
      this._onWaveCleared();
      return;
    }

    if (this._timeLeft <= 0) {
      this._onGameOver();
    }
  }
}
