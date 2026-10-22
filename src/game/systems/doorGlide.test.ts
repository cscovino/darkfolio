import { describe, expect, it } from 'vitest';
import { DOOR_NORTH, DOOR_WEST } from '../data/rooms';
import {
  GLIDE_EASE,
  GLIDE_MS,
  glideEnd,
  reachRect,
  triggeredSide,
} from './doorGlide';
import type { Dir, DoorDef } from './doorGlide';

const DOORS: DoorDef[] = [DOOR_NORTH];
const WEST_DOORS: DoorDef[] = [DOOR_NORTH, DOOR_WEST];
const none: Record<Dir, boolean> = {
  up: false,
  down: false,
  left: false,
  right: false,
};
const keys = (dir: Dir): Record<Dir, boolean> => ({ ...none, [dir]: true });

describe('glideEnd', () => {
  it('returns the deterministic north-door rest spots', () => {
    expect(glideEnd(DOOR_NORTH.axis, 'up')).toEqual({ x: 408, y: 192 });
    expect(glideEnd(DOOR_NORTH.axis, 'up')).toEqual({ x: 408, y: 192 });
    expect(glideEnd(DOOR_NORTH.axis, 'down')).toEqual({ x: 408, y: 288 });
    expect(glideEnd(DOOR_NORTH.axis, 'down')).toEqual({ x: 408, y: 288 });
  });
});

describe('reachRect', () => {
  it('grows the approached side by REACH', () => {
    expect(reachRect(DOOR_NORTH.zone, 'up')).toEqual({
      x: 384,
      y: 216,
      w: 48,
      h: 64,
    });
    expect(reachRect(DOOR_NORTH.zone, 'down')).toEqual({
      x: 384,
      y: 200,
      w: 48,
      h: 64,
    });
  });
});

describe('triggeredSide', () => {
  it('fires the office side on bump-open into the north zone', () => {
    const hit = triggeredSide(DOORS, { x: 408, y: 240 }, 'up', none);
    expect(hit?.side.dest).toBe('office');
  });

  it('fires the living side on try-the-handle above the zone', () => {
    const hit = triggeredSide(DOORS, { x: 408, y: 208 }, 'down', keys('down'));
    expect(hit?.side.dest).toBe('living');
  });

  it('does not fire outside the zone without a held key', () => {
    expect(triggeredSide(DOORS, { x: 408, y: 268 }, 'up', none)).toBeNull();
  });

  it('lets the bump pass win over the handle pass', () => {
    const bumpDoor: DoorDef = {
      ...DOOR_NORTH,
      sides: [
        { dir: 'down', dest: 'living' },
        { dir: 'up', dest: 'office' },
      ],
    };
    const hit = triggeredSide(
      [bumpDoor],
      { x: 408, y: 240 },
      'up',
      keys('down'),
    );
    expect(hit?.side.dest).toBe('office');
  });

  it('checks sides in declaration order', () => {
    const ordered: DoorDef = {
      ...DOOR_NORTH,
      sides: [
        { dir: 'up', dest: 'office' },
        { dir: 'up', dest: 'bedroom' },
      ],
    };
    const hit = triggeredSide([ordered], { x: 408, y: 240 }, 'up', none);
    expect(hit?.side.dest).toBe('office');
  });

  it('does not re-trigger at either glide rest spot', () => {
    expect(
      triggeredSide(DOORS, { x: 408, y: 192 }, 'up', keys('up')),
    ).toBeNull();
    expect(
      triggeredSide(DOORS, { x: 408, y: 192 }, 'down', keys('down')),
    ).toBeNull();
    expect(
      triggeredSide(DOORS, { x: 408, y: 288 }, 'down', keys('down')),
    ).toBeNull();
    expect(
      triggeredSide(DOORS, { x: 408, y: 288 }, 'up', keys('up')),
    ).toBeNull();
  });
});

describe('west door', () => {
  it('declares the west door pair on the shared wall', () => {
    expect(DOOR_WEST.id).toBe('west');
    expect(DOOR_WEST.axis).toEqual({ x: 320, y: 344 });
  });

  it('returns the deterministic west-door rest spots', () => {
    expect(glideEnd(DOOR_WEST.axis, 'left')).toEqual({ x: 272, y: 344 });
    expect(glideEnd(DOOR_WEST.axis, 'left')).toEqual({ x: 272, y: 344 });
    expect(glideEnd(DOOR_WEST.axis, 'right')).toEqual({ x: 368, y: 344 });
    expect(glideEnd(DOOR_WEST.axis, 'right')).toEqual({ x: 368, y: 344 });
  });

  it('fires the bedroom side on bump-open into the west zone', () => {
    const hit = triggeredSide(WEST_DOORS, { x: 320, y: 344 }, 'left', none);
    expect(hit?.side.dest).toBe('bedroom');
  });

  it('fires the bedroom side on try-the-handle from the living side', () => {
    const hit = triggeredSide(
      WEST_DOORS,
      { x: 350, y: 344 },
      'up',
      keys('left'),
    );
    expect(hit?.side.dest).toBe('bedroom');
  });

  it('fires the living side on try-the-handle from the bedroom side', () => {
    const hit = triggeredSide(
      WEST_DOORS,
      { x: 290, y: 344 },
      'up',
      keys('right'),
    );
    expect(hit?.side.dest).toBe('living');
  });

  it('does not re-trigger at either west glide rest spot', () => {
    expect(
      triggeredSide(WEST_DOORS, { x: 272, y: 344 }, 'right', keys('right')),
    ).toBeNull();
    expect(
      triggeredSide(WEST_DOORS, { x: 272, y: 344 }, 'left', keys('left')),
    ).toBeNull();
    expect(
      triggeredSide(WEST_DOORS, { x: 368, y: 344 }, 'left', keys('left')),
    ).toBeNull();
    expect(
      triggeredSide(WEST_DOORS, { x: 368, y: 344 }, 'right', keys('right')),
    ).toBeNull();
  });
});

describe('door glide constants', () => {
  it('pins the glide timing and ease', () => {
    expect(GLIDE_MS).toBe(700);
    expect(GLIDE_EASE).toBe('Sine.easeInOut');
  });
});

describe('reachRect (west door dirs)', () => {
  it('grows the approached side for left and right', () => {
    expect(reachRect(DOOR_WEST.zone, 'left')).toEqual({
      x: 296,
      y: 320,
      w: 64,
      h: 48,
    });
    expect(reachRect(DOOR_WEST.zone, 'right')).toEqual({
      x: 280,
      y: 320,
      w: 64,
      h: 48,
    });
  });
});
