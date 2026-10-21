import {
  DOORS,
  LIVING_LAYOUT,
  LIVING_ORIGIN,
  ROOM_H,
  ROOM_W,
  ROOM_ZONES,
  SPAWN_X,
  SPAWN_Y,
  TILE,
  WORLD_H,
  WORLD_W,
  YARD_LAYOUT,
} from '@/data/rooms';
import { setCurrentRoom, setCurrentRoomFrom } from '@/game/state/currentRoom';
import { Player, ensurePlayerTexture } from '@/objects/Player';
import { buildBedroom } from '@/scenes/BedroomScene';
import { buildOffice } from '@/scenes/OfficeScene';
import { buildRoom } from '@/scenes/buildRoom';
import { roomAt } from '@/systems/currentRoom';
import {
  GLIDE_EASE,
  GLIDE_MS,
  glideEnd,
  triggeredSide,
} from '@/systems/doorGlide';
import type { DoorDef, DoorSide } from '@/systems/doorGlide';
import Phaser from 'phaser';

export { TILE, ROOM_W, ROOM_H, WORLD_W, WORLD_H, SPAWN_X, SPAWN_Y };

export class LivingRoomScene extends Phaser.Scene {
  private player!: Player;
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private gliding = false;

  constructor() {
    super('LivingRoomScene');
  }

  create(): void {
    setCurrentRoom('living');

    this.solids = this.physics.add.staticGroup();
    this.drawYard();
    buildRoom(this, this.solids, LIVING_LAYOUT, LIVING_ORIGIN);
    buildOffice(this, this.solids);
    buildBedroom(this, this.solids);

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
    if (this.gliding) return;

    const keys = {
      left: this.cursors.left.isDown || this.wasd.A.isDown,
      right: this.cursors.right.isDown || this.wasd.D.isDown,
      up: this.cursors.up.isDown || this.wasd.W.isDown,
      down: this.cursors.down.isDown || this.wasd.S.isDown,
    };
    this.player.handleInput(keys);

    const hit = triggeredSide(
      DOORS,
      { x: this.player.x, y: this.player.y },
      this.player.getFacing(),
      keys,
    );
    if (hit) {
      this.startGlide(hit.door, hit.side);
      return;
    }
    setCurrentRoomFrom(
      roomAt(ROOM_ZONES, { x: this.player.x, y: this.player.y }),
    );
  }

  private drawYard(): void {
    const g = this.add.graphics();
    const [gx, gy, gw, gh, gc] = YARD_LAYOUT.ground;
    g.fillStyle(gc, 1);
    g.fillRect(gx - gw / 2, gy - gh / 2, gw, gh);
    for (const [x, y, w, h, color] of YARD_LAYOUT.patches) {
      g.fillStyle(color, 1);
      g.fillRect(x - w / 2, y - h / 2, w, h);
    }
    for (const [x, y, w, h, color] of YARD_LAYOUT.props) {
      this.add.rectangle(x, y, w, h, color);
    }
  }

  private startGlide(door: DoorDef, side: DoorSide): void {
    this.gliding = true;
    this.player.setVelocity(0, 0);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    this.player.setFacing(side.dir);

    const end = glideEnd(door.axis, side.dir);
    this.tweens.add({
      targets: this.player,
      x: end.x,
      y: end.y,
      duration: GLIDE_MS,
      ease: GLIDE_EASE,
      onComplete: () => {
        body.reset(end.x, end.y);
        body.enable = true;
        setCurrentRoom(side.dest);
        this.gliding = false;
      },
    });
  }
}
