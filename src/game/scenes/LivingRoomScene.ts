import { Player, ensurePlayerTexture } from '@/objects/Player';
import Phaser from 'phaser';

export const TILE = 16;
export const ROOM_W = 20;
export const ROOM_H = 15;
export const WORLD_W = ROOM_W * TILE;
export const WORLD_H = ROOM_H * TILE;
export const SPAWN_X = 160;
export const SPAWN_Y = 208;

const WALL = 0x2a2a2a;
const FLOOR_A = 0x4a3729;
const FLOOR_B = 0x6b4e3d;
const THRESHOLD = 0x8b6f5e;
const COUCH = 0x8b6f5e;
const METAL = 0x555555;
const TV_CASING = 0x3d3d3d;
const TV_SCREEN = 0x6b8fbf;
const LAMP_GLOW = 0xffa500;

export class LivingRoomScene extends Phaser.Scene {
  private player!: Player;
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

  constructor() {
    super('LivingRoomScene');
  }

  create(): void {
    this.drawFloor();

    this.solids = this.physics.add.staticGroup();
    const walls = [
      [WORLD_W / 2, TILE / 2, WORLD_W, TILE],
      [WORLD_W / 2, WORLD_H - TILE / 2, WORLD_W, TILE],
      [TILE / 2, 56, TILE, 80],
      [TILE / 2, 176, TILE, 96],
      [WORLD_W - TILE / 2, 56, TILE, 80],
      [WORLD_W - TILE / 2, 176, TILE, 96],
    ];
    for (const [x, y, w, h] of walls) {
      this.solid(x, y, w, h, WALL);
    }

    // Door gaps: visual thresholds only — the wall is not cut here.
    this.add.rectangle(TILE / 2, 112, TILE, 32, THRESHOLD);
    this.add.rectangle(WORLD_W - TILE / 2, 112, TILE, 32, THRESHOLD);

    this.solid(152, 24, 16, 16, TV_CASING);
    this.add.rectangle(152, 24, 12, 8, TV_SCREEN);
    this.solid(160, 56, 32, 16, METAL);
    this.solid(152, 88, 48, 16, COUCH);
    this.solid(200, 88, 16, 16, METAL);
    this.add.rectangle(200, 84, 8, 8, LAMP_GLOW);

    ensurePlayerTexture(this);
    this.player = new Player(this, SPAWN_X, SPAWN_Y);
    this.physics.add.collider(this.player, this.solids);
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD_W, WORLD_H);
    cam.setZoom(4);
    cam.startFollow(this.player, true, 0.05, 0.05);

    const kb = this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
    this.cursors = kb.createCursorKeys();
    this.wasd = kb.addKeys('W,A,S,D') as LivingRoomScene['wasd'];
  }

  update(): void {
    this.player.handleInput({
      left: this.cursors.left.isDown || this.wasd.A.isDown,
      right: this.cursors.right.isDown || this.wasd.D.isDown,
      up: this.cursors.up.isDown || this.wasd.W.isDown,
      down: this.cursors.down.isDown || this.wasd.S.isDown,
    });
  }

  private drawFloor(): void {
    const g = this.add.graphics();
    for (let row = 0; row < ROOM_H; row++) {
      for (let col = 0; col < ROOM_W; col++) {
        g.fillStyle((row + col) % 2 === 0 ? FLOOR_A : FLOOR_B);
        g.fillRect(col * TILE, row * TILE, TILE, TILE);
      }
    }
  }

  private solid(
    x: number,
    y: number,
    w: number,
    h: number,
    color: number,
  ): void {
    this.solids.add(this.add.rectangle(x, y, w, h, color));
  }
}
