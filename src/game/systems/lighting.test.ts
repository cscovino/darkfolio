import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  LAMP_RADIUS,
  LIGHTS,
  SCREEN_RADIUS,
  TORCH_COLOR,
  TORCH_LOBE_ALPHA,
  TORCH_LOBE_OFFSET,
  TORCH_LOBE_SCALE,
  TORCH_RADIUS,
} from '../data/lights';
import {
  BEDROOM_LAYOUT,
  BEDROOM_ORIGIN,
  LIVING_LAYOUT,
  LIVING_ORIGIN,
  OFFICE_LAYOUT,
  OFFICE_ORIGIN,
  ROOM_ZONES,
  TILE,
} from '../data/rooms';
import type { RoomLayout } from '../data/rooms';
import {
  FADE_MS,
  NEAR_BLACK_ALPHA,
  POOL_RINGS,
  VEIL_ALPHA,
  crossedAxis,
  facingVector,
  fadeMix,
  lerpAlpha,
  pointInPolygon,
  regionAlpha,
  seamStripAlpha,
  veilAlphaFor,
  wallRects,
  wallShadows,
} from './lighting';

const fixture: RoomLayout = {
  floorA: 0,
  floorB: 0,
  wall: 0,
  walls: [[32, 8, 64, 16]],
  solids: [],
  decor: [],
};

describe('wallRects', () => {
  it('converts center-anchored tuples to top-left world rects', () => {
    expect(wallRects(fixture, { x: 320, y: 240 })).toEqual([
      { x: 320, y: 240, w: 64, h: 16 },
    ]);
  });

  it('covers every wall of every room', () => {
    expect(wallRects(LIVING_LAYOUT, LIVING_ORIGIN)).toHaveLength(6);
    expect(wallRects(OFFICE_LAYOUT, OFFICE_ORIGIN)).toHaveLength(3);
    expect(wallRects(BEDROOM_LAYOUT, BEDROOM_ORIGIN)).toHaveLength(3);
  });
});

describe('veilAlphaFor', () => {
  it('keeps the current room at the promise level and everything else near-black', () => {
    expect(VEIL_ALPHA).toBe(0.7);
    expect(NEAR_BLACK_ALPHA).toBe(0.95);
    expect(veilAlphaFor('living', 'living')).toBe(0.7);
    expect(veilAlphaFor('living', 'office')).toBe(0.95);
    expect(veilAlphaFor('office', 'bedroom')).toBe(0.95);
  });
});

describe('wallShadows', () => {
  const walls = wallRects(LIVING_LAYOUT, LIVING_ORIGIN);
  const quads = wallShadows({ x: 408, y: 300 }, 96, walls);

  it('lets the torch through the north doorway gap', () => {
    expect(quads.every((q) => !pointInPolygon({ x: 408, y: 200 }, q))).toBe(
      true,
    );
  });

  it('shadows the point behind the north wall segment', () => {
    expect(quads.some((q) => pointInPolygon({ x: 500, y: 200 }, q))).toBe(true);
  });

  it('ignores walls beyond the light radius', () => {
    const near = wallShadows({ x: 408, y: 300 }, 60, walls);
    const far = wallShadows({ x: 408, y: 300 }, 96, walls);
    expect(near.length).toBeLessThan(far.length);
  });

  it('keeps a west wall silhouette on its near face', () => {
    const west = wallShadows(
      { x: 350, y: 300 },
      96,
      wallRects(LIVING_LAYOUT, LIVING_ORIGIN),
    );
    expect(west.some((q) => pointInPolygon({ x: 312, y: 300 }, q))).toBe(true);
    expect(west.some((q) => pointInPolygon({ x: 349, y: 300 }, q))).toBe(false);
  });
});

