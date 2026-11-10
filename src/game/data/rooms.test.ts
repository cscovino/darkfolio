import { describe, expect, it } from 'vitest';
import type { Rect } from '../systems/currentRoom';
import {
  BEDROOM_LAYOUT,
  BEDROOM_ORIGIN,
  DOORS,
  DOOR_NORTH,
  DOOR_WEST,
  LIVING_LAYOUT,
  LIVING_ORIGIN,
  OFFICE_LAYOUT,
  OFFICE_ORIGIN,
  ROOM_H,
  ROOM_W,
  ROOM_ZONES,
  type RoomLayout,
  SEAM_STRIPS,
  SPAWN_X,
  SPAWN_Y,
  TILE,
  VEIL_ZONES,
  WORLD_H,
  WORLD_W,
  YARD_LAYOUT,
  YARD_RECT,
} from './rooms';

type CenterRect = readonly [number, number, number, number, number?];

function toRect(t: CenterRect): Rect {
  const [x, y, w, h] = t;
  return { x: x - w / 2, y: y - h / 2, w, h };
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
  );
}

function translate(r: Rect, ox: number, oy: number): Rect {
  return { x: r.x + ox, y: r.y + oy, w: r.w, h: r.h };
}

function layoutWalls(layout: RoomLayout, ox: number, oy: number): Rect[] {
  return layout.walls.map((t) => translate(toRect(t), ox, oy));
}

function insideRect(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.w <= outer.x + outer.w &&
    inner.y + inner.h <= outer.y + outer.h
  );
}

// Lane and rest-spot rects are room-local; layout solids are room-local too.
function expectClearOfSolids(layout: RoomLayout, rect: Rect): void {
  for (const t of layout.solids) {
    expect(rectsOverlap(toRect(t), rect)).toBe(false);
  }
}

function hasSolid(
  layout: RoomLayout,
  x: number,
  y: number,
  w: number,
  h: number,
  c: number,
): boolean {
  return layout.solids.some(
    ([sx, sy, sw, sh, sc]) =>
      sx === x && sy === y && sw === w && sh === h && sc === c,
  );
}

describe('north door gap alignment', () => {
  it('keeps every living and office wall clear of the gap', () => {
    const gap: Rect = DOOR_NORTH.gap;
    const walls = [
      ...layoutWalls(LIVING_LAYOUT, LIVING_ORIGIN.x, LIVING_ORIGIN.y),
      ...layoutWalls(OFFICE_LAYOUT, OFFICE_ORIGIN.x, OFFICE_ORIGIN.y),
    ];
    for (const wall of walls) {
      expect(rectsOverlap(wall, gap)).toBe(false);
    }
  });

  it('keeps the spawn body rect clear of living solids', () => {
    const spawn: Rect = { x: SPAWN_X - 16, y: SPAWN_Y - 16, w: 32, h: 32 };
    for (const t of LIVING_LAYOUT.solids) {
      const solid = translate(toRect(t), LIVING_ORIGIN.x, LIVING_ORIGIN.y);
      expect(rectsOverlap(solid, spawn)).toBe(false);
    }
  });

  it('keeps the living north walking lane clear of living solids', () => {
    expectClearOfSolids(LIVING_LAYOUT, { x: 64, y: 16, w: 48, h: 96 });
  });

  it('keeps both glide rest-spot body rects clear of destination solids', () => {
    expectClearOfSolids(OFFICE_LAYOUT, { x: 72, y: 176, w: 32, h: 32 });
    expectClearOfSolids(LIVING_LAYOUT, { x: 72, y: 32, w: 32, h: 32 });
  });
});

describe('office dense layout', () => {
  it('keeps the office south walking lane clear of office solids', () => {
    expectClearOfSolids(OFFICE_LAYOUT, { x: 64, y: 144, w: 48, h: 80 });
  });

  it('places the dense office set with its phase-3 hosts', () => {
    expect(OFFICE_LAYOUT.solids.length).toBeGreaterThanOrEqual(8);
    expect(hasSolid(OFFICE_LAYOUT, 200, 30, 20, 14, 0x3d3d3d)).toBe(true);
    expect(hasSolid(OFFICE_LAYOUT, 24, 72, 16, 64, 0x3d2f1f)).toBe(true);
  });

  it('keeps the walkable rug out of the solid set', () => {
    expect(hasSolid(OFFICE_LAYOUT, 200, 140, 96, 64, 0x46534a)).toBe(false);
  });
});

describe('sealed wall bands and door decor', () => {
  it('places the front-door plank directly behind the spawn', () => {
    const spawnLocalX = SPAWN_X - LIVING_ORIGIN.x;
    const plank = LIVING_LAYOUT.decor.find(
      (t) => t[1] === 232 && t[4] === 0x241a10,
    );
    expect(plank).toBeDefined();
    expect(plank?.[0]).toBe(spawnLocalX);
  });
});

