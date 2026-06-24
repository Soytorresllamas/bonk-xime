import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  constructor() { super('UI'); }

  create() {
    const game = this.scene.get('Game');
    const { width, height } = this.scale;

    this._scoreTxt = this.add.text(16, 16, 'SCORE: 0', {
      fontFamily: 'Impact, sans-serif', fontSize: '22px',
      color: '#FFD700', stroke: '#000', strokeThickness: 3,
    });

    this._waveTxt = this.add.text(16, 44, 'WAVE 1', {
      fontFamily: 'Impact, sans-serif', fontSize: '18px',
      color: '#ffffff', stroke: '#000', strokeThickness: 2,
    });

    this._blocksTxt = this.add.text(16, 68, '', {
      fontFamily: 'Impact, sans-serif', fontSize: '14px',
      color: '#aaaaaa', stroke: '#000', strokeThickness: 2,
    });

    this._timerTxt = this.add.text(width - 16, 16, '60', {
      fontFamily: 'Impact, sans-serif', fontSize: '36px',
      color: '#ffffff', stroke: '#000', strokeThickness: 3,
    }).setOrigin(1, 0);

    const barW = 480, barH = 18;
    const barX = (width - barW) / 2;
    const barY = height - 36;
    this._barW = barW;

    this.add.text(width / 2, barY - 2, 'ENERGY', {
      fontFamily: 'Impact, sans-serif', fontSize: '12px',
      color: '#aaa',
    }).setOrigin(0.5, 1);

    this._energyBg = this.add.rectangle(width / 2, barY, barW, barH, 0x222222)
      .setOrigin(0.5, 0);
    this._energyFill = this.add.rectangle(barX, barY, 0, barH, 0xDAA520)
      .setOrigin(0, 0);

    this.add.text(barX + barW * 0.4, barY + barH + 2, 'CHAIN', {
      fontFamily: 'Impact, sans-serif', fontSize: '10px', color: '#00ccff',
    }).setOrigin(0.5, 0);
    this.add.text(barX + barW * 0.8, barY + barH + 2, 'POWER', {
      fontFamily: 'Impact, sans-serif', fontSize: '10px', color: '#FF4400',
    }).setOrigin(0.5, 0);
    this.add.rectangle(barX + barW * 0.4, barY, 2, barH, 0x00ccff).setOrigin(0.5, 0);
    this.add.rectangle(barX + barW * 0.8, barY, 2, barH, 0xFF4400).setOrigin(0.5, 0);

    this._chargeBar = this.add.rectangle(width / 2, barY - 14, 0, 8, 0xff4400)
      .setOrigin(0.5, 0).setAlpha(0);

    this._dogeBanner = this.add.text(width / 2, height / 2, 'DOGE WAVE\nWOW.', {
      fontFamily: 'Impact, sans-serif', fontSize: '64px',
      color: '#DAA520', stroke: '#000', strokeThickness: 6,
      align: 'center',
    }).setOrigin(0.5).setAlpha(0).setDepth(3000);

    game.events.on('scoreChanged', score => {
      this._scoreTxt.setText(`SCORE: ${score.toLocaleString()}`);
    });
    game.events.on('waveChanged', wave => {
      this._waveTxt.setText(`WAVE ${wave}`);
    });
    game.events.on('timerChanged', secs => {
      this._timerTxt.setText(String(Math.ceil(secs)));
      this._timerTxt.setStyle({ color: secs <= 10 ? '#ff4422' : '#ffffff' });
    });
    game.events.on('blocksChanged', count => {
      this._blocksTxt.setText(`${count} bloque${count !== 1 ? 's' : ''}`);
    });
    game.events.on('energyChanged', fraction => {
      this._energyFill.setSize(this._barW * fraction, 18);
    });
    game.events.on('noEnergy', () => {
      this.tweens.add({
        targets: this._energyFill,
        alpha: 0.2, duration: 60, yoyo: true, repeat: 2,
        onComplete: () => this._energyFill.setAlpha(1),
      });
    });
    game.events.on('charging', isCharging => {
      this._chargeBar.setAlpha(isCharging ? 1 : 0).setSize(0, 8);
      this._isCharging = isCharging;
    });
    game.events.on('dogWave', () => {
      this._dogeBanner.setAlpha(1);
      this.tweens.add({
        targets: this._dogeBanner,
        alpha: 0, duration: 2000, delay: 1000,
      });
    });
  }

  update(time, delta) {
    if (this._isCharging) {
      const w = Math.min(this._barW, (this._chargeBar.width || 0) + delta * (this._barW / 1500));
      this._chargeBar.setSize(w, 8);
    }
  }
}
