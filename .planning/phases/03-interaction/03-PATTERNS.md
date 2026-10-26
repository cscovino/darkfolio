# Phase 3: Interaction - Pattern Map

**Mapped:** 2026-10-22
**Files analyzed:** 16 (12 new, 4 modified)
**Analogs found:** 16 / 16 (2 partial — no prior timer/typewriter or Phaser↔DOM event precedent)

All analog paths below are git-TRACKED `src/` files (verified via `git ls-files`). Source file list derived from `03-CONTEXT.md` decisions + `03-UI-SPEC.md` surface inventory + PLAN.md §Phase 3.

**Planner flag:** PLAN.md §Phase 3 prescribes per-object classes (`Interactable.ts`, `Computer.ts`, …`Bed.ts`). CONTEXT D-03 locks **five** interactables (no Bed) and its discretion section points at the `DOORS` **data-registry** precedent. This map assumes the registry shape (one `interactables.ts` + pure selection module) per CONTEXT, which supersedes the older PLAN prescription; planner should confirm.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/game/data/interactables.ts` (new) | data/registry | static lookup | `src/game/data/rooms.ts` (`DOORS`) | exact |
| `src/game/data/dialogs.ts` (new) | data (copy strings) | static lookup | `src/game/data/rooms.ts` | role-match |
| `src/game/systems/proximity.ts` (new) | system (pure) | transform/query (rect gap, nearest) | `src/game/systems/doorGlide.ts` (`triggeredSide`, `reachRect`) | exact |
| `src/game/systems/proximity.test.ts` (new) | test | — | `src/game/systems/doorGlide.test.ts` | exact |
| `src/game/systems/variants.ts` (new) | system (pure + in-memory state) | counter → index | `src/game/systems/movement.ts` + `src/game/state/currentRoom.ts` | role-match |
| `src/game/systems/variants.test.ts` (new) | test | — | `src/game/systems/doorGlide.test.ts` | role-match |
| `src/game/systems/dialog.ts` (new) | system (pure) | typewriter state machine | `src/game/systems/doorGlide.ts` (pure consts + transition fns) | role-match |
| `src/game/systems/dialog.test.ts` (new) | test | — | `src/game/systems/doorGlide.test.ts` | role-match |
| `src/game/objects/InteractionUI.ts` (new) | object (Phaser UI layer) | render (badge + dialog box, zoom-1 camera) | `src/game/scenes/GateScene.ts` + `ensurePlayerTexture` in `src/game/objects/Player.ts` | role-match |
| `src/components/GameOverlay.astro` (new) | component (DOM) | DOM-over-canvas render | `src/components/GameCanvas.astro` | exact |
| `src/components/ContentList.astro` (new) | component (shared DOM) | static render | `src/components/GameCanvas.astro` | role-match |
| `src/pages/projects.astro` (new) | route | static render | `src/pages/index.astro` | exact |
| `src/pages/skills.astro` (new) | route | static render | `src/pages/index.astro` | exact |
| `src/pages/contact.astro` (new) | route | static render | `src/pages/index.astro` | exact |
| `src/game/scenes/LivingRoomScene.ts` (mod) | controller/scene | request-response (input → state → UI) | itself (`DOORS` loop + `gliding` lock) | exact |
| `src/components/GameCanvas.astro` (mod) | component (frame) | container | itself | exact |
| `src/game/objects/Player.ts` (mod) | object | input gate | itself | exact |

`src/pages/index.astro` likely **unchanged** (overlay mounts inside `#game-frame`); `src/game/systems/doorGlide.ts` likely **unchanged** (the scene's `if (this.gliding) return;` already covers D-29's glide lock once E-handling lives in the scene loop).

## Pattern Assignments

### `src/game/data/interactables.ts` (data/registry)

**Analog:** `src/game/data/rooms.ts` — the `DOORS` registry + `DoorDef` type is the exact precedent CONTEXT names (registry + one generic loop). Typed def near its type, then an ordered array export:

