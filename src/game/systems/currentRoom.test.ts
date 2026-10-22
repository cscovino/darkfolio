import { describe, expect, it } from 'vitest';
import { ROOM_ZONES } from '../data/rooms';
import { getCurrentRoom, setCurrentRoom } from '../state/currentRoom';
import { roomAt } from './currentRoom';

describe('roomAt', () => {
  it('maps each room-zone center to its own id', () => {
    expect(roomAt(ROOM_ZONES, { x: 480, y: 360 })).toBe('living');
    expect(roomAt(ROOM_ZONES, { x: 480, y: 120 })).toBe('office');
    expect(roomAt(ROOM_ZONES, { x: 160, y: 360 })).toBe('bedroom');
  });

  it('resolves the shared boundary point house (320,300) to living', () => {
    expect(roomAt(ROOM_ZONES, { x: 320, y: 300 })).toBe('living');
  });

  it('resolves the shared-edge point house (408,240) to living', () => {
    expect(roomAt(ROOM_ZONES, { x: 408, y: 240 })).toBe('living');
  });

  it('returns null for the yard point outside every zone', () => {
    expect(roomAt(ROOM_ZONES, { x: 160, y: 120 })).toBeNull();
  });

  it('returns null for an empty zone list', () => {
    expect(roomAt([], { x: 480, y: 360 })).toBeNull();
  });

  // living zone: x 320..640, y 240..480
  it('excludes a point on the right/bottom edge of a zone', () => {
    expect(roomAt(ROOM_ZONES, { x: 640, y: 360 })).not.toBe('living');
    expect(roomAt(ROOM_ZONES, { x: 480, y: 480 })).not.toBe('living');
  });
});

describe('currentRoom store', () => {
  it('stores office when given the office id', () => {
    setCurrentRoom('office');
    expect(getCurrentRoom()).toBe('office');
    setCurrentRoom('living');
  });
});