describe('wallShadows wide-angle coverage', () => {
  const bedroomNorth = [{ x: 0, y: 240, w: 320, h: 16 }];

  it('shadows the yard behind the 320px bedroom north wall (G-04-1)', () => {
    const quads = wallShadows({ x: 128, y: 272 }, 88, bedroomNorth);
    expect(quads.some((q) => pointInPolygon({ x: 128, y: 185 }, q))).toBe(true);
    expect(quads.some((q) => pointInPolygon({ x: 52, y: 228 }, q))).toBe(true);
  });

  it('shadows the point straight behind the wall at radius 48', () => {
    const quads = wallShadows({ x: 128, y: 272 }, 48, bedroomNorth);
    expect(quads.some((q) => pointInPolygon({ x: 128, y: 225 }, q))).toBe(true);
  });

  it('covers every outside-zone pool point of every registry light', () => {
    const worldWalls = [
      ...wallRects(LIVING_LAYOUT, LIVING_ORIGIN),
      ...wallRects(OFFICE_LAYOUT, OFFICE_ORIGIN),
      ...wallRects(BEDROOM_LAYOUT, BEDROOM_ORIGIN),
    ];
    for (const light of LIGHTS) {
      const zone = ROOM_ZONES.find((z) => z.id === light.room);
      if (!zone) throw new Error(`no zone for ${light.room}`);
      const shadows = wallShadows(light, light.radius, worldWalls);
      const uncovered: { x: number; y: number }[] = [];
      for (
        let x = light.x - light.radius;
        x <= light.x + light.radius;
        x += 2
      ) {
        for (
          let y = light.y - light.radius;
          y <= light.y + light.radius;
          y += 2
        ) {
          const p = { x, y };
          if (Math.hypot(x - light.x, y - light.y) >= light.radius) continue;
          if (
            p.x >= zone.x &&
            p.x < zone.x + zone.w &&
            p.y >= zone.y &&
            p.y < zone.y + zone.h
          )
            continue;
          if (
            worldWalls.some(
              (r) =>
                p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h,
            )
          )
            continue;
          if (!shadows.some((q) => pointInPolygon(p, q))) uncovered.push(p);
        }
      }
      expect(uncovered).toEqual([]);
    }
  });
});

describe('pool ring recipe', () => {
  it('pins the three-step falloff', () => {
    expect(POOL_RINGS).toEqual([
      { frac: 1, alpha: 0.25 },
      { frac: 0.78, alpha: 0.34 },
      { frac: 0.5, alpha: 1 },
    ]);
  });
});

describe('torch constants', () => {
  it('pins the 2.5-tile warm torch', () => {
    expect(TORCH_RADIUS).toBe(2.5 * TILE);
    expect(TORCH_RADIUS).toBe(40);
    expect(TORCH_COLOR).toBe(0xffa500);
  });
});

describe('pool radii', () => {
  it('pins the view-sized lamp and screen pools', () => {
    expect(LAMP_RADIUS).toBe(3 * TILE);
    expect(LAMP_RADIUS).toBe(48);
    expect(SCREEN_RADIUS).toBe(1.5 * TILE);
    expect(SCREEN_RADIUS).toBe(24);
    for (const light of LIGHTS) {
      expect(light.radius).toBe(
        light.kind === 'lamp' ? LAMP_RADIUS : SCREEN_RADIUS,
      );
    }
  });
});

describe('facingVector', () => {
  it('maps each facing to screen-space direction', () => {
    expect(facingVector('up')).toEqual({ x: 0, y: -1 });
    expect(facingVector('down')).toEqual({ x: 0, y: 1 });
    expect(facingVector('left')).toEqual({ x: -1, y: 0 });
    expect(facingVector('right')).toEqual({ x: 1, y: 0 });
  });
});

describe('torch lobe constants', () => {
  it('pins the bounded facing bias', () => {
    expect(TORCH_LOBE_OFFSET).toBe(20);
    expect(TORCH_LOBE_SCALE).toBe(0.7);
    expect(TORCH_LOBE_ALPHA).toBe(0.5);
    expect(TORCH_LOBE_OFFSET).toBe(TORCH_RADIUS / 2);
  });
});

describe('wall-line fade', () => {
  const axis = { x: 408, y: 240 };

  it('counts the axis line as crossed in every direction', () => {
    expect(crossedAxis('up', { x: 408, y: 239 }, axis)).toBe(true);
    expect(crossedAxis('up', { x: 408, y: 240 }, axis)).toBe(true);
    expect(crossedAxis('up', { x: 408, y: 241 }, axis)).toBe(false);
    expect(crossedAxis('down', { x: 408, y: 241 }, axis)).toBe(true);
    expect(crossedAxis('down', { x: 408, y: 240 }, axis)).toBe(true);
    expect(crossedAxis('down', { x: 408, y: 239 }, axis)).toBe(false);
    expect(crossedAxis('left', { x: 407, y: 240 }, axis)).toBe(true);
    expect(crossedAxis('left', { x: 408, y: 240 }, axis)).toBe(true);
    expect(crossedAxis('left', { x: 409, y: 240 }, axis)).toBe(false);
    expect(crossedAxis('right', { x: 409, y: 240 }, axis)).toBe(true);
    expect(crossedAxis('right', { x: 408, y: 240 }, axis)).toBe(true);
    expect(crossedAxis('right', { x: 407, y: 240 }, axis)).toBe(false);
  });

  it('clamps the fade progress to 0..1 over FADE_MS', () => {
    expect(FADE_MS).toBe(400);
    expect(fadeMix(0)).toBe(0);
    expect(fadeMix(200)).toBe(0.5);
    expect(fadeMix(400)).toBe(1);
    expect(fadeMix(5000)).toBe(1);
    expect(fadeMix(-50)).toBe(0);
  });

  it('lerps veil alphas between the two rooms', () => {
    expect(lerpAlpha(0.7, 0.95, 0)).toBeCloseTo(0.7);
    expect(lerpAlpha(0.7, 0.95, 1)).toBeCloseTo(0.95);
    expect(lerpAlpha(0.7, 0.95, 0.5)).toBeCloseTo(0.825);
  });
});

