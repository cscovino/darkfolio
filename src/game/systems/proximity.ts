import type { InteractableDef } from '../data/interactables';
import type { Rect, RoomId } from './currentRoom';

const REACH = 32;

function axisGaps(a: Rect, b: Rect): { x: number; y: number } {
  return {
    x: Math.max(0, Math.max(a.x - (b.x + b.w), b.x - (a.x + a.w))),
    y: Math.max(0, Math.max(a.y - (b.y + b.h), b.y - (a.y + a.h))),
  };
}

export function nearestInRange(
  objects: InteractableDef[],
  playerRect: Rect,
  room: RoomId,
): InteractableDef | null {
  let best: InteractableDef | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const obj of objects) {
    if (obj.room !== room) continue;
    const gap = axisGaps(playerRect, obj.rect);
    if (gap.x > REACH || gap.y > REACH) continue;
    // Strict < keeps the first declaration on equal-distance ties.
    const dist = Math.hypot(gap.x, gap.y);
    if (dist < bestDist) {
      best = obj;
      bestDist = dist;
    }
  }
  return best;
}
