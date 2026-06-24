import Phaser from 'phaser';

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    this.add.text(400, 300, 'BONK — Loading…', {
      fontFamily: 'Impact, sans-serif', fontSize: '32px', color: '#FFD700',
    }).setOrigin(0.5);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#0d0d1a',
  scene: [BootScene],
  parent: document.body,
});
