import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#0d0d1a',
  scene: [MenuScene],
  parent: document.body,
});
