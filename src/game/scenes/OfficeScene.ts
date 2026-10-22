import { OFFICE_LAYOUT, OFFICE_ORIGIN } from '@/data/rooms';
import { buildRoom } from '@/scenes/buildRoom';
import type Phaser from 'phaser';

/** Room-builder module for the continuous L-world, composed by LivingRoomScene. */
export function buildOffice(
  scene: Phaser.Scene,
  solids: Phaser.Physics.Arcade.StaticGroup,
): void {
  buildRoom(scene, solids, OFFICE_LAYOUT, OFFICE_ORIGIN);
}
