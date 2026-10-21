import { afterEach, describe, expect, it } from 'vitest';
import {
  getCurrentRoom,
  setCurrentRoom,
  setCurrentRoomFrom,
} from '../state/currentRoom';
import { roomAt } from './currentRoom';
import type { RoomZone } from './currentRoom';

const ZONES: RoomZone[] = [
  { id: 'living', x: 320, y: 240, w: 320, h: 240 },
  { id: 'office', x: 320, y: 0, w: 320, h: 240 },
  { id: 'bedroom', x: 0, y: 240, w: 320, h: 240 },
];

describe('roomAt', () => {
  it('maps each room-zone center to its own id', () => {
    expect(roomAt(ZONES, { x: 480, y: 360 })).toBe('living');
    expect(roomAt(ZONES, { x: 480, y: 120 })).toBe('office');
    expect(roomAt(ZONES, { x: 160, y: 360 })).toBe('bedroom');
  });

  it('resolves the shared boundary point house (320,300) to living', () => {
    expect(roomAt(ZONES, { x: 320, y: 300 })).toBe('living');
  });

  it('resolves the shared-edge point house (408,240) to living', () => {
    expect(roomAt(ZONES, { x: 408, y: 240 })).toBe('living');
  });

  it('returns null for the yard point outside every zone', () => {
    expect(roomAt(ZONES, { x: 160, y: 120 })).toBeNull();
  });

  it('returns null for an empty zone list', () => {
    expect(roomAt([], { x: 480, y: 360 })).toBeNull();
  });
});

describe('setCurrentRoomFrom', () => {
  afterEach(() => setCurrentRoom('living'));

  it('stores office when given the office id', () => {
    setCurrentRoomFrom('office');
    expect(getCurrentRoom()).toBe('office');
  });

  it('keeps the last room when given null', () => {
    setCurrentRoom('bedroom');
    setCurrentRoomFrom(null);
    expect(getCurrentRoom()).toBe('bedroom');
  });
});