describe('west door gap alignment', () => {
  it('keeps every living and bedroom wall clear of the gap', () => {
    const gap: Rect = DOOR_WEST.gap;
    const walls = [
      ...layoutWalls(LIVING_LAYOUT, LIVING_ORIGIN.x, LIVING_ORIGIN.y),
      ...layoutWalls(BEDROOM_LAYOUT, BEDROOM_ORIGIN.x, BEDROOM_ORIGIN.y),
    ];
    for (const wall of walls) {
      expect(rectsOverlap(wall, gap)).toBe(false);
    }
  });

  it('keeps the bedroom east walking lane clear of bedroom solids', () => {
    expectClearOfSolids(BEDROOM_LAYOUT, { x: 224, y: 80, w: 96, h: 48 });
  });

  it('keeps the living west walking lane clear of living solids', () => {
    expectClearOfSolids(LIVING_LAYOUT, { x: 16, y: 80, w: 48, h: 48 });
  });

  it('keeps both west glide rest-spot body rects clear of destination solids', () => {
    expectClearOfSolids(BEDROOM_LAYOUT, { x: 256, y: 88, w: 32, h: 32 });
    expectClearOfSolids(LIVING_LAYOUT, { x: 32, y: 88, w: 32, h: 32 });
  });
});

describe('shared seams', () => {
  it('leaves the north seam band to the living room — no office wall above it', () => {
    const band: Rect = { x: 336, y: 224, w: 288, h: 16 };
    const walls = layoutWalls(OFFICE_LAYOUT, OFFICE_ORIGIN.x, OFFICE_ORIGIN.y);
    for (const wall of walls) {
      expect(rectsOverlap(wall, band)).toBe(false);
    }
  });

  it('leaves the west seam band to the living room — no bedroom wall left of it', () => {
    const band: Rect = { x: 304, y: 256, w: 16, h: 208 };
    const walls = layoutWalls(
      BEDROOM_LAYOUT,
      BEDROOM_ORIGIN.x,
      BEDROOM_ORIGIN.y,
    );
    for (const wall of walls) {
      expect(rectsOverlap(wall, band)).toBe(false);
    }
  });

  it('keeps exactly one door leaf per seam — the living room one', () => {
    const northLeaf: Rect = { x: 320, y: 224, w: 320, h: 16 };
    const westLeaf: Rect = { x: 304, y: 240, w: 16, h: 240 };
    for (const t of OFFICE_LAYOUT.decor) {
      const rect = translate(toRect(t), OFFICE_ORIGIN.x, OFFICE_ORIGIN.y);
      expect(rectsOverlap(rect, northLeaf)).toBe(false);
    }
    for (const t of BEDROOM_LAYOUT.decor) {
      const rect = translate(toRect(t), BEDROOM_ORIGIN.x, BEDROOM_ORIGIN.y);
      expect(rectsOverlap(rect, westLeaf)).toBe(false);
    }
  });

  it('sizes each door gap to the single 16px band', () => {
    expect(DOOR_NORTH.gap).toEqual({ x: 384, y: 240, w: 48, h: 16 });
    expect(DOOR_WEST.gap).toEqual({ x: 320, y: 320, w: 16, h: 48 });
  });

  it('keeps the 48px opening width unchanged', () => {
    expect(DOOR_NORTH.gap.w).toBe(48);
    expect(DOOR_WEST.gap.h).toBe(48);
  });
});

describe('veil regions', () => {
  it('mirrors the room zones and stays inside them', () => {
    expect(VEIL_ZONES.map((z) => z.id)).toEqual(ROOM_ZONES.map((z) => z.id));
    for (const zone of VEIL_ZONES) {
      const room = ROOM_ZONES.find((z) => z.id === zone.id);
      if (!room) throw new Error(`no zone for ${zone.id}`);
      expect(insideRect(room, zone)).toBe(true);
    }
  });

  it('tiles the world with veil zones, seam strips, and the yard', () => {
    const rects: Rect[] = [...VEIL_ZONES, ...SEAM_STRIPS, YARD_RECT];
    for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        expect(rectsOverlap(rects[i], rects[j])).toBe(false);
      }
    }
    const area = rects.reduce((sum, r) => sum + r.w * r.h, 0);
    expect(area).toBe(WORLD_W * WORLD_H);
  });

  it('keeps every living seam wall inside a strip', () => {
    const seamWalls = layoutWalls(
      LIVING_LAYOUT,
      LIVING_ORIGIN.x,
      LIVING_ORIGIN.y,
    ).filter((r) => (r.w === 16 && r.x === 320) || (r.h === 16 && r.y === 240));
    expect(seamWalls).toHaveLength(4);
    for (const wall of seamWalls) {
      expect(SEAM_STRIPS.some((s) => insideRect(s, wall))).toBe(true);
    }
  });

  it('keeps both door gaps inside a strip', () => {
    for (const gap of [DOOR_NORTH.gap, DOOR_WEST.gap]) {
      expect(SEAM_STRIPS.some((s) => insideRect(s, gap))).toBe(true);
    }
  });

  it('records the two rooms each strip borders', () => {
    const north = SEAM_STRIPS.find((s) => s.h === 16);
    const west = SEAM_STRIPS.find((s) => s.w === 16);
    expect([...(north?.rooms ?? [])].sort()).toEqual(['living', 'office']);
    expect([...(west?.rooms ?? [])].sort()).toEqual(['bedroom', 'living']);
  });
});

