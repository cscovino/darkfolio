import { ROOM_H, ROOM_W, TILE } from '@/data/rooms';
import type { RoomLayout } from '@/data/rooms';
import type Phaser from 'phaser';

type Origin = { x: number; y: number };

/** Draws one room's floor grid, walls, solids and decor at a house origin. */
export function buildRoom(
  scene: Phaser.Scene,
  solids: Phaser.Physics.Arcade.StaticGroup,
  layout: RoomLayout,
  origin: Origin,
): void {
  const g = scene.add.graphics();
  for (let row = 0; row < ROOM_H; row++) {
    for (let col = 0; col < ROOM_W; col++) {
      g.fillStyle((row + col) % 2 === 0 ? layout.floorA : layout.floorB);
      g.fillRect(origin.x + col * TILE, origin.y + row * TILE, TILE, TILE);
    }
  }
  for (const [x, y, w, h] of layout.walls) {
    solids.add(
      scene.add.rectangle(origin.x + x, origin.y + y, w, h, layout.wall),
    );
  }
  for (const [x, y, w, h, color] of layout.solids) {
    solids.add(scene.add.rectangle(origin.x + x, origin.y + y, w, h, color));
  }
  for (const [x, y, w, h, color] of layout.decor) {
    scene.add.rectangle(origin.x + x, origin.y + y, w, h, color);
  }
}
