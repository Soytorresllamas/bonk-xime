import Phaser from 'phaser';
import { tileToScreen, isoDepth } from '../utils/isomath.js';

export class Cheems extends Phaser.GameObjects.Container {
  constructor(scene, col, row, originX, originY, getBlocks) {
    const { x, y } = tileToScreen(col, row, originX, originY);
    super(scene, x, y);

    this.col = col;
    this.row = row;
    this._originX = originX;
    this._originY = originY;
    this._getBlocks = getBlocks;

    this._sprite = scene.add.image(0, -20, 'chems').setScale(0.18);
    this.add(this._sprite);

    this._bat = scene.add.image(24, -30, 'mazo').setScale(0.12).setAngle(-30).setAlpha(0);
    this.add(this._bat);

    this.setDepth(isoDepth(col, row) + 0.5);
    scene.add.existing(this);

    this._cursors = scene.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  handleInput() {
    const { up, down, left, right } = this._cursors;
    let dc = 0, dr = 0;
    if (Phaser.Input.Keyboard.JustDown(left))  dc -= 1;
    if (Phaser.Input.Keyboard.JustDown(right)) dc += 1;
    if (Phaser.Input.Keyboard.JustDown(up))    dr -= 1;
    if (Phaser.Input.Keyboard.JustDown(down))  dr += 1;
    if (dc !== 0 || dr !== 0) this._tryMove(dc, dr);
  }

  _tryMove(dc, dr) {
    const newCol = this.col + dc;
    const newRow = this.row + dr;
    if (this._getBlocks().some(b => b.col === newCol && b.row === newRow)) return;
    this.col = newCol;
    this.row = newRow;
    const { x, y } = tileToScreen(this.col, this.row, this._originX, this._originY);
    this.scene.tweens.add({ targets: this, x, y, duration: 80, ease: 'Power1' });
    this.setDepth(isoDepth(this.col, this.row) + 0.5);
  }

  swingBat(onComplete) {
    this._bat.setAlpha(1).setAngle(-60);
    this.scene.tweens.add({
      targets: this._bat, angle: 30, duration: 150, ease: 'Power2',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this._bat, alpha: 0, duration: 80,
          onComplete,
        });
      },
    });
  }
}
