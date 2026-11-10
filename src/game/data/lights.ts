import type { RoomId } from '@/systems/currentRoom';
import { TILE } from './rooms';

export type LightKind = 'lamp' | 'screen';

export type LightDef = {
  id: string;
  room: RoomId;
  x: number;
  y: number;
  radius: number;
  color: number;
  kind: LightKind;
};

export const LAMP_RADIUS = 3 * TILE;
export const SCREEN_RADIUS = 1.5 * TILE;
export const TORCH_RADIUS = 2.5 * TILE;
export const TORCH_COLOR = 0xffa500;
export const TINT_ALPHA = 0.2;
export const TORCH_TINT_ALPHA = 0.14;
export const TORCH_LOBE_OFFSET = 20;
export const TORCH_LOBE_SCALE = 0.7;
export const TORCH_LOBE_ALPHA = 0.5;

const WARM = 0xffa500;
const COLD = 0x6b8fbf;

export const LIGHTS: LightDef[] = [
  {
    id: 'living-lamp',
    room: 'living',
    x: 520,
    y: 324,
    radius: LAMP_RADIUS,
    color: WARM,
    kind: 'lamp',
  },
  {
    id: 'living-tv',
    room: 'living',
    x: 472,
    y: 264,
    radius: SCREEN_RADIUS,
    color: COLD,
    kind: 'screen',
  },
  {
    id: 'office-lamp',
    room: 'office',
    x: 376,
    y: 24,
    radius: LAMP_RADIUS,
    color: WARM,
    kind: 'lamp',
  },
  {
    id: 'office-computer',
    room: 'office',
    x: 520,
    y: 26,
    radius: SCREEN_RADIUS,
    color: COLD,
    kind: 'screen',
  },
  {
    id: 'bedroom-lamp',
    room: 'bedroom',
    x: 128,
    y: 272,
    radius: LAMP_RADIUS,
    color: WARM,
    kind: 'lamp',
  },
];
