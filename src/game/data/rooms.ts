import type { Rect, RoomZone } from '@/systems/currentRoom';
import type { DoorDef } from '@/systems/doorGlide';

// Anchor convention: RoomLayout walls/solids/decor tuples are CENTER-anchored (x,y = rect center,
// matching Phase 1's add.rectangle usage); DoorDef zone/gap rects, lane rects, and rest-body rects
// are TOP-LEFT (x,y = min corner).

export const TILE = 16;
export const ROOM_W = 20;
export const ROOM_H = 15;
export const WORLD_W = 640;
export const WORLD_H = 480;
export const SPAWN_X = 480;
export const SPAWN_Y = 448;

export const LIVING_ORIGIN = { x: 320, y: 240 };
export const OFFICE_ORIGIN = { x: 320, y: 0 };
export const BEDROOM_ORIGIN = { x: 0, y: 240 };
export const YARD_RECT: Rect = { x: 0, y: 0, w: 320, h: 240 };

export type RoomLayout = {
  floorA: number;
  floorB: number;
  wall: number;
  walls: [number, number, number, number][];
  solids: [number, number, number, number, number][];
  decor: [number, number, number, number, number][];
};

export const LIVING_LAYOUT: RoomLayout = {
  floorA: 0x4a3729,
  floorB: 0x6b4e3d,
  wall: 0x2a2a2a,
  walls: [
    [32, 8, 64, 16],
    [216, 8, 208, 16],
    [160, 232, 320, 16],
    [8, 48, 16, 64],
    [8, 176, 16, 96],
    [312, 120, 16, 240],
  ],
  solids: [
    [152, 24, 16, 16, 0x3d3d3d],
    [160, 56, 32, 16, 0x555555],
    [152, 88, 48, 16, 0x8b6f5e],
    [200, 88, 16, 16, 0x555555],
  ],
  decor: [
    [152, 24, 12, 8, 0x6b8fbf],
    [200, 84, 8, 8, 0xffa500],
    [88, 8, 48, 16, 0x8b6f5e],
    [65, 8, 2, 16, 0x9a7d64],
    [111, 8, 2, 16, 0x9a7d64],
    [8, 104, 16, 48, 0x8b6f5e],
    [8, 79, 16, 2, 0x9a7d64],
    [8, 129, 16, 2, 0x9a7d64],
    [312, 112, 16, 32, 0x241a10],
    [312, 104, 16, 2, 0x14100a],
    [312, 114, 16, 2, 0x14100a],
    [312, 124, 16, 2, 0x14100a],
    [160, 232, 32, 16, 0x241a10],
    [160, 228, 32, 2, 0x14100a],
    [160, 236, 32, 2, 0x14100a],
    [166, 232, 4, 4, 0x555555],
  ],
};

export const OFFICE_LAYOUT: RoomLayout = {
  floorA: 0x35402f,
  floorB: 0x42503c,
  wall: 0x2a2a2a,
  walls: [
    [32, 232, 64, 16],
    [216, 232, 208, 16],
    [160, 8, 320, 16],
    [8, 120, 16, 240],
    [312, 120, 16, 240],
  ],
  solids: [
    [200, 40, 64, 24, 0x5a4a32],
    [200, 30, 20, 14, 0x3d3d3d],
    [200, 68, 20, 16, 0x3d2f1f],
    [24, 72, 16, 64, 0x3d2f1f],
    [24, 168, 24, 24, 0x555555],
    [56, 32, 10, 10, 0x555555],
    [136, 200, 12, 12, 0x6b4e3d],
    [24, 214, 12, 12, 0x6b4e3d],
    [272, 120, 24, 20, 0x5a4a32],
  ],
  decor: [
    [88, 232, 48, 16, 0x8b6f5e],
    [65, 232, 2, 16, 0x9a7d64],
    [111, 232, 2, 16, 0x9a7d64],
    [200, 26, 14, 6, 0x6b8fbf],
    [56, 24, 8, 8, 0xffa500],
    [24, 56, 12, 4, 0x6b8fbf],
    [24, 72, 12, 4, 0x8b6f5e],
    [24, 88, 12, 4, 0x5a7a4a],
    [272, 112, 12, 8, 0x555555],
    [200, 140, 96, 64, 0x46534a],
  ],
};

export const BEDROOM_LAYOUT: RoomLayout = {
  floorA: 0x2e2118,
  floorB: 0x3a2c1e,
  wall: 0x241c14,
  walls: [
    [312, 48, 16, 64],
    [312, 176, 16, 96],
    [160, 8, 320, 16],
    [160, 232, 320, 16],
    [8, 120, 16, 240],
  ],
  solids: [
    [56, 56, 48, 80, 0x4a3729],
    [96, 36, 20, 20, 0x4a3729],
    [96, 30, 8, 6, 0x555555],
    [240, 200, 48, 48, 0x4a3729],
    [28, 176, 24, 48, 0x4a3729],
    [128, 40, 10, 10, 0x555555],
  ],
  decor: [
    [56, 68, 48, 56, 0x31261c],
    [56, 28, 32, 14, 0x8b6f5e],
    [28, 158, 16, 12, 0x8fa5b5],
    [128, 32, 8, 8, 0xffa500],
    [160, 152, 80, 56, 0x4a3423],
    [208, 152, 12, 8, 0x6b4e3d],
    [312, 104, 16, 48, 0x8b6f5e],
    [312, 79, 16, 2, 0x9a7d64],
    [312, 129, 16, 2, 0x9a7d64],
  ],
};

type YardLayout = {
  ground: [number, number, number, number, number];
  patches: [number, number, number, number, number][];
  props: [number, number, number, number, number][];
};

export const YARD_LAYOUT: YardLayout = {
  ground: [160, 120, 320, 240, 0x1c1a14],
  patches: [
    [72, 76, 64, 32, 0x22261a],
    [228, 140, 96, 40, 0x22261a],
    [120, 192, 48, 24, 0x22261a],
  ],
  props: [
    [82, 104, 4, 16, 0x2a2a20],
    [82, 90, 20, 4, 0x2a2a20],
    [82, 82, 12, 4, 0x2a2a20],
    [163, 178, 6, 20, 0x241c14],
    [211, 178, 6, 20, 0x241c14],
    [259, 178, 6, 20, 0x241c14],
    [211, 172, 102, 4, 0x241c14],
  ],
};

export const ROOM_ZONES: RoomZone[] = [
  { id: 'living', x: 320, y: 240, w: 320, h: 240 },
  { id: 'office', x: 320, y: 0, w: 320, h: 240 },
  { id: 'bedroom', x: 0, y: 240, w: 320, h: 240 },
];

export const DOOR_NORTH: DoorDef = {
  id: 'north',
  zone: { x: 384, y: 216, w: 48, h: 48 },
  gap: { x: 384, y: 224, w: 48, h: 32 },
  axis: { x: 408, y: 240 },
  sides: [
    { from: 'living', dir: 'up', dest: 'office' },
    { from: 'office', dir: 'down', dest: 'living' },
  ],
};

export const DOOR_WEST: DoorDef = {
  id: 'west',
  zone: { x: 296, y: 320, w: 48, h: 48 },
  gap: { x: 304, y: 320, w: 32, h: 48 },
  axis: { x: 320, y: 344 },
  sides: [
    { from: 'living', dir: 'left', dest: 'bedroom' },
    { from: 'bedroom', dir: 'right', dest: 'living' },
  ],
};

export const DOORS: DoorDef[] = [DOOR_NORTH, DOOR_WEST];
