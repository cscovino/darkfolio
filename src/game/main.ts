import { GateScene } from '@/scenes/GateScene';
import { LivingRoomScene } from '@/scenes/LivingRoomScene';
import Phaser from 'phaser';

export function createGame(parent: string): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 640,
    height: 480,
    backgroundColor: '#2A2A2A',
    pixelArt: true,
    physics: { default: 'arcade', arcade: { debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [GateScene, LivingRoomScene],
  });
}