describe('regionAlpha', () => {
  const fade = (startedAt: number | null) => ({
    from: 'living' as const,
    to: 'office' as const,
    startedAt,
  });

  it('follows the current room while no fade runs', () => {
    expect(regionAlpha(null, 1000, 'living', 'living')).toBe(VEIL_ALPHA);
    expect(regionAlpha(null, 1000, 'living', 'office')).toBe(NEAR_BLACK_ALPHA);
    expect(regionAlpha(null, 1000, 'office', 'office')).toBe(VEIL_ALPHA);
  });

  it('holds the source room until the wall line is crossed, ignoring the store', () => {
    // The room store can flip mid-glide; the fade, not the store, owns the level.
    expect(regionAlpha(fade(null), 1000, 'office', 'living')).toBe(VEIL_ALPHA);
    expect(regionAlpha(fade(null), 1000, 'office', 'office')).toBe(
      NEAR_BLACK_ALPHA,
    );
  });

  it('measures the fade from the crossing instant, not from scene elapsed', () => {
    // startedAt 1000, elapsed 1200 -> mix 0.5. Reading `elapsed` alone would
    // already be past FADE_MS and snap the veil.
    expect(regionAlpha(fade(1000), 1200, 'living', 'living')).toBeCloseTo(
      0.825,
    );
    expect(regionAlpha(fade(1000), 1000, 'living', 'living')).toBeCloseTo(0.7);
    expect(regionAlpha(fade(1000), 1000, 'living', 'office')).toBeCloseTo(0.95);
  });

  it('lands on the destination level and holds it until the store catches up', () => {
    expect(regionAlpha(fade(1000), 1400, 'living', 'living')).toBe(
      NEAR_BLACK_ALPHA,
    );
    expect(regionAlpha(fade(1000), 1400, 'living', 'office')).toBe(VEIL_ALPHA);
    expect(regionAlpha(fade(1000), 90000, 'living', 'office')).toBe(VEIL_ALPHA);
  });
});

describe('torch stays steady (D-16)', () => {
  const lightSrc = readFileSync(
    join(process.cwd(), 'src/game/objects/Light.ts'),
    'utf8',
  );

  it('passes no flicker alpha to the torch veil stamp', () => {
    const start = lightSrc.indexOf('this.veil.stamp(TORCH_KEY');
    expect(start).toBeGreaterThanOrEqual(0);
    const stamp = lightSrc.slice(start, lightSrc.indexOf(');', start));
    expect(stamp).not.toContain('brightnessAt');
  });

  it('uses the fade for the room regions and the literal level for the yard', () => {
    const start = lightSrc.indexOf('for (const zone of VEIL_ZONES)');
    expect(start).toBeGreaterThanOrEqual(0);
    const zones = lightSrc.slice(start, lightSrc.indexOf('YARD_RECT', start));
    expect(zones).toContain('regionAlpha(fade, elapsed, current, zone.id)');
    // The shared bands derive their level through the fade too (D-04 amendment).
    expect(zones).toContain('seamStripAlpha');
    // D-04: the yard keeps the literal level — VEIL_ALPHA and the pools loop
    // header also appear before this anchor (imports, destroy()), so both
    // lookups need the fromIndex.
    const literal = lightSrc.slice(
      lightSrc.indexOf('VEIL_ALPHA', start),
      lightSrc.indexOf('for (const entry of this.pools)', start),
    );
    expect(literal).toContain('YARD_RECT');
    expect(literal).not.toContain('regionAlpha');
    expect(literal).not.toContain('seamStripAlpha');
  });
});

