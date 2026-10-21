import type { Rect, RoomId, Vec } from './currentRoom';

export type Dir = 'up' | 'down' | 'left' | 'right';
export type DoorSide = { from: RoomId; dir: Dir; dest: RoomId };
export type DoorDef = {
  id: string;
  zone: Rect;
  gap: Rect;
  axis: Vec;
  sides: DoorSide[];
};

export const REACH = 16;
export const GLIDE_STEP = 48;
export const GLIDE_MS = 700;
export const GLIDE_EASE = 'Sine.easeInOut';

export function insideRect(rect: Rect, p: Vec): boolean {
  return (
    p.x >= rect.x &&
    p.x < rect.x + rect.w &&
    p.y >= rect.y &&
    p.y < rect.y + rect.h
  );
}

export function reachRect(zone: Rect, dir: Dir, reach = REACH): Rect {
  switch (dir) {
    case 'up':
      return { ...zone, h: zone.h + reach };
    case 'down':
      return { ...zone, y: zone.y - reach, h: zone.h + reach };
    case 'left':
      return { ...zone, w: zone.w + reach };
    case 'right':
      return { ...zone, x: zone.x - reach, w: zone.w + reach };
  }
}

export function glideEnd(axis: Vec, dir: Dir): Vec {
  switch (dir) {
    case 'up':
      return { x: axis.x, y: axis.y - GLIDE_STEP };
    case 'down':
      return { x: axis.x, y: axis.y + GLIDE_STEP };
    case 'left':
      return { x: axis.x - GLIDE_STEP, y: axis.y };
    case 'right':
      return { x: axis.x + GLIDE_STEP, y: axis.y };
  }
}

export function triggeredSide(
  doors: DoorDef[],
  pos: Vec,
  facing: Dir,
  keys: Record<Dir, boolean>,
): { door: DoorDef; side: DoorSide } | null {
  for (const door of doors) {
    for (const side of door.sides) {
      if (side.dir === facing && insideRect(door.zone, pos))
        return { door, side };
    }
  }
  for (const door of doors) {
    for (const side of door.sides) {
      if (keys[side.dir] && insideRect(reachRect(door.zone, side.dir), pos)) {
        return { door, side };
      }
    }
  }
  return null;
}
