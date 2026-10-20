# Phase 2: Multi-Room - Pattern Map

**Mapped:** 2026-10-20
**Files analyzed:** 9 (6 new, 3 modified; one new `data/` dir is a no-analog file)
**Analogs found:** 7 / 9

## Layout Flag (resolve before planning geometry)

CONTEXT.md D-12 says the notch is "northeast of the L". With D-09 adjacency (Office directly **above** Living, Bedroom directly **left** of Living), the L occupies top-right, bottom-right, bottom-left cells of the 2×2 bounding box. The empty cell is **top-left (northwest)**. Either D-12 has a compass typo, or the topology is different from what D-09 states. Planner should confirm and use the empty cell that the topology actually produces.

Suggested coordinates consistent with D-09 (world origin top-left, all rooms 320×240 px at 16 px tiles):

| Room | Origin (px) | Size (px) | Notes |
|------|-------------|-----------|-------|
| Bedroom | (0, 240) | 320×240 | left of Living, shares vertical wall at x=320 |
| Living Room | (320, 240) | 320×240 | existing SPAWN_X/SPAWN_Y must be offset by (320, 240) |
| Office | (320, 0) | 320×240 | above Living, shares horizontal wall at y=240 |
| Notch (exterior) | (0, 0) | 320×240 | non-walkable yard, D-12 |

World bounds become 640×480. Phase 1 constants `WORLD_W`/`WORLD_H` (320×240, origin 0,0) refer to the Living Room alone; they must be redefined or joined by per-room origins, otherwise `setBounds(0,0,WORLD_W,WORLD_H)` and `setCollideWorldBounds(true)` clip the player to the wrong box.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/game/scenes/OfficeScene.ts` | scene (room builder) | request-response (input → physics → render) | `src/game/scenes/LivingRoomScene.ts` | exact |
| `src/game/scenes/BedroomScene.ts` | scene (room builder) | request-response | `src/game/scenes/LivingRoomScene.ts` | exact |
| `src/game/scenes/LivingRoomScene.ts` (modify) | scene | request-response | itself | exact |
| `src/game/objects/Player.ts` (modify) | object (physics sprite) | request-response | itself | exact |
| `src/game/main.ts` (modify) | config / scene registry | config | itself | exact |
| `src/game/systems/currentRoom.ts` + `.test.ts` | utility (pure zone math) | transform | `src/game/systems/movement.ts` + `movement.test.ts` | exact |
| `src/game/systems/doorGlide.ts` + `.test.ts` | utility (pure glide endpoint math) | transform | `src/game/systems/movement.ts` | role-match |
| `src/game/data/rooms.ts` (per-room layout data) | config (data) | transform | `LivingRoomScene.ts` lines 4–20 (constants block) | partial |
| `src/game/state/currentRoom` store (game-level state, D-11) | store | pub-sub read | none in repo | no analog |

## Pattern Assignments

### `src/game/scenes/OfficeScene.ts` and `src/game/scenes/BedroomScene.ts` (scene, request-response)

**Analog:** `src/game/scenes/LivingRoomScene.ts`

**Imports pattern** (`LivingRoomScene.ts` lines 1–2):
```typescript
import { Player, ensurePlayerTexture } from '@/objects/Player';
import Phaser from 'phaser';
```

**Constants / coordinate contract** (`LivingRoomScene.ts` lines 4–20):
```typescript
export const TILE = 16;
export const ROOM_W = 20;
export const ROOM_H = 15;
export const WORLD_W = ROOM_W * TILE;
export const WORLD_H = ROOM_H * TILE;
export const SPAWN_X = 160;
export const SPAWN_Y = 208;

const WALL = 0x2a2a2a;
const FLOOR_A = 0x4a3729;
const FLOOR_B = 0x6b4e3d;
const THRESHOLD = 0x8b6f5e;
```
Per D-18, Office and Bedroom each get their own palette block in this same style (Office: muted greens/greys; Bedroom: deep browns with a warm lamp accent). Keep `WALL` shared or per-room as the planner chooses.

**Class skeleton + solids group** (`LivingRoomScene.ts` lines 22–35):
```typescript
export class LivingRoomScene extends Phaser.Scene {
  private player!: Player;
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

  constructor() {
    super('LivingRoomScene');
  }

