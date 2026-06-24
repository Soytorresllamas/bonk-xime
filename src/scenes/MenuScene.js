import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  preload() {
    this.load.image('chems', '/assets/chems.png');
  }

  create() {
    const { width, height } = this.scale;
    const isGameOver = this.registry.get('gameOver') ?? false;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0d0d1a);

    this.add.image(width / 2, height / 2 - 20, 'chems')
      .setScale(0.5)
      .setAlpha(isGameOver ? 0.6 : 1.0);

    this.add.text(width / 2, 60, 'BONK', {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '80px', color: '#FFD700',
      stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5);

    if (isGameOver) {
      const score = this.registry.get('finalScore') ?? 0;
      const best  = this.registry.get('bestScore')  ?? 0;
      const wave  = this.registry.get('finalWave')  ?? 1;

      this.add.text(width / 2, height - 220,
        `WAVE ${wave}\nscore: ${score.toLocaleString()}\nbest: ${best.toLocaleString()}\nvery gg. wow.`, {
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: '22px', color: '#ff4422',
          stroke: '#000', strokeThickness: 3,
          align: 'center',
        }).setOrigin(0.5);
    }

    const btnLabel = isGameOver ? 'BONK AGAIN' : 'SUCH START';
    const btn = this.add.text(width / 2, height - 60, btnLabel, {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '32px', color: '#ffffff',
      stroke: '#000', strokeThickness: 4,
      backgroundColor: '#ff4422',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ color: '#FFD700' }));
    btn.on('pointerout',  () => btn.setStyle({ color: '#ffffff' }));
    btn.on('pointerdown', () => {
      this.registry.set('gameOver', false);
      this.scene.start('Game');
      this.scene.launch('UI');
    });

    const instrStyle = {
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontSize: '14px', color: '#aaaaaa',
      stroke: '#000', strokeThickness: 2,
      align: 'center',
    };

    this.add.text(width / 2, height - 22,
      'WASD mover  ·  K bonk  ·  Q chain bonk (40⚡)  ·  mantén E power bonk (80⚡)',
      instrStyle).setOrigin(0.5, 1);
  }
}
