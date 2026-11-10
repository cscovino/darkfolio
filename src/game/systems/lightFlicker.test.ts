import { describe, expect, it } from 'vitest';
import { LIGHTS } from '../data/lights';
import type { LightKind } from '../data/lights';
import { LAMP_MIN, SCREEN_MIN, brightnessAt, hashSeed } from './lightFlicker';

const LAMP_IDS = ['living-lamp', 'office-lamp', 'bedroom-lamp'];

function changeTimes(kind: LightKind, seed: number): number[] {
  const times: number[] = [];
  let prev = brightnessAt(seed, 0, kind);
  for (let t = 100; t <= 20000; t += 100) {
    const next = brightnessAt(seed, t, kind);
    if (next !== prev) times.push(t);
    prev = next;
  }
  return times;
}

describe('hashSeed', () => {
  it('is deterministic and separates the five registry ids', () => {
    const seeds = LIGHTS.map((light) => hashSeed(light.id));
    expect(seeds).toEqual(LIGHTS.map((light) => hashSeed(light.id)));
    expect(new Set(seeds).size).toBe(LIGHTS.length);
  });
});

describe('brightnessAt', () => {
  it('is a pure function of seed, time and kind', () => {
    const seed = hashSeed('living-lamp');
    for (let t = 0; t <= 20000; t += 250) {
      expect(brightnessAt(seed, t, 'lamp')).toBe(brightnessAt(seed, t, 'lamp'));
    }
  });

  it('keeps lamps and screens inside their bands', () => {
    expect(SCREEN_MIN).toBeGreaterThan(LAMP_MIN);
    for (const light of LIGHTS) {
      const seed = hashSeed(light.id);
      const min = light.kind === 'lamp' ? LAMP_MIN : SCREEN_MIN;
      for (let t = 0; t <= 20000; t += 100) {
        const v = brightnessAt(seed, t, light.kind);
        expect(v).toBeGreaterThanOrEqual(min);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });

  it('steps lamps every 500ms at the soonest and screens every 1000ms', () => {
    for (const id of LAMP_IDS) {
      const times = changeTimes('lamp', hashSeed(id));
      expect(times.length).toBeGreaterThan(0);
      expect(times.every((t) => t % 500 === 0)).toBe(true);
      for (let i = 1; i < times.length; i++) {
        expect(times[i] - times[i - 1]).toBeGreaterThanOrEqual(500);
      }
    }

    const screenTimes = changeTimes('screen', hashSeed('living-tv'));
    expect(screenTimes.length).toBeGreaterThan(0);
    expect(screenTimes.every((t) => t % 1000 === 0)).toBe(true);
    for (let i = 1; i < screenTimes.length; i++) {
      expect(screenTimes[i] - screenTimes[i - 1]).toBeGreaterThanOrEqual(1000);
    }
  });

  it('keeps the three lamps out of phase', () => {
    const seeds = LAMP_IDS.map(hashSeed);
    let diverged = false;
    for (let t = 0; t <= 10000; t += 100) {
      const [a, b, c] = seeds.map((s) => brightnessAt(s, t, 'lamp'));
      if (a !== b && b !== c && a !== c) diverged = true;
    }
    expect(diverged).toBe(true);
  });
});
