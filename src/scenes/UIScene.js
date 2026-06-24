import Phaser from 'phaser';

function readBest() {
  try { return parseInt(localStorage.getItem('bonk_best') ?? '0', 10) || 0; }
  catch { return 0; }
}

export class UIScene extends Phaser.Scene {
  constructor() { super('UI'); }

  create() {
    const game = this.scene.get('Game');
    const { width, height } = this.scale;

    // — Score & wave info (top-left)
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

    // — Timer & best score (top-right)
    this._timerTxt = this.add.text(width - 16, 16, '60', {
      fontFamily: 'Impact, sans-serif', fontSize: '36px',
      color: '#ffffff', stroke: '#000', strokeThickness: 3,
    }).setOrigin(1, 0);
    this._bestTxt = this.add.text(width - 16, 58, `BEST: ${readBest().toLocaleString()}`, {
      fontFamily: 'Impact, sans-serif', fontSize: '14px',
      color: '#666666', stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0);

    // — Energy bar (bottom-center)
    const barW = 480, barH = 18;
    const barX = (width - barW) / 2;
    const barY = height - 36;
    this._barW = barW;

    this.add.text(width / 2, barY - 2, 'ENERGY', {
      fontFamily: 'Impact, sans-serif', fontSize: '12px', color: '#aaa',
    }).setOrigin(0.5, 1);
    this._energyBg   = this.add.rectangle(width / 2, barY, barW, barH, 0x222222).setOrigin(0.5, 0);
    this._energyFill = this.add.rectangle(barX, barY, 0, barH, 0xDAA520).setOrigin(0, 0);
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

    // — Doge wave golden tint
    this._dogeTint = this.add.rectangle(width / 2, height / 2, width, height, 0xDAA520, 0)
      .setDepth(2900);

    // — Doge wave banner
    this._dogeBanner = this.add.text(width / 2, height / 2, 'DOGE WAVE\nWOW.', {
      fontFamily: 'Impact, sans-serif', fontSize: '64px',
      color: '#DAA520', stroke: '#000', strokeThickness: 6, align: 'center',
    }).setOrigin(0.5).setAlpha(0).setDepth(3000);

    // — Wave intro banner
    this._waveBanner = this.add.text(width / 2, height / 2 - 40, '', {
      fontFamily: 'Impact, sans-serif', fontSize: '80px',
      color: '#ffffff', stroke: '#000', strokeThickness: 7,
    }).setOrigin(0.5).setAlpha(0).setDepth(2800);

    // — Combo text
    this._comboTxt = this.add.text(width / 2, height / 2 - 120, '', {
      fontFamily: 'Impact, sans-serif', fontSize: '52px',
      color: '#FF4400', stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5).setAlpha(0).setDepth(2500);

    // — Pause overlay
    this._pauseOverlay = this.add.container(0, 0).setAlpha(0).setDepth(4000);
    const pauseBg   = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75);
    const pauseTxt  = this.add.text(width / 2, height / 2 - 20, 'PAUSA', {
      fontFamily: 'Impact, sans-serif', fontSize: '72px',
      color: '#FFD700', stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5);
    const pauseHint = this.add.text(width / 2, height / 2 + 50, 'ESC para continuar', {
      fontFamily: 'Impact, sans-serif', fontSize: '22px',
      color: '#ffffff', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5);
    this._pauseOverlay.add([pauseBg, pauseTxt, pauseHint]);

    this._paused = false;
    this._escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // — Event listeners
    game.events.on('scoreChanged', score => {
      this._scoreTxt.setText(`SCORE: ${score.toLocaleString()}`);
      const best = readBest();
      if (score > 0 && score >= best) {
        this._bestTxt.setText(`BEST: ${score.toLocaleString()}`).setStyle({ color: '#FFD700' });
      }
    });
    game.events.on('waveChanged', wave => {
      this._waveTxt.setText(`WAVE ${wave}`);
      this._showWaveBanner(`WAVE ${wave}`);
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
        targets: this._energyFill, alpha: 0.2, duration: 60, yoyo: true, repeat: 2,
        onComplete: () => this._energyFill.setAlpha(1),
      });
    });
    game.events.on('charging', isCharging => {
      this._chargeBar.setAlpha(isCharging ? 1 : 0).setSize(0, 8);
      this._isCharging = isCharging;
    });
    game.events.on('dogWave', () => {
      this._dogeBanner.setAlpha(1);
      this.tweens.add({ targets: this._dogeTint, alpha: 0.13, duration: 600 });
      this.tweens.add({ targets: this._dogeTint, alpha: 0, duration: 1500, delay: 3500 });
      this.tweens.add({ targets: this._dogeBanner, alpha: 0, duration: 2000, delay: 1000 });
    });
    game.events.on('combo', combo => this._showCombo(combo));
  }

  _showWaveBanner(text) {
    this.tweens.killTweensOf(this._waveBanner);
    this._waveBanner.setText(text).setAlpha(1).setScale(0.5);
    this.tweens.add({
      targets: this._waveBanner, scale: 1.15, alpha: 1,
      duration: 280, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: this._waveBanner, alpha: 0, scale: 1.3, duration: 500, delay: 500 });
      },
    });
  }

  _showCombo(combo) {
    const labels = {
      3: '3× COMBO!', 5: '5× COMBO!!', 8: 'ULTRA BONK!!!',
      10: 'SUCH COMBO WOW', 15: 'IMPOSSIBLE???',
    };
    const label = combo >= 15 ? `${combo}× OMG WOW`
      : labels[combo] ?? null;
    if (!label) return;

    this.tweens.killTweensOf(this._comboTxt);
    this._comboTxt.setText(label).setAlpha(1).setScale(0.7);
    this.tweens.add({
      targets: this._comboTxt, scale: 1.1, duration: 200, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: this._comboTxt, alpha: 0, duration: 700, delay: 700 });
      },
    });
  }

  _togglePause() {
    this._paused = !this._paused;
    if (this._paused) {
      this.scene.pause('Game');
      this._pauseOverlay.setAlpha(1);
    } else {
      this.scene.resume('Game');
      this._pauseOverlay.setAlpha(0);
    }
  }

  update(time, delta) {
    if (Phaser.Input.Keyboard.JustDown(this._escKey)) this._togglePause();
    if (!this._paused && this._isCharging) {
      const w = Math.min(this._barW, (this._chargeBar.width || 0) + delta * (this._barW / 1500));
      this._chargeBar.setSize(w, 8);
    }
  }
}
