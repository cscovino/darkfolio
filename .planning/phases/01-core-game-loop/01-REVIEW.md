---
phase: 01-core-game-loop
reviewed: 2026-10-20T09:45:00Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - src/game/main.ts
  - src/game/scenes/BootScene.ts
  - src/game/scenes/PreloadScene.ts
  - src/game/scenes/GateScene.ts
  - src/game/scenes/LivingRoomScene.ts
  - src/game/objects/Player.ts
  - src/game/systems/movement.ts
  - src/components/GameCanvas.astro
  - src/pages/index.astro
  - package.json
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-10-20T09:45:00Z
**Depth:** standard
**Files Reviewed:** 10
**Status:** issues_found

## Summary

Read every in-scope source file in full. `pnpm vitest run src/game` passes (5/5 movement cases).

Security: no findings. The game takes no external input and makes no network calls. `createGame` receives a hard-coded parent id. There are no DOM-injection sinks. `phaser` is pinned exactly to `4.2.1` in `package.json`.

Correctness: no blocking defects found. The velocity helper handles idle, cardinal, opposing-key, and diagonal cases correctly. Wall, furniture, and door-gap geometry is consistent: walls cover the 320×240 world with a 32px gap at y 96–128 on both side walls, and the spawn footprint (144–176, 192–224) is clear of all bodies. Scene flow (Boot → Preload → Gate → LivingRoom) matches the plan, and the gate's `once('keydown')` listener does not read movement keys.

Quality: the findings below are robustness and maintainability issues. Nothing here causes data loss, and nothing is exploitable.

Known items, confirmed and not re-reported: the `.page` border-box overflow (01-UI-REVIEW), the 32px door gap versus the 32px player body with zero clearance (01-VALIDATION W-2), and the duplicated palette literals (01-UI-REVIEW pillar 3).

## Critical Issues

None.

## Warnings

### WR-01: Gate is keyboard-only; pointer and touch visitors cannot pass it

**File:** `src/game/scenes/GateScene.ts:28-30`
**Issue:** The only advance path is `this.input.keyboard?.once('keydown', …)`. On a touch-only or pointer-only device the gate shows "PRESS ANY KEY" permanently and the visitor cannot enter the room. Touch movement controls are out of scope (REQUIREMENTS §Out of Scope), but advancing past the title is not a movement control, and a dead end is worse than the scope rule intends. The `?.` also means a missing keyboard plugin silently leaves the gate dead rather than failing loudly.
**Fix:** Advance on any pointer as well as any key, using the same one-shot pattern:
```ts
const go = (): void => {
  this.input.keyboard?.off('keydown', go);
  this.input.off('pointerdown', go);
  this.scene.start('LivingRoomScene');
};
this.input.keyboard?.once('keydown', go);
this.input.once('pointerdown', go);
```
Note: `once` on the keyboard plugin removes itself only when it fires, so the `off` calls are needed when the pointer path wins.

### WR-02: FIT scaling with `pixelArt` yields non-uniform pixel widths

**File:** `src/game/main.ts:14-16`
**Issue:** `Phaser.Scale.FIT` scales the 640×480 canvas by an arbitrary factor to fit the viewport. The world is drawn at `setZoom(4)`, so one world pixel is `4 × fitFactor` device pixels. Whenever that product is not an integer, some world pixels render 3 device pixels wide and others 4, which defeats `pixelArt: true`. This appears at most viewport sizes other than exactly 640×480 or an integer multiple of it. The frame in `GameCanvas.astro` shrinks the viewport on smaller screens, which makes the non-integer case common.
**Fix:** Snap the canvas to integer multiples when the viewport allows. A minimal option is to keep `FIT` but compute the integer scale and resize the parent frame to it. A lighter option is to accept the artifact and record it as a known ceiling with a `// ponytail:` note naming the upgrade path.

### WR-03: Phaser game instance is never destroyed; HMR or re-execution stacks canvases

**File:** `src/components/GameCanvas.astro:5-8`
**Issue:** The client script calls `createGame('game-root')` and discards the returned `Phaser.Game`. Nothing calls `game.destroy(true)`. In dev, a hot reload of this module (or a second mount of the component) creates another game inside the same `#game-root`, leaving the old WebGL/canvas context running. This is a development-time leak, but it is also a real footgun for any future page navigation.
**Fix:**
```ts
import { createGame } from '@/game/main';
const game = createGame('game-root');
import.meta.hot?.dispose(() => game.destroy(true));
```
If navigation is ever added, destroy the game on `astro:before-swap` as well.

## Info

### IN-01: Gate text positions hard-code the 640×480 canvas size

**File:** `src/game/scenes/GateScene.ts:12, 21`
**Issue:** `(320, 224)` and `(320, 256)` duplicate the `width`/`height` from `main.ts`. Changing the canvas size silently misaligns the gate text.
**Fix:** Use `this.scale.width / 2` and `this.scale.height / 2 + offset`, or pass the centre in from the config.

### IN-02: Unchecked casts on keyboard and key-map types

**File:** `src/game/scenes/LivingRoomScene.ts:70-72`
**Issue:** `this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin` and `addKeys(...) as LivingRoomScene['wasd']` bypass type checking. If `keyboard` is ever disabled in config, `createCursorKeys()` throws a `TypeError` during `create()` with no clear message. The `wasd` cast hides the key-map shape from the compiler.
**Fix:** Guard explicitly: `const kb = this.input.keyboard; if (!kb) throw new Error('keyboard input required');`, then type the map as `Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>` at the declaration, which is already done, without the cast by typing `addKeys` through a generic if needed.

### IN-03: Layout literals and unused exports in the scene

**File:** `src/game/scenes/LivingRoomScene.ts:4-9, 36-58`
**Issue:** Furniture and wall placement is about 25 inline numeric literals in `create()`, with no named layout table. `TILE`, `ROOM_H`, and `WORLD_H` are exported but imported nowhere else; `PLAYER_TEX` in `Player.ts:5` is exported but only used inside its own module. Phase 2 will need the layout, so these may be intentional, but the exports should be trimmed until a consumer exists.
**Fix:** Drop the `export` keyword from `TILE`, `ROOM_H`, `WORLD_H`, and `PLAYER_TEX` until a consumer needs them. Keep `SPAWN_X` and `SPAWN_Y` exported, since the plan names them as the Phase 2 entry contract. Move the rectangles into a `const ROOM_LAYOUT` array when Phase 2 adds rooms.

---

_Reviewed: 2026-10-20T09:45:00Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
