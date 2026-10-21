import {
  OFFICE_LAYOUT,
  OFFICE_ORIGIN,
  ROOM_H,
  ROOM_W,
  TILE,
} from '@/data/rooms';
import type Phaser from 'phaser';

/** Room-builder module for the continuous L-world, composed by LivingRoomScene. */
export function buildOffice(
  scene: Phaser.Scene,
  solids: Phaser.Physics.Arcade.StaticGroup,
): void {
  const g = scene.add.graphics();
  for (let row = 0; row < ROOM_H; row++) {
    for (let col = 0; col < ROOM_W; col++) {
      g.fillStyle(
        (row + col) % 2 === 0 ? OFFICE_LAYOUT.floorA : OFFICE_LAYOUT.floorB,
      );
      g.fillRect(
        OFFICE_ORIGIN.x + col * TILE,
        OFFICE_ORIGIN.y + row * TILE,
        TILE,
        TILE,
      );
    }
  }
  for (const [x, y, w, h] of OFFICE_LAYOUT.walls) {
    solids.add(
      scene.add.rectangle(
        OFFICE_ORIGIN.x + x,
        OFFICE_ORIGIN.y + y,
        w,
        h,
        OFFICE_LAYOUT.wall,
      ),
    );
  }
  for (const [x, y, w, h, color] of OFFICE_LAYOUT.solids) {
    solids.add(
      scene.add.rectangle(
        OFFICE_ORIGIN.x + x,
        OFFICE_ORIGIN.y + y,
        w,
        h,
        color,
      ),
    );
  }
  for (const [x, y, w, h, color] of OFFICE_LAYOUT.decor) {
    scene.add.rectangle(OFFICE_ORIGIN.x + x, OFFICE_ORIGIN.y + y, w, h, color);
  }
}
