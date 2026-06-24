import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  width: 1024,
  height: 720,
  backgroundColor: '#0d0d1a',
  scene: [MenuScene, GameScene, UIScene],
  parent: document.body,
});
