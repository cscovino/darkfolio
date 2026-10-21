import type { KeyState } from '@/systems/movement';
import { velocityFromKeys } from '@/systems/movement';
import Phaser from 'phaser';

const PLAYER_TEX = '__PLAYER__';

type Facing = 'up' | 'down' | 'left' | 'right';

const FACINGS: readonly Facing[] = ['up', 'down', 'left', 'right'];
const NOTCH: Record<Facing, [number, number]> = {
  up: [12, 4],
  down: [12, 20],
  left: [4, 12],
  right: [20, 12],
};

const texKey = (facing: Facing): string =>
  `${PLAYER_TEX}_${facing.toUpperCase()}`;

export function ensurePlayerTexture(scene: Phaser.Scene): void {
  for (const facing of FACINGS) {
    const key = texKey(facing);
    if (scene.textures.exists(key)) continue;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0x4a5a4a);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x2a2a2a);
    g.fillRect(0, 0, 32, 2);
    g.fillRect(0, 30, 32, 2);
    g.fillRect(0, 2, 2, 28);
    g.fillRect(30, 2, 2, 28);
    g.fillStyle(0xffa500);
    g.fillRect(...NOTCH[facing], 8, 8);
    g.generateTexture(key, 32, 32);
    g.destroy();
  }
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  static readonly SPEED = 120;
  private facing: Facing = 'up';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, texKey('up'));
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
  }

  handleInput(keys: KeyState): void {
    const v = velocityFromKeys(keys, Player.SPEED);
    this.setVelocity(v.x, v.y);
    const next: Facing =
      v.y < 0
        ? 'up'
        : v.y > 0
          ? 'down'
          : v.x < 0
            ? 'left'
            : v.x > 0
              ? 'right'
              : this.facing;
    if (next !== this.facing) {
      this.facing = next;
      this.setTexture(texKey(next));
    }
  }
}
