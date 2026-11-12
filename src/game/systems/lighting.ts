import type { RoomLayout } from '../data/rooms';
import type { Rect, RoomId, Vec } from './currentRoom';
import type { Dir } from './doorGlide';

export const VEIL_ALPHA = 0.7;
export const NEAR_BLACK_ALPHA = 0.95;

/** Source-over composition of these rings lands the removal levels at ~0.25 / 0.5 / 1. */
export const POOL_RINGS = [
  { frac: 1, alpha: 0.25 },
  { frac: 0.78, alpha: 0.34 },
  { frac: 0.5, alpha: 1 },
] as const;

export function wallRects(layout: RoomLayout, origin: Vec): Rect[] {
  return layout.walls.map(([x, y, w, h]) => ({
    x: origin.x + x - w / 2,
    y: origin.y + y - h / 2,
    w,
    h,
  }));
}

export function veilAlphaFor(current: RoomId, region: RoomId): number {
  return current === region ? VEIL_ALPHA : NEAR_BLACK_ALPHA;
}

export function facingVector(dir: Dir): Vec {
  switch (dir) {
    case 'up':
      return { x: 0, y: -1 };
    case 'down':
      return { x: 0, y: 1 };
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
  }
}

export const FADE_MS = 400;

export function crossedAxis(dir: Dir, pos: Vec, axis: Vec): boolean {
  switch (dir) {
    case 'up':
      return pos.y <= axis.y;
    case 'down':
      return pos.y >= axis.y;
    case 'left':
      return pos.x <= axis.x;
    case 'right':
      return pos.x >= axis.x;
  }
}

export function fadeMix(elapsedMs: number): number {
  return Math.min(Math.max(elapsedMs / FADE_MS, 0), 1);
}

export function lerpAlpha(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export type VeilFade = {
  from: RoomId;
  to: RoomId;
  startedAt: number | null;
};

/**
 * The one veil level for a region: current room when idle, the source room's
 * level until the wall line is crossed, then the lerped pair for FADE_MS.
 * `current` is only consulted when no fade runs — the glide-end state flip
 * lands mid-hold and must not re-derive the level.
 */
export function regionAlpha(
  fade: VeilFade | null,
  elapsed: number,
  current: RoomId,
  region: RoomId,
): number {
  if (!fade) return veilAlphaFor(current, region);
  if (fade.startedAt === null) return veilAlphaFor(fade.from, region);
  return lerpAlpha(
    veilAlphaFor(fade.from, region),
    veilAlphaFor(fade.to, region),
    fadeMix(elapsed - fade.startedAt),
  );
}

/**
 * The veil level for a shared seam wall band (Option A): the smaller of its two
 * bordering rooms' levels relative to the current room when idle; while a fade
 * touches the strip, the smaller of the two rooms' faded levels — both sides
 * equal at the midpoint, so the crossed strip profiles 0.7 -> 0.825 -> 0.7 with
 * no jumps, and a strip adjacent to exactly one gliding room tracks that fade.
 */
export function seamStripAlpha(
  fade: VeilFade | null,
  elapsed: number,
  current: RoomId,
  rooms: readonly [RoomId, RoomId],
): number {
  if (!fade || (!rooms.includes(fade.from) && !rooms.includes(fade.to))) {
    return Math.min(
      veilAlphaFor(current, rooms[0]),
      veilAlphaFor(current, rooms[1]),
    );
  }
  return Math.min(
    regionAlpha(fade, elapsed, current, rooms[0]),
    regionAlpha(fade, elapsed, current, rooms[1]),
  );
}

export function wallShadows(
  light: Vec,
  radius: number,
  walls: Rect[],
): Vec[][] {
  const far = 2 * radius + 64;
  const quads: Vec[][] = [];
  for (const wall of walls) {
    const nx = Math.min(Math.max(light.x, wall.x), wall.x + wall.w);
    const ny = Math.min(Math.max(light.y, wall.y), wall.y + wall.h);
    const dx = nx - light.x;
    const dy = ny - light.y;
    if (dx * dx + dy * dy > radius * radius) continue;

    const corners: Vec[] = [
      { x: wall.x, y: wall.y },
      { x: wall.x + wall.w, y: wall.y },
      { x: wall.x + wall.w, y: wall.y + wall.h },
      { x: wall.x, y: wall.y + wall.h },
    ];
    // Measure from the nearest-point direction so the silhouette never
    // straddles the atan2 wrap and a wall to the west still picks its near face.
    const ref = Math.atan2(dy, dx);
    let near = corners[0];
    let farCorner = corners[0];
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    let dmax = 0;
    for (const c of corners) {
      let a = Math.atan2(c.y - light.y, c.x - light.x) - ref;
      if (a > Math.PI) a -= 2 * Math.PI;
      if (a < -Math.PI) a += 2 * Math.PI;
      if (a < min) {
        min = a;
        near = c;
      }
      if (a > max) {
        max = a;
        farCorner = c;
      }
      dmax = Math.max(dmax, Math.hypot(c.x - light.x, c.y - light.y));
    }
    // Bisector apex past the farthest corner so the far edge clears the
    // radius even when the wall spans a near-180 deg angle at the light.
    const mid = ref + (min + max) / 2;
    const apex: Vec = {
      x: light.x + Math.cos(mid) * (dmax + far),
      y: light.y + Math.sin(mid) * (dmax + far),
    };
    quads.push([
      near,
      farCorner,
      project(light, farCorner, far),
      apex,
      project(light, near, far),
    ]);
  }
  return quads;
}

function project(light: Vec, corner: Vec, far: number): Vec {
  const dx = corner.x - light.x;
  const dy = corner.y - light.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: corner.x + (dx / len) * far, y: corner.y + (dy / len) * far };
}

export function pointInPolygon(p: Vec, poly: Vec[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (
      a.y > p.y !== b.y > p.y &&
      p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x
    ) {
      inside = !inside;
    }
  }
  return inside;
}
