import {
  BEDROOM_LAYOUT,
  BEDROOM_ORIGIN,
  ROOM_H,
  ROOM_W,
  TILE,
} from '@/data/rooms';
import type Phaser from 'phaser';

/** Room-builder module for the continuous L-world, composed by LivingRoomScene. */
export function buildBedroom(
  scene: Phaser.Scene,
  solids: Phaser.Physics.Arcade.StaticGroup,
): void {
  const g = scene.add.graphics();
  for (let row = 0; row < ROOM_H; row++) {
    for (let col = 0; col < ROOM_W; col++) {
      g.fillStyle(
        (row + col) % 2 === 0 ? BEDROOM_LAYOUT.floorA : BEDROOM_LAYOUT.floorB,
      );
      g.fillRect(
        BEDROOM_ORIGIN.x + col * TILE,
        BEDROOM_ORIGIN.y + row * TILE,
        TILE,
        TILE,
      );
    }
  }
  for (const [x, y, w, h] of BEDROOM_LAYOUT.walls) {
    solids.add(
      scene.add.rectangle(
        BEDROOM_ORIGIN.x + x,
        BEDROOM_ORIGIN.y + y,
        w,
        h,
        BEDROOM_LAYOUT.wall,
      ),
    );
  }
  for (const [x, y, w, h, color] of BEDROOM_LAYOUT.solids) {
    solids.add(
      scene.add.rectangle(
        BEDROOM_ORIGIN.x + x,
        BEDROOM_ORIGIN.y + y,
        w,
        h,
        color,
      ),
    );
  }
  for (const [x, y, w, h, color] of BEDROOM_LAYOUT.decor) {
    scene.add.rectangle(
      BEDROOM_ORIGIN.x + x,
      BEDROOM_ORIGIN.y + y,
      w,
      h,
      color,
    );
  }
}
