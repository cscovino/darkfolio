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
  ROOM_ZONES,
  SPAWN_X,
  SPAWN_Y,
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

function layoutWalls(
  layout: typeof LIVING_LAYOUT,
  ox: number,
  oy: number,
): Rect[] {
  return layout.walls.map((t) => translate(toRect(t), ox, oy));
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
    const lane: Rect = { x: 64, y: 16, w: 48, h: 96 };
    for (const t of LIVING_LAYOUT.solids) {
      expect(rectsOverlap(toRect(t), lane)).toBe(false);
    }
  });

  it('keeps both glide rest-spot body rects clear of destination solids', () => {
    const officeRest: Rect = { x: 72, y: 176, w: 32, h: 32 };
    const livingRest: Rect = { x: 72, y: 32, w: 32, h: 32 };
    for (const t of OFFICE_LAYOUT.solids) {
      expect(rectsOverlap(toRect(t), officeRest)).toBe(false);
    }
    for (const t of LIVING_LAYOUT.solids) {
      expect(rectsOverlap(toRect(t), livingRest)).toBe(false);
    }
  });
});

describe('office dense layout', () => {
  const hasSolid = (x: number, y: number, w: number, h: number, c: number) =>
    OFFICE_LAYOUT.solids.some(
      ([sx, sy, sw, sh, sc]) =>
        sx === x && sy === y && sw === w && sh === h && sc === c,
    );

  it('keeps the office south walking lane clear of office solids', () => {
    const lane: Rect = { x: 64, y: 144, w: 48, h: 80 };
    for (const t of OFFICE_LAYOUT.solids) {
      expect(rectsOverlap(toRect(t), lane)).toBe(false);
    }
  });

  it('places the dense office set with its phase-3 hosts', () => {
    expect(OFFICE_LAYOUT.solids.length).toBeGreaterThanOrEqual(8);
    expect(hasSolid(200, 30, 20, 14, 0x3d3d3d)).toBe(true);
    expect(hasSolid(24, 72, 16, 64, 0x3d2f1f)).toBe(true);
  });

  it('keeps the walkable rug out of the solid set', () => {
    expect(hasSolid(200, 140, 96, 64, 0x46534a)).toBe(false);
  });
});

describe('sealed wall bands and door decor', () => {
  it('keeps every door gap clear of the living sealed east and south wall bands', () => {
    const eastBand: Rect = { x: 624, y: 240, w: 16, h: 240 };
    const southBand: Rect = { x: 320, y: 464, w: 320, h: 16 };
    for (const door of DOORS) {
      expect(rectsOverlap(door.gap, eastBand)).toBe(false);
      expect(rectsOverlap(door.gap, southBand)).toBe(false);
    }
  });

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
    expect(DOOR_WEST).toBeDefined();
    expect(BEDROOM_LAYOUT).toBeDefined();
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
    expect(BEDROOM_LAYOUT).toBeDefined();
    const lane: Rect = { x: 224, y: 80, w: 96, h: 48 };
    for (const t of BEDROOM_LAYOUT.solids) {
      expect(rectsOverlap(toRect(t), lane)).toBe(false);
    }
  });

  it('keeps the living west walking lane clear of living solids', () => {
    const lane: Rect = { x: 16, y: 80, w: 48, h: 48 };
    for (const t of LIVING_LAYOUT.solids) {
      expect(rectsOverlap(toRect(t), lane)).toBe(false);
    }
  });

  it('keeps both west glide rest-spot body rects clear of destination solids', () => {
    expect(BEDROOM_LAYOUT).toBeDefined();
    const bedroomRest: Rect = { x: 256, y: 88, w: 32, h: 32 };
    const livingRest: Rect = { x: 32, y: 88, w: 32, h: 32 };
    for (const t of BEDROOM_LAYOUT.solids) {
      expect(rectsOverlap(toRect(t), bedroomRest)).toBe(false);
    }
    for (const t of LIVING_LAYOUT.solids) {
      expect(rectsOverlap(toRect(t), livingRest)).toBe(false);
    }
  });
});

describe('bedroom dense layout', () => {
  const hasSolid = (x: number, y: number, w: number, h: number, c: number) =>
    BEDROOM_LAYOUT.solids.some(
      ([sx, sy, sw, sh, sc]) =>
        sx === x && sy === y && sw === w && sh === h && sc === c,
    );

  it('places the dense bedroom set with its phase-3 phone host', () => {
    expect(BEDROOM_LAYOUT).toBeDefined();
    expect(BEDROOM_LAYOUT.solids.length).toBeGreaterThanOrEqual(6);
    expect(hasSolid(56, 56, 48, 80, 0x4a3729)).toBe(true);
    expect(hasSolid(96, 30, 8, 6, 0x555555)).toBe(true);
  });

  it('keeps the walkable rug out of the solid set', () => {
    expect(BEDROOM_LAYOUT).toBeDefined();
    expect(hasSolid(160, 152, 80, 56, 0x4a3423)).toBe(false);
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