describe('bedroom dense layout', () => {
  it('places the dense bedroom set with its phase-3 phone host', () => {
    expect(BEDROOM_LAYOUT.solids.length).toBeGreaterThanOrEqual(6);
    expect(hasSolid(BEDROOM_LAYOUT, 56, 56, 48, 80, 0x4a3729)).toBe(true);
    expect(hasSolid(BEDROOM_LAYOUT, 96, 30, 8, 6, 0x555555)).toBe(true);
  });

  it('keeps the walkable rug out of the solid set', () => {
    expect(hasSolid(BEDROOM_LAYOUT, 160, 152, 80, 56, 0x4a3423)).toBe(false);
  });
});

describe('yard dressing', () => {
  const yardTuples = (): Rect[] => [
    toRect(YARD_LAYOUT.ground),
    ...YARD_LAYOUT.patches.map(toRect),
    ...YARD_LAYOUT.props.map(toRect),
  ];

  it('keeps every yard tuple inside the yard rect', () => {
    for (const t of yardTuples()) {
      expect(t.x).toBeGreaterThanOrEqual(YARD_RECT.x);
      expect(t.y).toBeGreaterThanOrEqual(YARD_RECT.y);
      expect(t.x + t.w).toBeLessThanOrEqual(YARD_RECT.x + YARD_RECT.w);
      expect(t.y + t.h).toBeLessThanOrEqual(YARD_RECT.y + YARD_RECT.h);
    }
  });

  it('keeps every yard tuple clear of the room zones', () => {
    for (const t of yardTuples()) {
      for (const zone of ROOM_ZONES) {
        expect(rectsOverlap(t, zone)).toBe(false);
      }
    }
  });
});

describe('room contract constants', () => {
  it('declares 16px tiles and 20x15 rooms', () => {
    expect(TILE).toBe(16);
    expect(ROOM_W).toBe(20);
    expect(ROOM_H).toBe(15);
  });

  it('promotes the world box to the 640x480 L-house', () => {
    expect(WORLD_W).toBe(640);
    expect(WORLD_H).toBe(480);
  });

  it('tiles the L with exactly three 20x15 zones', () => {
    expect(ROOM_ZONES).toHaveLength(3);
    expect(ROOM_ZONES.map((z) => z.id)).toEqual([
      'living',
      'office',
      'bedroom',
    ]);
    for (const zone of ROOM_ZONES) {
      expect(zone.w).toBe(ROOM_W * TILE);
      expect(zone.h).toBe(ROOM_H * TILE);
    }
  });

  it('places the three room origins in the L', () => {
    expect(LIVING_ORIGIN).toEqual({ x: 320, y: 240 });
    expect(OFFICE_ORIGIN).toEqual({ x: 320, y: 0 });
    expect(BEDROOM_ORIGIN).toEqual({ x: 0, y: 240 });
  });

  it('keeps the yard rect inside the house box', () => {
    expect(YARD_RECT.x).toBe(0);
    expect(YARD_RECT.y).toBe(0);
    expect(YARD_RECT.w).toBe(320);
    expect(YARD_RECT.h).toBe(240);
  });
});

describe('door registry', () => {
  it('registers exactly the two working doors', () => {
    expect(DOORS).toHaveLength(2);
    expect(DOORS.map((d) => d.id)).toEqual(['north', 'west']);
  });

  it('keeps each door gap clear of the sealed east and south wall bands', () => {
    const eastBand: Rect = { x: 624, y: 240, w: 16, h: 240 };
    const southBand: Rect = { x: 320, y: 464, w: 320, h: 16 };
    for (const door of DOORS) {
      expect(rectsOverlap(door.gap, eastBand)).toBe(false);
      expect(rectsOverlap(door.gap, southBand)).toBe(false);
    }
  });
});

describe('spawn and rest-spot constants', () => {
  it('spawns the player at house (480,448)', () => {
    expect(SPAWN_X).toBe(480);
    expect(SPAWN_Y).toBe(448);
  });
});
