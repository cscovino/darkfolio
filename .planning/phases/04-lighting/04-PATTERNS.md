# Phase 4: Lighting - Pattern Map

**Mapped:** 2026-11-05
**Files analyzed:** 9 (5 new, 4 modified/consulted)
**Analogs found:** 8 / 9 (the render technique has no in-repo analog)

Source of truth: `04-CONTEXT.md` (D-01…D-21). PLAN.md's radii, lamp-toggle test and all-lights-flicker lines are overridden (D-20). No RESEARCH.md exists for this phase.

## Coordinate Contract (read before writing any light or occlusion code)

- `RoomLayout` tuples (`walls`, `solids`, `decor`, lamp/screen hints) are **CENTER-anchored**: `[x, y, w, h]` = rect center. `buildRoom.ts:22` draws `scene.add.rectangle(origin.x + x, origin.y + y, w, h, …)`. Top-left = `x - w/2, y - h/2`.
- `DoorDef.zone`, `DoorDef.gap`, `ROOM_ZONES`, `YARD_RECT` are **TOP-LEFT** (`rooms.ts:4-6` comment).
- Light centers are therefore the exact `[x, y]` of the lamp/screen decor tuples. Wall occluders must be converted to top-left before point-in-rect tests.
- `TILE = 16` (`rooms.ts:8`). Radii: torch 4 tiles = 64 px, lamps 5–6 tiles = 80–96 px, TV/computer 2–3 tiles = 32–48 px (D-10 / Discretion).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/game/data/lights.ts` (new) | config / data registry | transform (static) | `src/game/data/rooms.ts` (`DOORS`, `ROOM_ZONES`) | role-match |
| `src/game/systems/lightFlicker.ts` (new) | utility (pure) | transform | `src/game/systems/variants.ts` (deterministic cycle) | role-match |
| `src/game/systems/lightFlicker.test.ts` (new) | test | — | `src/game/systems/variants.test.ts`, `doorGlide.test.ts` | exact |
| `src/game/systems/lighting.ts` (new) | utility (pure: veil alpha, occlusion, tint) | transform | `src/game/systems/currentRoom.ts` (`roomAt`) + `doorGlide.ts` (`insideRect`) | role-match |
| `src/game/systems/lighting.test.ts` (new) | test | — | `src/game/systems/currentRoom.test.ts`, `doorGlide.test.ts` | exact |
| `src/game/objects/Light.ts` (new) | component (Phaser render helper) | event-driven (per-frame update) | `src/game/objects/Player.ts` (`ensurePlayerTexture` + class) | role-match |
| `src/game/scenes/LivingRoomScene.ts` (modified) | scene | event-driven | itself: `create()` 71–98, `update()` 136, `startGlide()` 221–243 | exact |
| `src/game/objects/Player.ts` (consulted, likely unchanged) | component | request-response | itself: `getFacing()` line 72 | exact |
| `src/game/scenes/buildRoom.ts` (consulted, likely unchanged) | utility | transform | itself | exact |

## Pattern Assignments

### `src/game/data/lights.ts` (config, transform)

**Analog:** `src/game/data/rooms.ts`

**Imports pattern** (`rooms.ts` lines 1-2):
```typescript
import type { Rect, RoomZone } from '@/systems/currentRoom';
import type { DoorDef } from '@/systems/doorGlide';
```

**Registry pattern** (`rooms.ts` lines 160-164, 188) — data-as-tuples, exported typed constant:
```typescript
export const ROOM_ZONES: RoomZone[] = [
  { id: 'living', x: 320, y: 240, w: 320, h: 240 },
  ...
];
export const DOORS: DoorDef[] = [DOOR_NORTH, DOOR_WEST];
```

**Apply:** a `LightDef` type `{ id, room: RoomId, x, y, radius, color, kind: 'lamp'|'screen'|'torch', flicker }` and a `LIGHTS: LightDef[]` array. Source coordinates come from the existing hint tuples (copy, do not re-derive):
- Living lamp `0xffa500`: `LIVING_LAYOUT.decor` line 50 `[200, 84, 8, 8, 0xffa500]` → world center = `LIVING_ORIGIN + (200, 84)` = (520, 324) (tuple x,y is already the center).
- Living TV `0x6b8fbf`: `LIVING_LAYOUT.decor` line 49 `[152, 24, 12, 8, 0x6b8fbf]` → world (472, 264).
- Office lamp `0xffa500`: `OFFICE_LAYOUT.decor` line 95 `[56, 24, 8, 8, 0xffa500]` → world (376, 24).
- Office computer `0x6b8fbf`: `OFFICE_LAYOUT.decor` line 94 `[200, 26, 14, 6, 0x6b8fbf]` → world (520, 26).
- Bedroom lamp `0xffa500`: `BEDROOM_LAYOUT.decor` line 127 `[128, 32, 8, 8, 0xffa500]` → world (128, 272).

Keep the registry as data (D-10 radii live here, not in code). Add a guard test in the style of `rooms.test.ts` only if it adds value (AGENTS.md: no trivial tests).

**Torch** is not a registry entry: it is the player's light (D-08), created from `Player` position + `getFacing()`.

---

### `src/game/systems/lightFlicker.ts` (utility, transform) + `.test.ts`

**Analog:** `src/game/systems/variants.ts` (deterministic, no randomness, testable), `src/game/systems/movement.ts` (framework-free).

**Deterministic-cycle pattern** (`variants.ts` lines 17-20):
```typescript
// Visit N shows pool[(N-1) % pool.length] — deterministic cycle, no randomness (D-16).
export function variantFor(count: number, pool: string[]): string {
  return pool[(count - 1) % pool.length];
}
```

**Framework-free pure-module pattern** (`movement.ts` lines 1-19): exported type + exported pure function, no Phaser import.

**Apply:**
- Seeded step table per lamp (D-14): a small LCG/xorshift seeded by lamp `id` hash, producing brightness steps at 0.5–1.5 s intervals. No `Math.random()` (must be testable). Export `brightnessAt(seed, timeMs): number`.
- TV/computer use a separate, gentler amplitude/cadence table (D-15).
- Torch returns constant 1 (D-16).
- Brightness only — the export must never return a radius (D-14).

**Test analog** (`doorGlide.test.ts` lines 1-20): `import { describe, expect, it } from 'vitest';`, `describe`/`it`/`expect`, relative import `./lightFlicker`.

---

### `src/game/systems/lighting.ts` (utility, transform) — veil, occlusion, tint

**Analog:** `src/game/systems/currentRoom.ts` (`roomAt`, lines 7-19) and `src/game/systems/doorGlide.ts` (`insideRect`, lines 18-25, module-private — copy the shape, do not import it, or export it deliberately).

**Point-in-rect pattern** (`doorGlide.ts` lines 18-25):
```typescript
function insideRect(rect: Rect, p: Vec): boolean {
  return (
    p.x >= rect.x &&
    p.x < rect.x + rect.w &&
    p.y >= rect.y &&
    p.y < rect.y + rect.h
  );
}
```

**Apply:**
- **Occlusion (D-03, walls only):** test segment light→pixel against `layout.walls` only (not `solids`, not `decor`). Pass through `DOOR.gap` rects (top-left, `rooms.ts:166-186`) so light crosses doorways. Walls translated by `LIVING/OFFICE/BEDROOM_ORIGIN` and converted from center to top-left.
- **Veil (D-01, D-04):** key the veil on `getCurrentRoom()` (`state/currentRoom.ts:5`), **not** `roomAt()`. Pitfall: `ROOM_ZONES` (`rooms.ts:160-164`) do not cover the yard notch (x<320, y<240), so `roomAt` returns `null` there and would wrongly darken the yard (D-04 says it shares the current room's veil).
- **Veil fade (D-05):** export a pure `veilAlpha(from, to, t)` / fade-step function; ~0.4 s is the intent (Discretion).
- **Falloff (D-06):** 2-step quantized falloff, e.g. `Math.ceil` into 2 steps, not a smooth gradient.
- **Tint (D-11):** pure function `tintFor(sources, point)` returning a warm/cold weight; objects under cold pool read cold.

**Test analog:** `currentRoom.test.ts` / `doorGlide.test.ts` (see `lightFlicker.test.ts` above). Test occlusion membership and tint math here; visuals are browser-verified (`pnpm dev`).

---

### `src/game/objects/Light.ts` (component, event-driven)

**Analog:** `src/game/objects/Player.ts`

**Texture-generation pattern** (`Player.ts` lines 16-35) — code-drawn textures, `scene.textures.exists` guard, `generateTexture`, `destroy`:
```typescript
export function ensurePlayerTexture(scene: Phaser.Scene): void {
  for (const facing of FACINGS) {
    const key = texKey(facing);
    if (scene.textures.exists(key)) continue;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0x4a5a4a);
    g.fillRect(0, 0, 32, 32);
    ...
    g.generateTexture(key, 32, 32);
    g.destroy();
  }
}
```

**Class pattern** (`Player.ts` lines 37-46): `export class Player extends Phaser.Physics.Arcade.Sprite`, `constructor(scene, x, y)`, `scene.add.existing(this)`.

**Apply:** a light-pool texture (radial, 2-step rings — D-06) generated once with the same `textures.exists` guard, keyed per radius/color. Per-frame update applies brightness from `lightFlicker` (lamps/screens) and facing-weighted scale from `getFacing()` (torch, D-08). Only `alpha`/`scale`, never radius (D-14). Source bulb rect stays full-bright (D-12): do not overlay it.

**Phaser API:** no in-repo lighting/blend-mode usage exists (`grep` for `ignore|addCamera` finds only `InteractionUI.ts` and `LivingRoomScene.ts`). Researcher/planner must verify Phaser 4.2.1 blend-mode / render-texture APIs before implementation; do not guess them.

---

### `src/game/scenes/LivingRoomScene.ts` (scene, event-driven) — modified

**Analog:** itself.

**Create-order / camera pattern** (lines 85-98):
```typescript
const cam = this.cameras.main;
cam.setBounds(0, 0, WORLD_W, WORLD_H);
cam.setZoom(4);
cam.startFollow(this.player, true, 0.05, 0.05);
...
// Constructed last: the UI camera ignores every child that exists at
// construction time, so anything added after it would double-render.
this.ui = new InteractionUI(this);
```

**Critical ordering constraint:** `InteractionUI.ts:93-95` does `uiCam.ignore(scene.children.list.filter((child) => child !== this.layer))` at construction. Therefore **all lighting display objects must be created BEFORE `new InteractionUI(this)` (line 98)**. Then the UI camera ignores them (D-17 — UI stays full-bright) and only the world camera renders the light layer. Created after → UI camera renders them on top of the UI (wrong).

**Per-frame update pattern** (`update(_time, delta)` line 136; mode gating at lines 137-165; `handleInput` line 174):
```typescript
update(_time: number, delta: number): void {
  if (this.mode === 'typing') {
    const text = this.dialogText;
    this.typedElapsed += delta;
    ...
```
Apply: call the lighting update after the mode branch but **do not gate on `mode`** (D-18: lighting runs while UI is open). Flicker and torch update every frame regardless of `this.mode`/`gliding`.

**Glide hook pattern** (`startGlide` lines 221-243): tween with `onComplete` that calls `setCurrentRoom(side.dest)` (line 239). D-05's veil fade must start at the wall line mid-glide, **not** in `onComplete` (which is the "delayed flip on arrival" D-05 rejects). Use the player's position against the door axis / `glideEnd` (`doorGlide.ts:40`) inside a tween `onUpdate`, or `this.tweens.add` for the fade with `duration ≈ 400`.

**Room-change timing:** `setCurrentRoom` is only called in `create()` (line 72) and at glide end (line 239); keep it that way — the veil is keyed to `getCurrentRoom()`.

---

### `src/game/objects/Player.ts` (component) — consulted, likely unchanged

**Facing pattern** (lines 67-74): `setFacing(f)` and `getFacing(): Dir`. The torch (D-08) reads `this.player.getFacing()` from the scene's update. Facing is `Dir` from `doorGlide.ts:3` (`'up'|'down'|'left'|'right'`); map each to a direction vector in `lighting.ts`.

Player is a physics sprite; the torch center is `player.x, player.y` (no extra offset needed — 32×32 sprite centered via Arcade defaults).

---

### `src/game/scenes/buildRoom.ts` (utility) — consulted, likely unchanged

`buildRoom(scene, solids, layout, origin)` (lines 7-31) draws all room geometry. Lighting does **not** attach here (CONTEXT canonical refs: "lighting hangs off room geometry, not per-room code"). The walls it draws (`layout.walls`, line 20-24) are the occluder source — read them from the layout data, do not re-draw.

## Shared Patterns

### Pure module + co-located vitest
**Source:** `src/game/systems/variants.ts`, `movement.ts`, `doorGlide.ts`; tests `doorGlide.test.ts` (imports `describe, expect, it` from `vitest`, `./<module>` relative import).
**Apply to:** `lightFlicker.ts`, `lighting.ts`.
Framework-free: no `import Phaser`. Phaser-touching code lives in `objects/Light.ts` and the scene.

### Data registry as tuples
**Source:** `src/game/data/rooms.ts` (`DOORS`, `ROOM_ZONES`, `*_LAYOUT`).
**Apply to:** `lights.ts`. Source positions copied from `decor` hint tuples (listed above).

### Path aliases
**Source:** `LivingRoomScene.ts` lines 1-40 use `@/data/...`, `@/systems/...`, `@/objects/...`, `@/scenes/...`, `@/state/...`. Use `@/systems/lighting`, `@/data/lights`, `@/objects/Light` in new imports. Tests use relative imports (`doorGlide.test.ts:2`).

### Center vs top-left anchoring
**Source:** `rooms.ts:4-6` comment; `buildRoom.ts:22`.
**Apply to:** every rect in `lights.ts` and `lighting.ts` occluder math. Mixing these is the most likely bug.

## No Analog Found

| File / Concern | Role | Data Flow | Reason |
|----------------|------|-----------|--------|
| Light-pool rendering technique (blend mode / RenderTexture / veil overlay) | render | transform | No lighting, blend-mode or RenderTexture usage in the repo. Use RESEARCH-level Phaser 4.2.1 docs; verify APIs before planning. |
| Per-frame occluded pool rasterization | render | transform | Same reason; no prior per-pixel or raycast lighting code. |

## Metadata

**Analog search scope:** `src/game/{data,objects,scenes,state,systems}/`
**Tracked-source check:** all analog paths above are under `src/` and appear in `git ls-files src/game` (tracked source, not gitignored mirrors).
**Files read:** `04-CONTEXT.md`, `src/game/data/rooms.ts`, `src/game/objects/Player.ts`, `src/game/state/currentRoom.ts`, `src/game/scenes/buildRoom.ts`, `src/game/scenes/LivingRoomScene.ts` (1-100), `src/game/systems/{doorGlide,variants,movement,currentRoom}.ts`, `src/game/systems/doorGlide.test.ts` (1-40), `src/game/scenes/BedroomScene.ts`, plus codegraph excerpts for `InteractionUI` camera ignore (lines 93-95).
**Pattern extraction date:** 2026-11-05
