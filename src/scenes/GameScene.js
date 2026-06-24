import Phaser from 'phaser';
import { generateWave } from '../config/waves.js';
import { tileToScreen, isoDepth, isAdjacent, getOrthogonalNeighbors, TILE_W, TILE_H } from '../utils/isomath.js';
import { Block } from '../entities/Block.js';
import { Cheems } from '../entities/Cheems.js';
import { EnergySystem, CHAIN_COST, POWER_COST } from '../systems/EnergySystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { spawnMemeText, spawnBlockParticles } from '../effects/MemeText.js';
import { SoundFX } from '../effects/SoundFX.js';
import { BLOCK_TYPES } from '../config/blocks.js';

const BONK_COOLDOWN_MS = 250;

export class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  preload() {
    this.load.image('chems', `${import.meta.env.BASE_URL}assets/chems.png`);
    this.load.image('mazo',  `${import.meta.env.BASE_URL}assets/mazo.png`);
  }

  create() {
    this._blocks = [];
    this._waveNum = 1;
    this._waveClear = false;
    this._targetBlock = null;
    this._lastBonkTime = -BONK_COOLDOWN_MS;
    this._combo = 0;
    this._comboResetTimer = null;

    this._wave = generateWave(this._waveNum);
    this._computeOrigin();
    this._drawBackground();
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
    this.events.emit('blocksChanged', this._blocks.length);
  }

  _drawBackground() {
    const gfx = this.add.graphics().setDepth(-10);
    const { width, height } = this.scale;
    const hw = TILE_W / 2, hh = TILE_H / 2;
    gfx.lineStyle(1, 0x2233aa, 0.12);
    for (let col = -4; col < 22; col++) {
      for (let row = -2; row < 20; row++) {
        const x = (col - row) * hw + width / 2;
        const y = (col + row) * hh + 80;
        gfx.strokePoints([
          { x, y: y - hh }, { x: x + hw, y },
          { x, y: y + hh }, { x: x - hw, y }, { x, y: y - hh },
        ]);
      }
    }
  }

  _computeOrigin() {
    const { gridH } = this._wave;
    this._originX = this.scale.width / 2 + (gridH - 1) * 16;
    this._originY = 150;
  }

  _spawnBlocks() {
    this._blocks = [];
    this._wave.blocks.forEach(({ col, row, type }, i) => {
      const block = new Block(this, col, row, type, this._originX, this._originY);
      const finalY = block.y;
      block.y = finalY - 90;
      block.setAlpha(0);
      this.tweens.add({
        targets: block, y: finalY, alpha: 1,
        duration: 280, delay: i * 18, ease: 'Back.easeOut',
      });
      this._blocks.push(block);
    });
    this.events.emit('blocksChanged', this._blocks.length);
  }

  _emitBlocks() {
    this.events.emit('blocksChanged', this._blocks.length);
  }

  _updateBlockTarget() {
    if (this._waveClear || !this._cheems) return;
    const adjacent = this._blocks.filter(b => isAdjacent(this._cheems, b));
    const newTarget = adjacent.length === 0 ? null : adjacent.reduce((best, b) =>
      Phaser.Math.Distance.Between(this._cheems.x, this._cheems.y, b.x, b.y) <
      Phaser.Math.Distance.Between(this._cheems.x, this._cheems.y, best.x, best.y) ? b : best
    );
    if (this._targetBlock !== newTarget) {
      if (this._targetBlock && this._targetBlock.active) this._targetBlock.setTarget(false);
      this._targetBlock = newTarget;
      if (this._targetBlock) this._targetBlock.setTarget(true);
    }
  }

  _handleBonkKey() {
    if (!this._cheems || this._waveClear) return;
    if (this.time.now - this._lastBonkTime < BONK_COOLDOWN_MS) return;
    if (!this._targetBlock) return;
    this._lastBonkTime = this.time.now;
    this._combo++;
    this.events.emit('combo', this._combo);
    if (this._comboResetTimer) this._comboResetTimer.remove();
    this._comboResetTimer = this.time.delayedCall(1500, () => {
      this._combo = 0;
      this.events.emit('combo', 0);
    });
    this._bonkBlock(this._targetBlock);
  }

  _bonkBlock(block) {
    this._cheems.swingBat(() => {
      if (!block.active) return;
      const { x, y, type, def } = block;
      const destroyed = block.bonk();
      this._energy.gain(def.energy);
      this.events.emit('energyChanged', this._energy.fraction);

      if (destroyed) {
        if (this._targetBlock === block) this._targetBlock = null;
        this._blocks = this._blocks.filter(b => b !== block);
        this._emitBlocks();
        SoundFX.destroy();
        this.cameras.main.shake(80, 0.006);
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
        if (earned > 0) spawnMemeText(this, x + 20, y - 40, `+${earned}`, '#aaffaa');
      } else {
        SoundFX.bonk();
        this.cameras.main.shake(40, 0.003);
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

    SoundFX.chain();
    this.cameras.main.shake(120, 0.009);

    toClear.forEach(block => {
      const { x, y, type, def } = block;
      const destroyed = block.bonk();
      if (destroyed) {
        if (this._targetBlock === block) this._targetBlock = null;
        this._blocks = this._blocks.filter(b => b !== block);
        spawnMemeText(this, x, y - 20, def.memeText);
        spawnBlockParticles(this, x, y, BLOCK_TYPES[type].topColor);
        const earned = this._score.addBlockScore(type, this._waveNum);
        this.events.emit('scoreChanged', this._score.score);
        if (earned > 0) spawnMemeText(this, x + 20, y - 40, `+${earned}`, '#aaffaa');
      }
    });
    this._emitBlocks();
    spawnMemeText(this, this._cheems.x, this._cheems.y - 60, 'such chain, very wow', '#00ccff');
  }

  _executePowerBonk() {
    const { col, row } = this._cheems;
    const inRange = this._blocks.filter(b =>
      Math.abs(b.col - col) <= 1 && Math.abs(b.row - row) <= 1
    );

    SoundFX.power();
    this.cameras.main.shake(220, 0.014);
    this.cameras.main.flash(200, 255, 100, 0, true);

    inRange.forEach(block => {
      const { x, y, type, def } = block;
      const destroyed = block.bonk();
      if (destroyed) {
        if (this._targetBlock === block) this._targetBlock = null;
        this._blocks = this._blocks.filter(b => b !== block);
        spawnMemeText(this, x, y - 20, def.memeText);
        spawnBlockParticles(this, x, y, BLOCK_TYPES[type].topColor);
        const earned = this._score.addBlockScore(type, this._waveNum);
        this.events.emit('scoreChanged', this._score.score);
        if (earned > 0) spawnMemeText(this, x + 20, y - 40, `+${earned}`, '#aaffaa');
      }
    });
    this._emitBlocks();
    spawnMemeText(this, this._cheems.x, this._cheems.y - 80, 'MEGA BONK', '#FF4400');
  }

  _handleSpecialKeys() {
    if (Phaser.Input.Keyboard.JustDown(this._kKey)) {
      this._handleBonkKey();
    }

    if (Phaser.Input.Keyboard.JustDown(this._qKey)) {
      if (this._energy.spend(CHAIN_COST)) {
        this._executeChainBonk();
        this.events.emit('energyChanged', this._energy.fraction);
      } else {
        SoundFX.noEnergy();
        this.events.emit('noEnergy');
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this._eKey) && !this._charging) {
      if (this._energy.canAfford(POWER_COST)) {
        this._charging = true;
        this._chargeStartTime = this.time.now;
        this.events.emit('charging', true);
      } else {
        SoundFX.noEnergy();
        this.events.emit('noEnergy');
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
    if (this._targetBlock && this._targetBlock.active) this._targetBlock.setTarget(false);
    this._targetBlock = null;

    const bonus = this._score.addWaveBonus(this._timeLeft);
    if (bonus > 0) {
      spawnMemeText(this, this.scale.width / 2, this.scale.height / 2, `WAVE BONUS +${bonus}!`, '#FFD700');
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
    if (this._targetBlock && this._targetBlock.active) this._targetBlock.setTarget(false);
    this._targetBlock = null;
    this._score.saveBest();

    this.registry.set('gameOver', true);
    this.registry.set('finalScore', this._score.score);
    this.registry.set('bestScore', this._score.getBest());
    this.registry.set('finalWave', this._waveNum);

    const cx = this.scale.width / 2, cy = this.scale.height / 2;
    this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.7).setDepth(5000);
    this.add.text(cx, cy - 60, 'GAME OVER', {
      fontFamily: 'Impact, sans-serif', fontSize: '72px',
      color: '#ff4422', stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(5001);
    this.add.text(cx, cy + 20, `WAVE ${this._waveNum} · SCORE ${this._score.score.toLocaleString()}`, {
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
    this._updateBlockTarget();

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