```typescript
// src/game/data/rooms.ts:166-188
export const DOOR_NORTH: DoorDef = {
  id: 'north',
  zone: { x: 384, y: 216, w: 48, h: 48 },
  gap: { x: 384, y: 224, w: 48, h: 32 },
  axis: { x: 408, y: 240 },
  sides: [
    { dir: 'up', dest: 'office' },
    { dir: 'down', dest: 'living' },
  ],
};
export const DOORS: DoorDef[] = [DOOR_NORTH, DOOR_WEST];
```

Type shape lives beside the pure system that consumes it (`src/game/systems/doorGlide.ts:5-11`):

```typescript
export type DoorDef = {
  id: string;
  zone: Rect;
  gap: Rect;
  axis: Vec;
  sides: DoorSide[];
};
```

New `InteractableDef` should carry: `id`, `rect` (world coords — the five host rects are already in the layouts, see below), `room: RoomId`, `verb`, `speakerTag`, `overlay?: route`, `dialogPool: string[]`, `statusPool?: string[]`. Registry order is meaningful (ties break by declaration order per UI-SPEC nearest-wins rule).

**Verified object rects in `src/game/data/rooms.ts`** (UI-SPEC object table confirmed against source):
- Computer: `OFFICE_LAYOUT.solids[1]` = `[200, 30, 20, 14, 0x3d3d3d]` (rooms.ts:81)
- Bookshelf: `OFFICE_LAYOUT.solids[3]` = `[24, 72, 16, 64, 0x3d2f1f]` (rooms.ts:83)
- Phone: `BEDROOM_LAYOUT.solids[2]` = `[96, 30, 8, 6, 0x555555]` (rooms.ts:118 — note: it is a **solid**, not decor; UI-SPEC's `decor[2]` reference is stale, rect/coords identical)
- TV: `LIVING_LAYOUT.solids[0]` = `[152, 24, 16, 16, 0x3d3d3d]` (rooms.ts:43)
- Lamp: `LIVING_LAYOUT.solids[3]` = `[200, 88, 16, 16, 0x555555]` (rooms.ts:46)

Origins for world-center math: `LIVING_ORIGIN`/`OFFICE_ORIGIN`/`BEDROOM_ORIGIN` (rooms.ts:16-18); `buildRoom` draws at `origin + local` (buildRoom.ts:20-30).

### `src/game/data/dialogs.ts` (data, copy strings)

**Analog:** `src/game/data/rooms.ts` — a flat typed-data module, no logic. If the planner prefers, dialog/status pools can live directly inside `interactables.ts` (single registry, one import); a separate file only earns its keep if the copy volume crowds the registry. Copy strings come verbatim from UI-SPEC §Copywriting Contract (3 dialog variants × 5 objects, 3 status lines × 3 hosts).

### `src/game/systems/proximity.ts` (system, pure — reach + nearest + room check)

**Analog:** `src/game/systems/doorGlide.ts` — same role: pure geometry over `Rect`/`Vec`, framework-free, registry passed in as an argument. Copy the module skeleton exactly:

```typescript
// src/game/systems/doorGlide.ts:1-25 — imports, types, pure helpers
import type { Rect, RoomId, Vec } from './currentRoom';

function insideRect(rect: Rect, p: Vec): boolean {
  return (
    p.x >= rect.x &&
    p.x < rect.x + rect.w &&
    p.y >= rect.y &&
    p.y < rect.y + rect.h
  );
}
```

Registry-as-argument + early-return-wins selection (`doorGlide.ts:53-73`):

```typescript
export function triggeredSide(
  doors: DoorDef[],
  pos: Vec,
  facing: Dir,
  keys: Record<Dir, boolean>,
): { door: DoorDef; side: DoorSide } | null {
  for (const door of doors) {
    for (const side of door.sides) {
      if (side.dir === facing && insideRect(door.zone, pos))
        return { door, side };
    }
  }
  // ... second pass
  return null;
}
```

New `nearestInRange(objects, playerRect, room)` implements UI-SPEC's reach rule: **gap between the player's 32×32 body rect and the object rect ≤ 32px** (equivalent: expand body rect by 32px, test intersection), filtered by `room`, smallest gap wins, ties → first declared. Room check is free — reuse `roomAt` (`src/game/systems/currentRoom.ts:7-19`) and `getCurrentRoom()` (`src/game/state/currentRoom.ts:5-7`); do not write new room math.

### `src/game/systems/proximity.test.ts` (test)

**Analog:** `src/game/systems/doorGlide.test.ts` — co-located vitest, deterministic-value assertions, tiny helper builders, declaration-order pinning:

```typescript
// doorGlide.test.ts:1-20
import { describe, expect, it } from 'vitest';
import { DOOR_NORTH, DOOR_WEST } from '../data/rooms';
import { GLIDE_EASE, GLIDE_MS, glideEnd, reachRect, triggeredSide } from './doorGlide';
import type { Dir, DoorDef } from './doorGlide';

const keys = (dir: Dir): Record<Dir, boolean> => ({ ...none, [dir]: true });
```

```typescript
// doorGlide.test.ts:80-90 — declaration-order tie-break pinning (copy this test shape for nearest-wins ties)
it('checks sides in declaration order', () => { /* ... */ });
```

Tests to port from that shape: in/out of the 32px gap (the desk case — gap ≈15px at computer, ≈16px at TV), room filter rejects across-wall reach, nearest wins by smallest gap, tie breaks by registry order.

### `src/game/systems/variants.ts` (system — per-object visit counters, pure index math)

Two existing patterns compose here; no single analog does both:

**Pure function module:** `src/game/systems/movement.ts` (whole file, 19 lines) — the house style for a tiny framework-free module:

```typescript
// src/game/systems/movement.ts:1-19 (complete)
export type KeyState = { left: boolean; right: boolean; up: boolean; down: boolean };

export function velocityFromKeys(keys: KeyState, speed: number): { x: number; y: number } {
  let x = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  // ...
}
```

**In-memory module state:** `src/game/state/currentRoom.ts` (whole file, 11 lines) — module-level `let` + getter/setter is the established reset-on-reload store (D-20 wants exactly this: in-memory, no storage). Visit counters as `Record<string, number>` behind `incrementVisit(id)` / `visitCount(id)`, and `variantFor(count, pool)` = `pool[(count - 1) % pool.length]`.

```typescript
// src/game/state/currentRoom.ts:1-11 (complete)
let currentRoom: RoomId = 'living';
export function getCurrentRoom(): RoomId { return currentRoom; }
export function setCurrentRoom(room: RoomId): void { currentRoom = room; }
```

D-19 (atomic increment on the E press, never re-counted) means the counter bumps exactly once at interaction start in the scene — like the E press, not per-frame; the state machine must not increment again on skip/handoff/overlay states.

### `src/game/systems/variants.test.ts` (test)

Same shape as `doorGlide.test.ts`: pin cycle wraparound (visit 4 = variant A), independence across two object ids, and that increment-once semantics hold. (The repo pins constants with literal assertions — `doorGlide.test.ts:162-167` pins `GLIDE_MS`; pinning `variantFor(4, [A,B,C]) === A` follows suit.)

### `src/game/systems/dialog.ts` (system, pure — typewriter + state machine)

**Analog:** `src/game/systems/doorGlide.ts` for the module shape — exported timing/ease constants plus pure transition functions:

```typescript
// doorGlide.ts:13-16 — constant pinning style
const REACH = 16;
export const GLIDE_MS = 700;
export const GLIDE_EASE = 'Sine.easeInOut';
```

New module holds `CHAR_MS = 25`, `AUTO_DISMISS_MS = 1500`, and pure functions over a dialog state: `revealCount(elapsedMs, textLength)` (skip = reveal full length), `stateAfterTyping(isHost)`, etc. **No timer/typewriter system exists in the codebase** — see "No Analog Found". The scene owns real time (Phaser clock/tween) and calls these pure functions; that keeps D-02 skip and D-04 auto-dismiss testable per TDD-lite.

### `src/game/systems/dialog.test.ts` (test)

`doorGlide.test.ts` shape: pin `CHAR_MS`/`AUTO_DISDISMISS_MS` constants, reveal-count at 0/N ms, skip-to-end, and host-vs-dialog-only next-state.

### `src/game/objects/InteractionUI.ts` (object — Phaser zoom-1 UI: badge + dialog box)

Two partial analogs; there is no existing second-camera or container UI object.

**Text style precedent:** `src/game/scenes/GateScene.ts` — the one existing zoom-1, full-frame text surface, same monospace stack UI-SPEC mandates:

```typescript
// GateScene.ts:3, 10-26
const FONT = 'ui-monospace, "Courier New", monospace';

this.add.text(320, 224, 'PRESS ANY KEY', {
  fontFamily: FONT,
  fontSize: '32px',
  fontStyle: 'bold',
  color: '#FFA500',
}).setOrigin(0.5);
```

(Colors as CSS hex strings; amber `#FFA500` + brown `#8B6F5E` + paper `#E8DCC8` follow the palette table in UI-SPEC §Color.)

**Code-drawn Graphics precedent:** `ensurePlayerTexture` in `src/game/objects/Player.ts:18-35` — the house draws every visual with `scene.make.graphics()` + `fillRect` (2px frames, amber notch) and either `generateTexture`s it (static) or keeps the `Graphics` object alive (dynamic). The dialog box (448×120, 2px matte + 2px frame + plate) is the same fillRect sandwich:

```typescript
// Player.ts:22-33 — layered rect frame → plate → accent
const g = scene.make.graphics({ x: 0, y: 0 }, false);
g.fillStyle(0x4a5a4a); g.fillRect(0, 0, 32, 32);
g.fillStyle(0x2a2a2a);   // dark frame
g.fillRect(0, 0, 32, 2); g.fillRect(0, 30, 32, 2);
g.fillRect(0, 2, 2, 28); g.fillRect(30, 2, 2, 28);
g.fillStyle(0xffa500); g.fillRect(...NOTCH[facing], 8, 8);  // amber accent
```

Badge width varies per verb (`BOOT UP` … `WATCH`) — draw with `Graphics` + `Text` children rather than a baked texture; badge re-anchors each frame from the object's world point, following the player's world→screen mapping (`LivingRoomScene` camera: zoom 4, follow lerp 0.05 — LivingRoomScene.ts:57-60).

### `src/components/GameOverlay.astro` (component — DOM CRT panel)

**Analog:** `src/components/GameCanvas.astro` (whole file) — the house style for an Astro component: markup + one client script import + scoped style, no framework:

```astro
<!-- src/components/GameCanvas.astro -->
<div id="game-frame" class="frame">
  <div id="game-root"></div>
</div>

<script>
  import { createGame } from '@/game/main';
  createGame('game-root');
</script>

<style>
  .frame {
    width: 640px;
    height: 480px;
    max-width: calc(100vw - 40px);
    max-height: calc(100dvh - 40px);
    border: 4px solid #4a3729;
    box-sizing: content-box;
  }
  #game-root { width: 100%; height: 100%; }
</style>
```

Panel chrome, scanlines (`repeating-linear-gradient` + `pointer-events: none`), green wash, cqw type scaling, slide transitions and `prefers-reduced-motion` come verbatim from UI-SPEC §"CRT overlay panel". **This file also carries the `#game-frame` changes** UI-SPEC requires: `position: relative; overflow: hidden;` and the always-4:3 sizing (`width: min(640px, calc(100vw - 40px), calc((100dvh - 40px) * 4/3)); aspect-ratio: 4/3; height: auto;`) replacing the current fixed 640×480 + max-constraints. Page-mount point and script wiring stay exactly as above.

### `src/components/ContentList.astro` (component — shared entry list, the Phase 6 seam)

**Analog:** `src/components/GameCanvas.astro` for component/scoped-CSS style (there is no second component in the repo to copy — role-match only). UI-SPEC §"Page content" pins the internals: one line per entry (title 16px 700 + ` — ` + description 16px 400), 4px gaps, empty state `NOTHING HERE YET` / error state `SIGNAL LOSt` per the copy table. Accepts entries as a prop; both the overlay and each standalone route render the **same** component (UI-SPEC §Phase 6 Handoff).

### `src/pages/projects.astro` · `skills.astro` · `contact.astro` (routes)

**Analog:** `src/pages/index.astro` (whole file) — Astro route with inline scoped `<style>`, dark background, component import via `@/` alias:

```astro
---
import GameCanvas from '@/components/GameCanvas.astro';
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Darkfolio</title>
  </head>
  <body><main class="page"><GameCanvas /></main></body>
</html>

<style>
  html, body { margin: 0; background: #2a2a2a; }
  .page { min-height: 100dvh; display: grid; place-items: center; overflow: hidden; padding: 16px; }
</style>
```

Each route swaps in: `<title>Projects — Darkfolio</title>`, `<h1>` 20px 700 `#E8DCC8`, back link `← back to the house` (`#8B6F5E`, standalone only), then the shared `ContentList`. **No light skin** — same terminal-dark styling as the overlay (UI-SPEC §"No light skin"). Stub content is verbatim from UI-SPEC §"Stub page content".

### `src/game/scenes/LivingRoomScene.ts` (controller — attach interaction to the existing loop)

**Analog:** itself. The `update()` method is the integration point; the door trigger loop and the `gliding` lock are the exact templates for the E-key loop and dialog/overlay locks:

```typescript
// LivingRoomScene.ts:67-90 — early-return lock + pure-system call + state update
update(): void {
  if (this.gliding) return;               // D-29: E ignored during glide falls out for free

  const keys = { /* cursors + wasd */ };
  this.player.handleInput(keys);

  const hit = triggeredSide(DOORS, { x: this.player.x, y: this.player.y }, this.player.getFacing(), keys);
  if (hit) { this.startGlide(hit.door, hit.side); return; }
  const room = roomAt(ROOM_ZONES, { x: this.player.x, y: this.player.y });
  if (room) setCurrentRoom(room);
}
```

The scene gains: an `E`/`Esc` key registration (keyboard plugin already obtained at LivingRoomScene.ts:62-64), a mode field (`idle | prompt | typing | paused | handoff | overlay` per UI-SPEC §State machine), per-frame `nearestInRange(...)` call feeding the badge, movement lock (skip `handleInput` + `setVelocity(0, 0)` when not `idle`/`prompt` — same two lines `startGlide` uses at LivingRoomScene.ts:107-111), and tween-driven dialog/overlay slides reusing the `this.tweens.add({ duration, ease, onComplete })` shape of `startGlide` (LivingRoomScene.ts:114-126). Keep the slide durations/eases from UI-SPEC (250ms `Cubic.easeOut` in / 200ms `Cubic.easeIn` out), not the door's `GLIDE_MS`.

Imports follow the existing alias mix (`@/data/rooms`, `@/systems/*`, `@/game/state/currentRoom`, `@/objects/*` — LivingRoomScene.ts:1-28).

### `src/game/objects/Player.ts` (object — input lock, D-27)

**Analog:** itself. `handleInput` (Player.ts:48-65) is the only movement entry point. Smallest change: the scene simply does not call `handleInput` while locked (it already controls the call site — LivingRoomScene.ts:76) and zeroes velocity once on dialog open, exactly as `startGlide` does (`this.player.setVelocity(0, 0)` + `body.enable = false`, LivingRoomScene.ts:107-110). **No edit to Player.ts may be necessary** — prefer scene-side gating; only add a lock flag to Player if a second caller appears.

## Shared Patterns

### Path aliases
**Source:** LivingRoomScene.ts:1-28, PLAN.md §Path Aliases.
**Apply to:** every new file. Systems import siblings relatively (`./currentRoom` — doorGlide.ts:1); scenes/components use `@/systems/*`, `@/data/*`, `@/objects/*`, `@/scenes/*`, `@/game/state/*`.

### Pure geometry over shared `Rect`/`Vec` types
**Source:** `src/game/systems/currentRoom.ts:1-4` (`RoomId`, `Rect`, `Vec`, `RoomZone` — the whole type vocabulary).
**Apply to:** `proximity.ts`, `interactables.ts` — reuse these exact types, never redefine or widen them; Phaser bodies are adapted at the scene boundary (`{ x: this.player.x, y: this.player.y }`), pure modules never import Phaser.

### Data registry + one generic loop
**Source:** `DOORS` (rooms.ts:188) consumed by `triggeredSide` (doorGlide.ts:53) in the scene loop (LivingRoomScene.ts:78-86).
**Apply to:** interactables registry, dialog/status pools — data-driven iteration, no per-object classes.

### In-memory module state
**Source:** `src/game/state/currentRoom.ts` (whole file).
**Apply to:** visit counters (D-20 reset-on-reload), interaction mode if the DOM overlay bridge needs a readable handle.

### Monospace, hex-string colors, palette lock
**Source:** GateScene.ts:3 (`FONT`), Player.ts:22-31 (hex fills), UI-SPEC §Color.
**Apply to:** canvas UI (`InteractionUI.ts`) and DOM (`GameOverlay.astro`, routes) — one font stack everywhere; amber `#FFA500` only on the five UI-SPEC-reserved accents.

### Co-located vitest, deterministic pinning
**Source:** doorGlide.test.ts, rooms.test.ts (both `*.test.ts` beside source).
**Apply to:** all pure modules (TDD-lite per AGENTS.md). `rooms.test.ts` also shows the rect-overlap guard style (`toRect`/`rectsOverlap`/`expectClearOfSolids`, rooms.test.ts:26-52) — copy it if the planner adds an `interactables.test.ts` guard that registry rects still match layout solids (the "hosts placed" tests at rooms.test.ts:103-107, 151-156 are the precedent).

### Astro component/route conventions
**Source:** `index.astro`, `GameCanvas.astro` (both whole files).
**Apply to:** `GameOverlay.astro`, `ContentList.astro`, three placeholder routes — scoped `<style>`, `@/` imports, no framework, no new deps.

## No Analog Found

| File / Concern | Role | Reason | Fallback |
|----------------|------|--------|----------|
| Typewriter timing (real-time char reveal, skip, auto-dismiss countdown) | system | No timer-driven system exists; all current systems are stateless pure math or tween-completed | UI-SPEC §Interaction Contract pins the numbers (25ms/char, 1500ms pause, blink 500/500); scene owns the clock, `dialog.ts` stays pure |
| Phaser↔DOM bridge (scene signals overlay open/close + status line; DOM catches E/Esc and reports back) | cross-boundary | Only existing bridge is `GameCanvas.astro`'s one-way `createGame()` boot script; no custom-event or callback channel exists | No precedent to copy — planner uses RESEARCH.md / UI-SPEC §Focus (panel `tabindex="-1"`, keydown listener on the panel). A tiny `window` CustomEvent pair or a `createGame` return handle are both fine; flag as a design decision |
| Zoom-1 UI camera over the zoom-4 world | scene | GateScene is zoom-1 but has no world camera to overlay; no second-camera code exists | UI-SPEC §Canvas Framing declares the requirement; Phaser `this.cameras.add` + `setTransparent` |

## Metadata

**Analog search scope:** `src/game/**`, `src/pages/**`, `src/components/**` (complete — the codebase is 18 source files, all read or explored)
**Files scanned:** 18
**Git-tracking:** every analog verified tracked via `git ls-files` (no mirror paths)
**Pattern extraction date:** 2026-10-22
