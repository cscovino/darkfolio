import type { LightKind } from '../data/lights';

export const FLICKER_BLOCK_MS = 1000;
export const LAMP_MIN = 0.82;
export const SCREEN_MIN = 0.94;

export function hashSeed(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function hash32(seed: number, n: number): number {
  let h = seed ^ Math.imul(n + 1, 0x9e3779b9);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return h >>> 0;
}

export function brightnessAt(
  seed: number,
  elapsedMs: number,
  kind: LightKind,
): number {
  const blockMs = kind === 'lamp' ? FLICKER_BLOCK_MS : FLICKER_BLOCK_MS * 2;
  const block = Math.floor(elapsedMs / blockMs);
  const offset = elapsedMs - block * blockMs;
  const changeAt = blockMs / 2 + (blockMs / 2) * (hash32(seed, block) & 1);
  const sub = offset < changeAt ? 0 : 1;
  const v = hash32(seed, block * 2 + sub) / 0xffffffff;
  const min = kind === 'lamp' ? LAMP_MIN : SCREEN_MIN;
  return min + v * (1 - min);
}
