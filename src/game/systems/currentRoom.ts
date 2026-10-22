export type RoomId = 'living' | 'office' | 'bedroom';
export type Rect = { x: number; y: number; w: number; h: number };
export type Vec = { x: number; y: number };
export type RoomZone = Rect & { id: RoomId };

/** Zones tile the L exactly, so no entry-side tie-break is needed. */
export function roomAt(zones: RoomZone[], p: Vec): RoomId | null {
  for (const zone of zones) {
    if (
      p.x >= zone.x &&
      p.x < zone.x + zone.w &&
      p.y >= zone.y &&
      p.y < zone.y + zone.h
    ) {
      return zone.id;
    }
  }
  return null;
}
