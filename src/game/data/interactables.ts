import type { Rect, RoomId } from '@/systems/currentRoom';

export type InteractableDef = {
  id: string;
  room: RoomId;
  rect: Rect;
  verb: string;
  speakerTag: string;
  overlay?: string;
  dialogPool: string[];
  statusPool?: string[];
};

// Registry order is meaningful: equal-gap nearest ties break by declaration order.
// Layout solids are centre-anchored; interactable rects are top-left like every other Rect.
export const INTERACTABLES: InteractableDef[] = [
  {
    id: 'computer',
    room: 'office',
    rect: { x: 510, y: 23, w: 20, h: 14 },
    verb: 'BOOT UP',
    speakerTag: '[COMPUTER]',
    overlay: '/projects',
    dialogPool: [
      'This computer contains my portfolio. It contains nothing else. It was expensive.',
      'The boot screen waited years for someone to read it. You are the someone. Briefly.',
      'A 16-bit house hosting a portfolio. We are not going to examine the metaphor.',
    ],
    statusPool: [
      'PROJECTS INDEX - 3 ENTRIES - ALL SHIPPED, PROBABLY',
      "LOADING... DONE. WELL, 'DONE' IS STRONG.",
      'NOTE TO SELF: REMEMBER THE README',
    ],
  },
  // Centre-anchored solids stored as true top-left (bookshelf 344,72 -> 336,40;
  // phone 96,270 -> 92,267) so the badge anchors (344,32)/(96,259) hold.
  {
    id: 'bookshelf',
    room: 'office',
    rect: { x: 336, y: 40, w: 16, h: 64 },
    verb: 'BROWSE',
    speakerTag: '[BOOKSHELF]',
    overlay: '/skills',
    dialogPool: [
      'The bookshelf judges you silently. It has done this for years. You are new.',
      'Ten books, all about the same thing. The spines are hidden. It is a portfolio.',
      'You want the skills list. It is in here. Somewhere between the dust and the wit.',
    ],
    statusPool: [
      'SKILLS INDEX - SORTED BY CONFIDENCE, MOSTLY',
      'ATTEMPTING TO DESCRIBE SELF IN BULLET POINTS',
      'THE LIST IS REAL. THE LIST IS ALWAYS REAL.',
    ],
  },
  {
    id: 'phone',
    room: 'bedroom',
    rect: { x: 92, y: 267, w: 8, h: 6 },
    verb: 'ANSWER',
    speakerTag: '[PHONE]',
    overlay: '/contact',
    dialogPool: [
      'The phone rings for a portfolio. Nobody is calling. It knows what it wants.',
      'No voicemail. Just three links and the faint smell of old plastic.',
      'You have read this page before. You keep pressing the button. Respect the button.',
    ],
    statusPool: [
      'CONTACT TERMINAL - 3 ADDRESSES FOUND',
      'PLEASE LEAVE A MESSAGE. THERE IS NO MACHINE.',
      'YOU ALREADY KNOW HOW THIS ENDS.',
    ],
  },
  // Layout solids are centre-anchored; stored as true top-left like the computer
  // (472,264 centre -> 464,256) so the UI-SPEC badge anchor (472,248) holds.
  {
    id: 'tv',
    room: 'living',
    rect: { x: 464, y: 256, w: 16, h: 16 },
    verb: 'WATCH',
    speakerTag: '[TV]',
    dialogPool: [
      'Static. Then a shape that might be a logo. Then static again. Portfolio-adjacent.',
      "The TV is showing tomorrow's weather for a house that does not exist.",
      'Someone left the TV on in 1994. The channel is still here. So is the furniture.',
    ],
  },
  {
    id: 'lamp',
    room: 'living',
    rect: { x: 512, y: 320, w: 16, h: 16 },
    verb: 'TOGGLE',
    speakerTag: '[LAMP]',
    dialogPool: [
      'The lamp hums like it has opinions. It does not share them.',
      'Warm light, off. Cold dark, on. That is the whole personality.',
      'You press the switch. Nothing happens. That is also the personality.',
    ],
  },
];