  create(): void {
    this.drawFloor();

    this.solids = this.physics.add.staticGroup();
```

**Wall rect array + solid helper** (`LivingRoomScene.ts` lines 36–46, 94–102):
```typescript
const walls = [
  [WORLD_W / 2, TILE / 2, WORLD_W, TILE],
  [WORLD_W / 2, WORLD_H - TILE / 2, WORLD_W, TILE],
  [TILE / 2, 56, TILE, 80],
  [TILE / 2, 176, TILE, 96],
  // ...
];
for (const [x, y, w, h] of walls) {
  this.solid(x, y, w, h, WALL);
}
```
```typescript
private solid(x: number, y: number, w: number, h: number, color: number): void {
  this.solids.add(this.add.rectangle(x, y, w, h, color));
}
```
Gap math: a 48 px door (D-02) is an opening between two wall rects, e.g. north wall split into two rects around the gap. Living Room's existing 32 px gap (rows 6–7, y 96–128) is the one to widen to 48 px.

**Threshold visual, no body** (`LivingRoomScene.ts` lines 48–50):
```typescript
// D-02 door gaps (rows 6–7): visual thresholds only, no body.
this.add.rectangle(TILE / 2, 112, TILE, 32, THRESHOLD);
```

**Furniture = collision rect + accent** (`LivingRoomScene.ts` lines 52–58):
```typescript
this.solid(152, 24, 16, 16, TV_CASING);
this.add.rectangle(152, 24, 12, 8, TV_SCREEN);
this.solid(160, 56, 32, 16, METAL);
```
D-16 requires computer, bookshelf (Office) and phone on nightstand (Bedroom) as collision-only rects in `solids` at their future Phase 3 attach points.

**Floor** (`LivingRoomScene.ts` lines 84–92):
```typescript
private drawFloor(): void {
  const g = this.add.graphics();
  for (let row = 0; row < ROOM_H; row++) {
    for (let col = 0; col < ROOM_W; col++) {
      g.fillStyle((row + col) % 2 === 0 ? FLOOR_A : FLOOR_B);
      g.fillRect(col * TILE, row * TILE, TILE, TILE);
    }
  }
}
```
Add the room's origin offset (D-09) to `col * TILE` / `row * TILE`, and use per-room tones (D-18).

**Input + camera** (`LivingRoomScene.ts` lines 60–82):
```typescript
ensurePlayerTexture(this);
this.player = new Player(this, SPAWN_X, SPAWN_Y);
this.physics.add.collider(this.player, this.solids);
this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

const cam = this.cameras.main;
cam.setBounds(0, 0, WORLD_W, WORLD_H);
cam.setZoom(4);
cam.startFollow(this.player, true, 0.05, 0.05);

const kb = this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
this.cursors = kb.createCursorKeys();
this.wasd = kb.addKeys('W,A,S,D') as LivingRoomScene['wasd'];
```
```typescript
update(): void {
  this.player.handleInput({
    left: this.cursors.left.isDown || this.wasd.A.isDown,
    right: this.cursors.right.isDown || this.wasd.D.isDown,
    up: this.cursors.up.isDown || this.wasd.W.isDown,
    down: this.cursors.down.isDown || this.wasd.S.isDown,
  });
}
```

**Scene-split warning:** D-09 says doors do not teleport the camera and the player physically crosses the wall. A `scene.start` per room would destroy the player and camera continuity. If the planner keeps three scene classes, they must share ONE live world (one physics world, one player, one camera) — e.g. a shared `buildRoom(scene, origin, layout)` helper called from each room's `create`, or a single world scene that composes room modules. Do not `scene.start` between rooms. Phase 1 has no multi-scene precedent beyond `Boot→Preload→Gate→LivingRoom` (`BootScene.ts:9`, `PreloadScene.ts:9`, `GateScene.ts:29`).

---

### `src/game/scenes/LivingRoomScene.ts` (modify: north + west doors, sealed east door, locked front-door decoration, origin offset)

**Analog:** itself (lines 36–50 wall list and gap rects).

Changes driven by decisions:
- D-01: north wall gets a working gap (off-center, left of TV cluster per D-03, clear lane into room); west wall gets a working gap to Bedroom. East gap (currently `add.rectangle(WORLD_W - TILE / 2, 112, TILE, 32, THRESHOLD)`, line 50) becomes a sealed boarded decoration, not a zone (D-04).
- D-08: locked front-door decoration on the bottom wall directly behind SPAWN (SPAWN_X=160, SPAWN_Y=208 at lines 9–10), no body beyond the wall.
- D-02: all working gaps 48 px, not 32 px.
- Shift all coordinates by the Living origin (320, 240) if the L layout in the table above is adopted.
- Keep the TV/coffee table/couch/lamp rects (lines 53–58) unchanged (D-03).

---

### `src/game/objects/Player.ts` (modify: entry position + input lock)

**Analog:** itself.

**Constructor (lines 43–48)** already accepts `(scene, x, y)`; spawn-from-door support is just passing the entry position from `doorGlide` output. No new constructor needed.
```typescript
constructor(scene: Phaser.Scene, x: number, y: number) {
  super(scene, x, y, texKey('up'));
  scene.add.existing(this);
  scene.physics.add.existing(this);
  this.setCollideWorldBounds(true);
}
```

**Input path (lines 50–67):** `handleInput` sets velocity and facing. For D-13 input lock, gate the scene's `update()` call (`LivingRoomScene.ts:75–82`) on a lock flag rather than adding state to Player; the glide then drives position via a tween or manual lerp while `handleInput` is skipped. Facing during the glide (D-14) can be set via `setTexture(texKey(dir))` — `texKey` is module-private, so either export it or add a `setFacing(f: Facing)` method that reuses the existing branch at lines 63–66.

**Note:** `setCollideWorldBounds(true)` (line 47) uses the physics world bounds set in the scene (`LivingRoomScene.ts:63`). If the world is the 640×480 L bounding box, bounds must match that, not the per-room WORLD_W/WORLD_H.

---

### `src/game/systems/currentRoom.ts` + `currentRoom.test.ts` (utility, transform)

**Analog:** `src/game/systems/movement.ts` (lines 1–19) and `movement.test.ts` (lines 1–8).

Pure, framework-free module, no Phaser import, exports types + functions. Follow the same shape:
```typescript
export type KeyState = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
};

export function velocityFromKeys(
  keys: KeyState,
  speed: number,
): { x: number; y: number } {
  // ...
  return { x: x * speed, y: y * speed };
}
```
Test file pattern (`movement.test.ts` lines 1–8):
```typescript
import { describe, expect, it } from 'vitest';
import { velocityFromKeys } from './movement';

const none = { left: false, right: false, up: false, down: false };
const SPEED = 120;

describe('velocityFromKeys', () => {
  it('is zero when idle', () => {
    expect(velocityFromKeys(none, SPEED)).toEqual({ x: 0, y: 0 });
  });
```
Planned API: `RoomZone = { id: 'living'|'office'|'bedroom', x, y, w, h }`, `roomAt(zones, cx, cy, entrySide?)` (doorway overlap resolves by entry side, D-11). Test cases: each room's center maps to its id; overlap band resolves to the side the player came from; outside all zones returns null (exterior notch).

Vitest config includes `src/**/*.test.ts` (`PLAN.md` vitest.config.ts line 340).

---

### `src/game/systems/doorGlide.ts` + `doorGlide.test.ts` (utility, transform)

**Analog:** `src/game/systems/movement.ts` (same pure-function style).

Planned pure function: given door rect, travel direction, destination room origin, returns `{ start, end }` where `end` = door axis center + 2 tiles (32 px) into destination along travel vector (D-14). Deterministic per door. Use `Math.SQRT1_2`-style constants only if needed; prefer plain arithmetic. Ease-in-out and 0.6–0.8 s duration (D-13) belong in the scene's tween call, not the pure module; the existing lerp values `startFollow(..., 0.05, 0.05)` (`LivingRoomScene.ts:68`) are the camera easing to reuse.

No pattern to copy for the glide itself — none exists. Test cases: same door always yields same end tile; end lies on door axis; direction reversal from the far side lands 2 tiles inside the opposite room.

---

### `src/game/data/rooms.ts` (config/data, transform) — partial analog

**Analog:** constants block in `LivingRoomScene.ts` lines 4–20 (no `src/game/data/` directory exists yet; PLAN.md lists it under game/).

Per D-10, per-room layout goes in data modules: rect lists for walls, gaps, furniture, plus palette. Keep it as plain typed arrays exported from the module, mirroring the `walls = [[x,y,w,h], ...]` tuple style at `LivingRoomScene.ts` lines 36–43. Do not introduce a tilemap JSON pipeline (D-10).

---

### `src/game/main.ts` (modify: scene registration)

**Analog:** itself (lines 1–5 imports, line 17 scene list).

```typescript
import { BootScene } from '@/scenes/BootScene';
import { GateScene } from '@/scenes/GateScene';
import { LivingRoomScene } from '@/scenes/LivingRoomScene';
import { PreloadScene } from '@/scenes/PreloadScene';
import Phaser from 'phaser';
// ...
scene: [BootScene, PreloadScene, GateScene, LivingRoomScene],
```
Add `OfficeScene` and/or `BedroomScene` only if they are separate Phaser scenes; under the continuous-world approach (D-09) they are either composed inside LivingRoomScene or booted as an additional shared-world scene. Keep import alias style `@/scenes/...`.

---

### Currentroom state store (D-11) — no analog

No game-level state module exists in `src/game/`. Phase 3–5 need to read a single `currentRoom` value. Closest mechanisms: Phaser's `this.game.registry` (`set`/`get`) or a plain exported module-level object. No existing usage in repo. Planner should choose one; the plain module is simpler and matches the "framework-free" style of `systems/`. Note the ponytail rule: prefer the smallest option that Phases 3–5 can read.

---

## Shared Patterns

### Physics solids group
**Source:** `src/game/scenes/LivingRoomScene.ts` lines 24, 35, 44–46, 62, 94–102
**Apply to:** Office, Bedroom, and any updated Living Room geometry. Single `StaticGroup` per room (or per world) with one collider against the player.
```typescript
this.solids = this.physics.add.staticGroup();
this.solid(x, y, w, h, COLOR);          // adds a rectangle to the group
this.physics.add.collider(this.player, this.solids);
```

### Graphics-drawn floor + placeholder rects (no assets)
**Source:** `LivingRoomScene.ts` lines 84–92 (floor), 49–50 (threshold), 101 (solid rect)
**Apply to:** all three rooms and the exterior notch (D-12 ground tone via the same fillRect pattern).

### Runtime player texture
**Source:** `src/game/objects/Player.ts` lines 20–37 (`ensurePlayerTexture`)
**Apply to:** every scene that spawns the Player; call before `new Player(...)`, as `LivingRoomScene.ts:60` does.

### Camera
**Source:** `LivingRoomScene.ts` lines 65–68
**Apply to:** every scene. Reuse `setZoom(4)` and `startFollow(player, true, 0.05, 0.05)`. Bounds must match the world (see Layout Flag).

### Keyboard input
**Source:** `LivingRoomScene.ts` lines 70–81
**Apply to:** the door try-the-handle gesture (D-07) reads the same `cursors`/`wasd` keys; check the key direction against the adjacent door, do not add new key bindings.

### Pure-module + vitest
**Source:** `src/game/systems/movement.ts`, `movement.test.ts`
**Apply to:** `currentRoom.ts`, `doorGlide.ts`.

### Path aliases
**Source:** `.planning/PLAN.md` §Path Aliases (`@/scenes/*`, `@/objects/*`, `@/systems/*`, `@/game/*`)
**Apply to:** all new imports. Use `@/systems/currentRoom` etc. in scenes; relative `./` only inside a test importing its sibling module, as `movement.test.ts:2` does.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/game/state/...` (currentRoom store, D-11) | store | pub-sub read | No shared game-level state module exists |
| Glide tween on player/camera (D-13) | controller | event-driven | No tween or transition code exists yet; Phaser `this.tweens.add` is the standard path |
| Door zone overlap detection | system | event-driven | No overlap/zone code exists; Phaser `physics.add.overlap` or pure rect math (see `currentRoom.ts`) |

Planner should use RESEARCH.md-equivalent guidance (Phaser 4.2.1 API) for these, not the codebase.

## Metadata

**Analog search scope:** `src/game/**`, `src/test/**`, `.planning/PLAN.md`, `.planning/phases/01-core-game-loop/`
**Files scanned:** 9 source files read or excerpted (LivingRoomScene, Player, main, movement + test, plus git-tracked src list)
**Pattern extraction date:** 2026-10-20
