import Phaser from 'phaser';

function readBest() {
  try { return parseInt(localStorage.getItem('bonk_best') ?? '0', 10) || 0; }
  catch { return 0; }
}

export class UIScene extends Phaser.Scene {
  constructor() { super('UI'); }

  create() {
    const game = this.scene.get('Game');
    this._game = game;
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

    // — ×2 multiplier badge (next to score)
    this._multiBadge = this.add.text(210, 20, '×2', {
      fontFamily: 'Impact, sans-serif', fontSize: '20px',
      color: '#00ccff', stroke: '#000', strokeThickness: 3,
    }).setAlpha(0);

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

    // — NEW BEST banner
    this._newBestTxt = this.add.text(width / 2, height / 2 + 130, '✨ NEW BEST! ✨', {
      fontFamily: 'Impact, sans-serif', fontSize: '38px',
      color: '#FFD700', stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5).setAlpha(0).setDepth(2600);

    // — Wave clear celebration
    this._waveClearTxt = this.add.text(width / 2, height / 2 + 50, 'WAVE CLEAR!', {
      fontFamily: 'Impact, sans-serif', fontSize: '68px',
      color: '#00ff88', stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0).setDepth(2700);

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
    const ctrlStyle = { fontFamily: 'Impact, sans-serif', stroke: '#000', strokeThickness: 2, align: 'center' };
    const pauseCtrl1 = this.add.text(width / 2, height / 2 + 110,
      'WASD mover   ·   K bonk   ·   Q chain bonk (40⚡)   ·   ESC pausa',
      { ...ctrlStyle, fontSize: '16px', color: '#dddddd' }).setOrigin(0.5);
    const pauseCtrl2 = this.add.text(width / 2, height / 2 + 138,
      'mantén E (1.5 s) → power bonk (80⚡)   ·   golpear bloques recarga energía ⚡',
      { ...ctrlStyle, fontSize: '14px', color: '#999999' }).setOrigin(0.5);
    this._pauseOverlay.add([pauseBg, pauseTxt, pauseHint, pauseCtrl1, pauseCtrl2]);

    this._paused = false;
    this._newBestShown = false;
    this._lastTimerCeil = null;
    this._joyDc = 0;
    this._joyDr = 0;
    this._lastJoyMove = 0;
    this._escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    const isMobile = this.sys.game.device.input.touch;
    if (!isMobile) this._buildControlsPanel();
    if (isMobile)  this._buildMobileControls();

    // — Event listeners
    game.events.on('scoreChanged', score => {
      this._scoreTxt.setText(`SCORE: ${score.toLocaleString()}`);
      const best = readBest();
      if (score > 0 && score >= best) {
        this._bestTxt.setText(`BEST: ${score.toLocaleString()}`).setStyle({ color: '#FFD700' });
        if (!this._newBestShown) {
          this._newBestShown = true;
          this._showNewBest();
        }
      }
    });
    game.events.on('waveChanged', wave => {
      this._waveTxt.setText(`WAVE ${wave}`);
      this._showWaveBanner(`WAVE ${wave}`);
    });
    game.events.on('timerChanged', secs => {
      const ceiled = Math.ceil(secs);
      this._timerTxt.setText(String(ceiled));
      this._timerTxt.setStyle({ color: secs <= 10 ? '#ff4422' : '#ffffff' });
      if (secs <= 10 && ceiled !== this._lastTimerCeil) {
        this._lastTimerCeil = ceiled;
        this._timerTxt.setScale(1.35);
        this.tweens.add({ targets: this._timerTxt, scale: 1, duration: 220, ease: 'Back.easeOut' });
      }
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
    game.events.on('waveClear', () => this._showWaveClear());
    game.events.on('timerPenalty', () => {
      this.tweens.add({
        targets: this._timerTxt, alpha: 0.15, duration: 70,
        yoyo: true, repeat: 3,
        onComplete: () => { if (this._timerTxt.active) this._timerTxt.setAlpha(1); },
      });
    });
    game.events.on('multiplierActive', durationMs => {
      this.tweens.killTweensOf(this._multiBadge);
      this._multiBadge.setAlpha(1).setScale(1);
      this.tweens.add({
        targets: this._multiBadge, scale: 1.2, duration: 300,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      this.time.delayedCall(durationMs, () => {
        this.tweens.killTweensOf(this._multiBadge);
        this.tweens.add({ targets: this._multiBadge, alpha: 0, duration: 400 });
      });
    });
  }

  _buildMobileControls() {
    const { width, height } = this.scale;
    const game = this._game;
    this.input.addPointer(3);

    // ── Joystick ─────────────────────────────────────────────────────────────
    const joyX = 140, joyY = height - 140;
    const baseR = 72, thumbR = 32, deadZ = 18;

    const joyGfx = this.add.graphics().setDepth(200).setAlpha(0.85);
    const drawJoy = (tx = 0, ty = 0) => {
      joyGfx.clear();
      joyGfx.fillStyle(0x1a1a3a, 0.55);
      joyGfx.fillCircle(joyX, joyY, baseR);
      joyGfx.lineStyle(2, 0x7777cc, 0.7);
      joyGfx.strokeCircle(joyX, joyY, baseR);
      // cardinal ticks
      [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy]) => {
        const tx2 = joyX + dx * (baseR - 12), ty2 = joyY + dy * (baseR - 12);
        joyGfx.fillStyle(0x9999dd, 0.5);
        joyGfx.fillCircle(tx2, ty2, 4);
      });
      joyGfx.fillStyle(0x6666bb, 0.9);
      joyGfx.fillCircle(joyX + tx, joyY + ty, thumbR);
      joyGfx.lineStyle(2, 0xbbbbff, 1);
      joyGfx.strokeCircle(joyX + tx, joyY + ty, thumbR);
    };
    drawJoy();

    this._joyPointer = null;
    const updateJoy = ptr => {
      const dx = ptr.x - joyX, dy = ptr.y - joyY;
      const dist = Math.hypot(dx, dy);
      if (dist < deadZ) { this._joyDc = 0; this._joyDr = 0; drawJoy(); return; }
      const angle = Math.atan2(dy, dx);
      const clamp = Math.min(dist, baseR - 10);
      drawJoy(Math.cos(angle) * clamp, Math.sin(angle) * clamp);
      const deg = ((angle * 180 / Math.PI) + 360) % 360;
      if      (deg >= 315 || deg <  45) { this._joyDc =  1; this._joyDr =  0; }
      else if (deg >=  45 && deg < 135) { this._joyDc =  0; this._joyDr =  1; }
      else if (deg >= 135 && deg < 225) { this._joyDc = -1; this._joyDr =  0; }
      else                               { this._joyDc =  0; this._joyDr = -1; }
      // Fire first move immediately for responsiveness
      if (this._joyDc !== 0 || this._joyDr !== 0) {
        const now = this.time.now;
        if (now - this._lastJoyMove > 165) {
          this._lastJoyMove = now;
          game.events.emit('vjoyMove', { dc: this._joyDc, dr: this._joyDr });
        }
      }
    };

    // ── Action buttons ────────────────────────────────────────────────────────
    const bonkX = width - 88,  bonkY = height - 120;
    const chainX = width - 200, chainY = height - 110;
    const powerX = width - 128, powerY = height - 245;

    const btnGfx = this.add.graphics().setDepth(200);
    const drawBtns = (bonkP = false, chainP = false, powerP = false) => {
      btnGfx.clear();
      // BONK
      btnGfx.fillStyle(bonkP ? 0xff8866 : 0xbb1100, 0.88);
      btnGfx.fillCircle(bonkX, bonkY, 54);
      btnGfx.lineStyle(2, 0xff6644, 1);
      btnGfx.strokeCircle(bonkX, bonkY, 54);
      // CHAIN
      btnGfx.fillStyle(chainP ? 0x66aaff : 0x0044aa, 0.82);
      btnGfx.fillCircle(chainX, chainY, 38);
      btnGfx.lineStyle(2, 0x4488ff, 1);
      btnGfx.strokeCircle(chainX, chainY, 38);
      // POWER
      btnGfx.fillStyle(powerP ? 0xffcc44 : 0xaa5500, 0.82);
      btnGfx.fillCircle(powerX, powerY, 38);
      btnGfx.lineStyle(2, 0xff9922, 1);
      btnGfx.strokeCircle(powerX, powerY, 38);
    };
    drawBtns();

    const bTxt = { fontFamily: 'Impact, sans-serif', stroke: '#000', strokeThickness: 3 };
    this.add.text(bonkX,  bonkY,  'BONK',  { ...bTxt, fontSize: '17px', color: '#ffffff' }).setOrigin(0.5).setDepth(201);
    this.add.text(chainX, chainY, 'Q\nchain\n40⚡', { ...bTxt, fontSize: '11px', color: '#aaddff', align: 'center' }).setOrigin(0.5).setDepth(201);
    this.add.text(powerX, powerY, 'E hold\npower\n80⚡',  { ...bTxt, fontSize: '11px', color: '#ffdd88', align: 'center' }).setOrigin(0.5).setDepth(201);

    // Pausa button (top-center, no ESC key on mobile)
    const pBtn = this.add.text(width / 2, 6, '⏸ PAUSA', {
      fontFamily: 'Impact, sans-serif', fontSize: '16px',
      color: '#aaaaaa', stroke: '#000', strokeThickness: 2,
      backgroundColor: '#00000066', padding: { x: 10, y: 4 },
    }).setOrigin(0.5, 0).setDepth(201).setInteractive();
    pBtn.on('pointerdown', () => this._togglePause());

    // ── Unified pointer handlers ──────────────────────────────────────────────
    this._powerPtr = null;

    this.input.on('pointerdown', ptr => {
      if (this._paused) return;
      // Joystick?
      if (!this._joyPointer && Phaser.Math.Distance.Between(ptr.x, ptr.y, joyX, joyY) < baseR + 24) {
        this._joyPointer = ptr; updateJoy(ptr); return;
      }
      // BONK?
      if (Phaser.Math.Distance.Between(ptr.x, ptr.y, bonkX, bonkY) < 64) {
        drawBtns(true); game.events.emit('vjoyBonk'); return;
      }
      // CHAIN?
      if (Phaser.Math.Distance.Between(ptr.x, ptr.y, chainX, chainY) < 48) {
        drawBtns(false, true); game.events.emit('vjoyChain'); return;
      }
      // POWER?
      if (Phaser.Math.Distance.Between(ptr.x, ptr.y, powerX, powerY) < 48) {
        this._powerPtr = ptr; drawBtns(false, false, true);
        game.events.emit('vjoyPowerStart'); return;
      }
    });

    this.input.on('pointermove', ptr => {
      if (ptr === this._joyPointer) updateJoy(ptr);
    });

    this.input.on('pointerup', ptr => {
      if (ptr === this._joyPointer) {
        this._joyPointer = null; this._joyDc = 0; this._joyDr = 0; drawJoy();
      } else if (ptr === this._powerPtr) {
        this._powerPtr = null; drawBtns(); game.events.emit('vjoyPowerEnd');
      } else {
        drawBtns();
      }
    });
  }

  _buildControlsPanel() {
    const px = 10, py = 202;
    const kw = 26, kh = 26, g = 3;
    const pad = 14;
    const ax = px + pad;           // A / ESC left edge
    const sx = ax + kw + g;        // S / W / K / Q / E center col
    const dx = sx + kw + g;        // D right col
    const escW = dx + kw - ax;     // ESC key width = span of A-S-D
    const descX = dx + kw + 8;     // description text left edge
    const pw = descX + 50 - px;    // panel width

    const gfx = this.add.graphics().setDepth(50);

    // Panel background + border
    gfx.fillStyle(0x050512, 0.86);
    gfx.fillRoundedRect(px, py, pw, 268, 8);
    gfx.lineStyle(1, 0x44449a, 0.8);
    gfx.strokeRoundedRect(px, py, pw, 268, 8);

    const drawKey = (kx, ky, w = kw, h = kh) => {
      gfx.fillStyle(0x040410, 1);
      gfx.fillRoundedRect(kx + 2, ky + 3, w, h, 4);     // shadow
      gfx.fillStyle(0x252548, 1);
      gfx.fillRoundedRect(kx, ky, w, h, 4);              // body
      gfx.fillStyle(0x6666aa, 0.35);
      gfx.fillRoundedRect(kx + 1, ky + 1, w - 2, 5,     // top highlight
        { tl: 3, tr: 3, bl: 0, br: 0 });
      gfx.lineStyle(1, 0x9999dd, 1);
      gfx.strokeRoundedRect(kx, ky, w, h, 4);            // border
    };

    const K = (x, y, label, w = kw) => {
      drawKey(x, y, w);
      this.add.text(x + w / 2, y + kh / 2, label, {
        fontFamily: 'Arial Black, Arial, sans-serif', fontSize: '13px',
        color: '#eeeeff', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(51);
    };

    const L = (x, y, label, color = '#cccccc', size = '13px', ox = 0, oy = 0.5) =>
      this.add.text(x, y, label, {
        fontFamily: 'Impact, sans-serif', fontSize: size,
        color, stroke: '#000', strokeThickness: 2,
      }).setOrigin(ox, oy).setDepth(51);

    // Header
    L(px + pw / 2, py + 11, 'CONTROLES', '#8888cc', '11px', 0.5, 0.5);
    gfx.lineStyle(1, 0x33338a, 0.6);
    gfx.lineBetween(px + 6, py + 22, px + pw - 6, py + 22);

    // — WASD —
    let ry = py + 30;
    K(sx, ry, 'W');
    ry += kh + g;
    K(ax, ry, 'A'); K(sx, ry, 'S'); K(dx, ry, 'D');
    L(descX, ry + kh / 2, 'mover');

    // — K bonk —
    ry += kh + 14;
    K(sx, ry, 'K');
    L(descX, ry + kh / 2, 'bonk');

    // — Q chain —
    ry += kh + 12;
    K(sx, ry, 'Q');
    L(descX, ry + kh / 2 - 7, 'chain');
    L(descX, ry + kh / 2 + 8, '40 ⚡', '#7777bb', '11px');

    // — E hold power —
    ry += kh + 16;
    K(sx, ry, 'E');
    L(sx + kw + 3, ry + kh - 4, 'hold', '#666688', '10px');
    L(descX, ry + kh / 2 - 7, 'power');
    L(descX, ry + kh / 2 + 8, '80 ⚡', '#7777bb', '11px');

    // — ESC pausa —
    ry += kh + 16;
    K(ax, ry, 'ESC', escW);
    L(descX, ry + kh / 2, 'pausa');
  }

  _showNewBest() {
    this.tweens.killTweensOf(this._newBestTxt);
    this._newBestTxt.setAlpha(1).setScale(0.6);
    this.tweens.add({
      targets: this._newBestTxt, scale: 1, duration: 300, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: this._newBestTxt, alpha: 0, duration: 800, delay: 1500 });
      },
    });
  }

  _showWaveClear() {
    this.tweens.killTweensOf(this._waveClearTxt);
    this._waveClearTxt.setAlpha(1).setScale(0.5);
    this.tweens.add({
      targets: this._waveClearTxt, scale: 1.1, duration: 250, ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: this._waveClearTxt, alpha: 0, scale: 1.3, duration: 600, delay: 400 });
      },
    });
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
    if (!this._paused && (this._joyDc !== 0 || this._joyDr !== 0) && time - this._lastJoyMove > 165) {
      this._lastJoyMove = time;
      this._game.events.emit('vjoyMove', { dc: this._joyDc, dr: this._joyDr });
    }
  }
}
