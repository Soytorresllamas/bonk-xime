import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  preload() {
    this.load.image('chems', `${import.meta.env.BASE_URL}assets/chems.png`);
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
      const score = this.registry.get('finalScore')  ?? 0;
      const best  = this.registry.get('bestScore')   ?? 0;
      const wave  = this.registry.get('finalWave')   ?? 1;
      const top5  = this.registry.get('top5Scores')  ?? [];

      const newBest = score >= best && score > 0;
      this.add.text(width / 2, height - 230,
        `WAVE ${wave}  ·  ${score.toLocaleString()} pts\n` +
        (newBest ? '✨ NEW BEST! ✨' : `best: ${best.toLocaleString()}`) +
        '\nvery gg. wow.', {
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: '22px', color: newBest ? '#FFD700' : '#ff4422',
          stroke: '#000', strokeThickness: 3, align: 'center',
        }).setOrigin(0.5);

      if (top5.length > 0) {
        this.add.text(width - 24, 120, 'TOP BONKERS', {
          fontFamily: 'Impact, Arial Black, sans-serif', fontSize: '15px',
          color: '#FFD700', stroke: '#000', strokeThickness: 2,
        }).setOrigin(1, 0);
        top5.forEach((sc, i) => {
          this.add.text(width - 24, 142 + i * 26, `${i + 1}. ${sc.toLocaleString()}`, {
            fontFamily: 'Impact, Arial Black, sans-serif', fontSize: '15px',
            color: i === 0 ? '#FFD700' : '#aaaaaa',
            stroke: '#000', strokeThickness: 2,
          }).setOrigin(1, 0);
        });
      }
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