describe('seamStripAlpha (Option A midpoint switch)', () => {
  const north = ['office', 'living'] as const;
  const west = ['living', 'bedroom'] as const;
  const neither = ['bedroom', 'bedroom'] as const;
  const fade = (startedAt: number | null) => ({
    from: 'living' as const,
    to: 'office' as const,
    startedAt,
  });

  it('rides the current room level while idle', () => {
    expect(seamStripAlpha(null, 1000, 'living', north)).toBe(VEIL_ALPHA);
    expect(seamStripAlpha(null, 1000, 'bedroom', west)).toBe(VEIL_ALPHA);
    // Neither bordering room is current — the band darkens with them instead
    // of reading as a lighter line across near-black territory.
    expect(seamStripAlpha(null, 1000, 'office', west)).toBe(NEAR_BLACK_ALPHA);
    expect(seamStripAlpha(null, 1000, 'bedroom', north)).toBe(NEAR_BLACK_ALPHA);
  });

  it('holds the departed room level before the axis is crossed', () => {
    expect(seamStripAlpha(fade(null), 1000, 'living', north)).toBe(VEIL_ALPHA);
    expect(seamStripAlpha(fade(null), 1000, 'living', west)).toBe(VEIL_ALPHA);
  });

  it('profiles the crossed strip 0.7 -> 0.825 -> 0.7 with no jumps', () => {
    expect(seamStripAlpha(fade(1000), 1000, 'living', north)).toBeCloseTo(0.7);
    expect(seamStripAlpha(fade(1000), 1000, 'living', north)).toBe(VEIL_ALPHA);
    const mid = seamStripAlpha(fade(1000), 1200, 'living', north);
    expect(mid).toBeCloseTo(0.825);
    // Both sides are equal at the switch — no jump at the midpoint.
    expect(mid).toBe(regionAlpha(fade(1000), 1200, 'living', 'living'));
    expect(mid).toBe(regionAlpha(fade(1000), 1200, 'living', 'office'));
    expect(seamStripAlpha(fade(1000), 1400, 'living', north)).toBeCloseTo(0.7);
    expect(seamStripAlpha(fade(1000), 90000, 'living', north)).toBeCloseTo(0.7);
  });

  it('tracks the gliding room for a strip adjacent to exactly one', () => {
    for (const elapsed of [1000, 1200, 1400]) {
      expect(seamStripAlpha(fade(1000), elapsed, 'living', west)).toBe(
        regionAlpha(fade(1000), elapsed, 'living', 'living'),
      );
    }
  });

  it('rides the current room for a strip adjacent to neither gliding room', () => {
    for (const elapsed of [1000, 1200, 1400, 90000]) {
      expect(seamStripAlpha(fade(1000), elapsed, 'living', neither)).toBe(
        NEAR_BLACK_ALPHA,
      );
    }
  });
});

describe('source core coverage', () => {
  it('keeps every source rect inside the fully-cleared inner ring', () => {
    for (const light of LIGHTS) {
      expect(light.radius).toBeGreaterThan(0);
      expect(0.5 * light.radius).toBeGreaterThanOrEqual(
        Math.hypot(14 / 2, 8 / 2),
      );
    }
  });
});

describe('light registry', () => {
  const cases = [
    { id: 'living-lamp', layout: LIVING_LAYOUT, origin: LIVING_ORIGIN, i: 1 },
    { id: 'living-tv', layout: LIVING_LAYOUT, origin: LIVING_ORIGIN, i: 0 },
    { id: 'office-lamp', layout: OFFICE_LAYOUT, origin: OFFICE_ORIGIN, i: 1 },
    {
      id: 'office-computer',
      layout: OFFICE_LAYOUT,
      origin: OFFICE_ORIGIN,
      i: 0,
    },
    {
      id: 'bedroom-lamp',
      layout: BEDROOM_LAYOUT,
      origin: BEDROOM_ORIGIN,
      i: 3,
    },
  ];

  it('has exactly five sources', () => {
    expect(LIGHTS).toHaveLength(5);
  });

  it('copies every position and colour from its decor hint', () => {
    for (const c of cases) {
      const light = LIGHTS.find((l) => l.id === c.id);
      const [hx, hy, , , color] = c.layout.decor[c.i];
      expect(light).toBeDefined();
      expect({ x: light?.x, y: light?.y }).toEqual({
        x: c.origin.x + hx,
        y: c.origin.y + hy,
      });
      expect(light?.color).toBe(color);
      expect(light?.kind).toBe(color === 0xffa500 ? 'lamp' : 'screen');
    }
  });
});
