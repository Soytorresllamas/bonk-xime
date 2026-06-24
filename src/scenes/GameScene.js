import Phaser from 'phaser';
import { generateWave } from '../config/waves.js';
import { tileToScreen, isoDepth, isAdjacent, getOrthogonalNeighbors } from '../utils/isomath.js';
import { Block } from '../entities/Block.js';
import { Cheems } from '../entities/Cheems.js';
import { EnergySystem, CHAIN_COST, POWER_COST } from '../systems/EnergySystem.js';
import { spawnMemeText, spawnBlockParticles } from '../effects/MemeText.js';
import { BLOCK_TYPES } from '../config/blocks.js';

export class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  preload() {
    this.load.image('chems', '/assets/chems.png');
    this.load.image('mazo',  '/assets/mazo.png');
  }

  create() {
    this._waveNum = 1;
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

    this._qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this._eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this._charging = false;
    this._chargeStartTime = 0;

    this.input.on('pointerdown', (pointer) => {
      this._handleClick(pointer.x, pointer.y);
    });
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

  _handleClick(px, py) {
    if (!this._cheems) return;
    let target = null;
    let minDist = 50;
    this._blocks.forEach(block => {
      const dist = Phaser.Math.Distance.Between(px, py, block.x, block.y);
      if (dist < minDist && isAdjacent(this._cheems, block)) {
        minDist = dist;
        target = block;
      }
    });
    if (target) this._bonkBlock(target);
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
      }
    });

    spawnMemeText(this, this._cheems.x, this._cheems.y - 80, 'MEGA BONK', '#FF4400');
    this.cameras.main.flash(200, 255, 100, 0, true);
  }

  _handleSpecialKeys() {
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

  update() {
    this._cheems.handleInput();
    this._handleSpecialKeys();
  }
}
