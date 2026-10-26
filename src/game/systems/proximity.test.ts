import { describe, expect, it } from 'vitest';
import { INTERACTABLES, type InteractableDef } from '../data/interactables';
import type { Rect, RoomId } from './currentRoom';
import { nearestInRange } from './proximity';

function def(id: string, room: RoomId, rect: Rect): InteractableDef {
  return {
    id,
    room,
    rect,
    verb: 'POKE',
    speakerTag: '[X]',
    dialogPool: ['Hi.'],
  };
}

const body = (x: number, y: number): Rect => ({ x, y, w: 32, h: 32 });

describe('nearestInRange', () => {
  it('finds the computer at the closest standing spot at the desk', () => {
    const hit = nearestInRange(INTERACTABLES, body(504, 52), 'office');
    expect(hit?.id).toBe('computer');
  });

  it('counts an exact 32px gap as in range', () => {
    const hit = nearestInRange(INTERACTABLES, body(504, 69), 'office');
    expect(hit?.id).toBe('computer');
  });

  it('rejects a 33px gap', () => {
    expect(nearestInRange(INTERACTABLES, body(504, 70), 'office')).toBeNull();
  });

  it('rejects an office object from another room', () => {
    expect(nearestInRange(INTERACTABLES, body(504, 52), 'living')).toBeNull();
    expect(nearestInRange(INTERACTABLES, body(504, 52), 'bedroom')).toBeNull();
  });

  it('returns the nearer of two in-range objects', () => {
    const near: InteractableDef = def('near', 'office', {
      x: 508,
      y: 60,
      w: 4,
      h: 4,
    });
    const hit = nearestInRange(
      [INTERACTABLES[0], near],
      body(504, 52),
      'office',
    );
    expect(hit?.id).toBe('near');
  });

  it('breaks equal-gap ties by declaration order', () => {
    const a = def('a', 'office', { x: 400, y: 100, w: 20, h: 14 });
    const b = def('b', 'office', { x: 400, y: 100, w: 20, h: 14 });
    expect(nearestInRange([a, b], body(394, 121), 'office')?.id).toBe('a');
    expect(nearestInRange([b, a], body(394, 121), 'office')?.id).toBe('b');
  });

  it('returns null when nothing is declared', () => {
    expect(nearestInRange([], body(504, 52), 'office')).toBeNull();
  });
});

describe('INTERACTABLES registry', () => {
  it('pins the computer entry to the office desk', () => {
    const computer = INTERACTABLES.find((o) => o.id === 'computer');
    expect(computer?.room).toBe('office');
    expect(computer?.rect).toEqual({ x: 510, y: 23, w: 20, h: 14 });
    expect(computer?.verb).toBe('BOOT UP');
    expect(computer?.overlay).toBe('/projects');
    expect(computer?.dialogPool).toHaveLength(3);
    expect(computer?.statusPool).toHaveLength(3);
  });
});
