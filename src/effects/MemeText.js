export function spawnMemeText(scene, x, y, text, color = '#FFD700') {
  const t = scene.add.text(x, y, text, {
    fontFamily: 'Impact, Arial Black, sans-serif',
    fontSize: '18px',
    color,
    stroke: '#000000',
    strokeThickness: 3,
  }).setOrigin(0.5, 0.5).setDepth(2000);

  scene.tweens.add({
    targets: t,
    y: y - 70,
    alpha: 0,
    duration: 1200,
    ease: 'Power2',
    onComplete: () => t.destroy(),
  });
}

export function spawnBlockParticles(scene, x, y, color) {
  for (let i = 0; i < 8; i++) {
    const p = scene.add.rectangle(x, y, 6, 6, color).setDepth(1999);
    const angle = (i / 8) * Math.PI * 2;
    const speed = Phaser.Math.Between(40, 90);
    scene.tweens.add({
      targets: p,
      x: x + Math.cos(angle) * speed,
      y: y + Math.sin(angle) * speed,
      alpha: 0,
      duration: Phaser.Math.Between(400, 700),
      ease: 'Power2',
      onComplete: () => p.destroy(),
    });
  }
}
