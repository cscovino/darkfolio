import { afterEach, describe, expect, it } from 'vitest';
import { ROOM_ZONES } from '../data/rooms';
import {
  getCurrentRoom,
  setCurrentRoom,
  setCurrentRoomFrom,
} from '../state/currentRoom';
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

describe('currentRoom store defaults', () => {
  afterEach(() => setCurrentRoom('living'));

  it('round-trips setCurrentRoom for every room id', () => {
    for (const id of ['living', 'office', 'bedroom'] as const) {
      setCurrentRoom(id);
      expect(getCurrentRoom()).toBe(id);
    }
  });
});

describe('roomAt half-open edges', () => {
  it('excludes a point on the right/bottom edge of a zone', () => {
    // living zone: x 320..640, y 240..480
    expect(roomAt(ROOM_ZONES, { x: 640, y: 360 })).not.toBe('living');
    expect(roomAt(ROOM_ZONES, { x: 480, y: 480 })).not.toBe('living');
  });
});
