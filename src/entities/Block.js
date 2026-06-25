import Phaser from 'phaser';
import { BLOCK_TYPES } from '../config/blocks.js';
import { tileToScreen, isoDepth, TILE_W, TILE_H } from '../utils/isomath.js';

const FACE_COLORS = {
  wood:    { top: 0xA0522D, left: 0x6B3516, right: 0x8B4513 },
  stone:   { top: 0x9999aa, left: 0x444455, right: 0x666677 },
  iron:    { top: 0x8888a0, left: 0x303040, right: 0x505060 },
  doge:    { top: 0xDAA520, left: 0x7A5800, right: 0xB8860B },
  trap:    { top: 0xff2200, left: 0x660000, right: 0x991100 },
  diamond: { top: 0x00ccff, left: 0x004466, right: 0x007799 },
};

export class Block extends Phaser.GameObjects.Container {
  constructor(scene, col, row, type, originX, originY) {
    const { x, y } = tileToScreen(col, row, originX, originY);
    super(scene, x, y);

    this.col = col;
    this.row = row;
    this.type = type;
    this.def = BLOCK_TYPES[type];
    this.hp = this.def.hp;

    this._gfx = scene.add.graphics();
    this.add(this._gfx);

    this._hlGfx = scene.add.graphics();
    this.add(this._hlGfx);

    if (this.def.hp > 1) {
      this._hpLabel = scene.add.text(0, -TILE_H * 0.6, String(this.hp), {
        fontFamily: 'Impact, sans-serif', fontSize: '14px',
        color: '#ffffff', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5, 1);
      this.add(this._hpLabel);
    }

    this.setDepth(isoDepth(col, row));
    this._draw();

    if (this.type === 'diamond') {
      [
        { x: 0,              y: -TILE_H * 0.85 },
        { x:  TILE_W * 0.38, y: -TILE_H * 0.15 },
        { x: -TILE_W * 0.38, y: -TILE_H * 0.15 },
      ].forEach(({ x, y }, i) => {
        const s = scene.add.graphics();
        s.fillStyle(0xffffff, 0.9);
        s.fillCircle(0, 0, 2);
        s.setPosition(x, y);
        this.add(s);
        scene.tweens.add({ targets: s, alpha: 0, scale: 0, duration: 500, yoyo: true, repeat: -1, delay: i * 220 });
      });
    }

    if (this.type === 'trap') {
      const warn = scene.add.text(0, -TILE_H * 0.9, '⚠', {
        fontFamily: 'sans-serif', fontSize: '14px',
        color: '#ffff00', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5, 1);
      this.add(warn);
      scene.tweens.add({ targets: warn, alpha: 0.15, duration: 350, yoyo: true, repeat: -1 });
    }

    scene.add.existing(this);
  }

  _draw() {
    const { top, left, right } = FACE_COLORS[this.type];
    const hw = TILE_W / 2, hh = TILE_H / 2, depth = 20;
    this._gfx.clear();

    this._gfx.fillStyle(left);
    this._gfx.fillPoints([
      { x: -hw, y: 0 }, { x: 0, y: hh },
      { x: 0, y: hh + depth }, { x: -hw, y: depth },
    ], true);

    this._gfx.fillStyle(right);
    this._gfx.fillPoints([
      { x: hw, y: 0 }, { x: 0, y: hh },
      { x: 0, y: hh + depth }, { x: hw, y: depth },
    ], true);

    this._gfx.fillStyle(top);
    this._gfx.fillPoints([
      { x: 0, y: -hh }, { x: hw, y: 0 },
      { x: 0, y: hh }, { x: -hw, y: 0 },
    ], true);
  }

  setTarget(active) {
    if (active === this._isTarget) return;
    this._isTarget = active;
    if (active) {
      const hw = TILE_W / 2, hh = TILE_H / 2;
      this._hlGfx.clear();
      this._hlGfx.lineStyle(2, 0xffffff, 1);
      this._hlGfx.strokePoints([
        { x: 0, y: -hh }, { x: hw, y: 0 },
        { x: 0, y: hh }, { x: -hw, y: 0 }, { x: 0, y: -hh },
      ]);
      if (!this._hlTween) {
        this._hlTween = this.scene.tweens.add({
          targets: this._hlGfx, alpha: 0.25, duration: 280,
          yoyo: true, repeat: -1,
        });
      }
    } else {
      this._hlGfx.clear().setAlpha(1);
      if (this._hlTween) { this._hlTween.stop(); this._hlTween = null; }
    }
  }

  bonk() {
    this.hp -= 1;
    if (this._hpLabel) this._hpLabel.setText(this.hp > 1 ? String(this.hp) : '');

    if (this.hp <= 0) {
      this.destroy();
      return true;
    }

    this.scene.tweens.add({
      targets: this, alpha: 0.3, duration: 60,
      yoyo: true, onComplete: () => { if (this.active) this.setAlpha(1); },
    });
    this.scene.tweens.add({
      targets: this, scaleX: 1.25, scaleY: 0.75, duration: 70,
      yoyo: true, ease: 'Power2',
      onComplete: () => { if (this.active) { this.scaleX = 1; this.scaleY = 1; } },
    });
    if (this.hp === 1 && !this._deathShake) {
      this._deathShake = this.scene.tweens.add({
        targets: this._gfx, x: { from: -2, to: 2 },
        duration: 80, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }
    return false;
  }
}
