import { describe, expect, it } from 'vitest';
import { velocityFromKeys } from './movement';

const none = { left: false, right: false, up: false, down: false };
const SPEED = 120;

describe('velocityFromKeys', () => {
  it('is zero when idle', () => {
    expect(velocityFromKeys(none, SPEED)).toEqual({ x: 0, y: 0 });
  });

  it('moves exactly at speed on cardinals', () => {
    expect(velocityFromKeys({ ...none, right: true }, SPEED)).toEqual({
      x: 120,
      y: 0,
    });
    expect(velocityFromKeys({ ...none, left: true }, SPEED)).toEqual({
      x: -120,
      y: 0,
    });
    expect(velocityFromKeys({ ...none, down: true }, SPEED)).toEqual({
      x: 0,
      y: 120,
    });
    expect(velocityFromKeys({ ...none, up: true }, SPEED)).toEqual({
      x: 0,
      y: -120,
    });
  });

  it('cancels opposing keys on each axis', () => {
    expect(
      velocityFromKeys({ ...none, left: true, right: true }, SPEED),
    ).toEqual({ x: 0, y: 0 });
    expect(velocityFromKeys({ ...none, up: true, down: true }, SPEED)).toEqual({
      x: 0,
      y: 0,
    });
  });

  it('keeps diagonals at the same magnitude as cardinals', () => {
    const v = velocityFromKeys({ ...none, right: true, down: true }, SPEED);
    expect(v.x).toBeCloseTo(120 / Math.SQRT2, 6);
    expect(v.y).toBeCloseTo(120 / Math.SQRT2, 6);
    expect(Math.hypot(v.x, v.y)).toBeCloseTo(SPEED, 6);
  });

  it('scales with the speed argument', () => {
    expect(velocityFromKeys({ ...none, left: true }, 60)).toEqual({
      x: -60,
      y: 0,
    });
  });
});
