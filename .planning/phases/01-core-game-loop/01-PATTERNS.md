# Phase 1: Core Game Loop - Pattern Map

**Mapped:** 2026-10-19
**Files analyzed:** 9 (8 new, 1 modified)
**Analogs found:** 4 / 9 (game code is greenfield; analogs are the vendored Phaser 4 skills, the existing Vitest specs, and the stock Astro page)

## Ground Truth (what exists today)

- `src/` tracked files: only `src/test/sanity.test.ts` and `src/test/commit-gate.test.ts`. No `src/game/`, no `src/components/`, no `src/styles/`, no `src/layouts/`.
- `src/pages/index.astro` is **untracked** and still the Astro default stub (`<h1>Hello, World!</h1>` + orange h1 style + a frontmatter `console.log`). It must be replaced, not extended.
- `package.json` has **no `phaser` dependency**. Phaser 4.2.1 (PLAN §Tech Stack) must be added before any game file can compile. AGENTS.md requires surfacing new deps to the user first.
- `astro.config.mjs`: `base: '/darkfolio'`, `output: 'static'`, `server.host: true`. Phaser must load with no CDN assets (DEPL-02).
- `tsconfig.json` path aliases already include `@/game/*`, `@/scenes/*`, `@/objects/*`, `@/systems/*`, `@/data/*`, `@/components/*`, `@/styles/*`, `@/layouts/*`, `@/pages/*`. Use them; do not add new aliases.
- `vitest.config.ts`: `environment: 'happy-dom'`, `include: ['src/**/*.test.ts']`. Pure-logic specs must live under `src/**` with a `.test.ts` suffix (e.g. `src/game/systems/movement.test.ts`). `tests/**` is in tsconfig `include` but not in Vitest's include; do not put specs there.
- `biome.json`: 2-space indent, LF, single quotes, semicolons always. `noConsoleLog` is warn-level, so no `console.log` in game code. `.opencode/**` and `.planning/**` are ignored by Biome.

**Scope conflict to resolve in planning:** PLAN.md §Phase 1 / §Phase 2 describe door positions as "north→Office, west→Bedroom". **CONTEXT.md D-02 (locked, reversibility: costly) says left wall → Office, right wall → Bedroom.** Follow CONTEXT D-02. Do not carry the PLAN.md wording into plan actions.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/game/main.ts` | config / bootstrap | request-response (one-shot init) | `.opencode/skills/game-setup-and-config/SKILL.md` | skill-reference |
| `src/game/scenes/BootScene.ts` | scene | event-driven (boot → next scene) | `.opencode/skills/scenes/SKILL.md` | skill-reference |
| `src/game/scenes/PreloadScene.ts` | scene | request-response (pass-through, zero assets) | `.opencode/skills/scenes/SKILL.md` + `loading-assets/SKILL.md` | skill-reference |
| `src/game/scenes/GateScene.ts` (or gate inside BootScene — Discretion) | scene | event-driven (first `keydown`) | `.opencode/skills/input-keyboard-mouse-touch/SKILL.md` | partial (input only) |
| `src/game/scenes/LivingRoomScene.ts` | scene | event-driven (update loop) + static world build | `.opencode/skills/tilemaps/SKILL.md` (collision idea) + `physics-arcade/SKILL.md` (colliders) | role-match (no tilemap; rects) |
| `src/game/objects/Player.ts` | game object (sprite/Container) | event-driven (per-frame input → velocity) | `.opencode/skills/physics-arcade/SKILL.md` | skill-reference |
| `src/game/systems/movement.ts` (optional pure helper) | utility | transform | `src/test/sanity.test.ts` (test home only) | none (no src utility yet) |
| `src/game/systems/movement.test.ts` (TDD-lite spec) | test | transform | `src/test/sanity.test.ts` | exact (Vitest style) |
| `src/components/GameCanvas.astro` | component | request-response (mount + client script) | none — no `.astro` component exists | no-analog |
| `src/pages/index.astro` (**modify**, replace stub) | page | request-response | itself (stock stub, to be replaced) | self |

Note: the camera follow (lerp 0.05, no deadzone) is configured inside `LivingRoomScene.ts`; there is no separate camera file. The placeholder art (Graphics rects / runtime textures) is generated inside the scenes; there is no asset file.

---

## Pattern Assignments

### `src/game/main.ts` (config / bootstrap, request-response)

**Analog:** `.opencode/skills/game-setup-and-config/SKILL.md` (tracked; vendored Phaser 4 skill). No game bootstrap exists in the repo.

**Pixel-art + FIT/centre config** (skill lines 69, 76–80):
```typescript
// pixelArt: true implies antialias:false, antialiasGL:false, roundPixels:true
pixelArt: true,
scale: {
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH,
  zoom: Phaser.Scale.ZOOM_2X,   // Phase 1 uses base 640x480 with NO zoom here; world zoom is set per camera
},
```

**Phase 1 config shape to apply (from UI-SPEC §Canvas Framing):**
```typescript
import Phaser from 'phaser';
import { BootScene } from '@/scenes/BootScene';
import { PreloadScene } from '@/scenes/PreloadScene';
import { GateScene } from '@/scenes/GateScene';          // or omit if gate lives in BootScene
import { LivingRoomScene } from '@/scenes/LivingRoomScene';

export function createGame(parent: string): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 640,
    height: 480,
    backgroundColor: '#2A2A2A',
    pixelArt: true,                       // also sets roundPixels: true
    physics: { default: 'arcade', arcade: { debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [BootScene, PreloadScene, GateScene, LivingRoomScene],
  });
}
```
- Set the 4× world zoom in `LivingRoomScene.create()` via `this.cameras.main.setZoom(4)`, **not** in the game config. Otherwise the gate's 32px text is blown up to 128px (UI-SPEC §Canvas Framing). Each scene has its own camera.
- Use a no-op `debug: false` (or omit). No debug overlays ship.
- Export a function and call it from `GameCanvas.astro`'s client script; do not start the game at module top level, so Vitest can import pure modules safely.

**Skipped:** Phaser `Scene` registry extras, plugins, custom loaders. Add when a later phase needs them.

---

### `src/game/scenes/BootScene.ts` / `PreloadScene.ts` (scene, event-driven / pass-through)

**Analog:** `.opencode/skills/scenes/SKILL.md` (tracked). Scene keys and `super()` pattern:
```typescript
// scenes/SKILL.md ~L19, L317
super('GameScene');
super({ key: 'PreloadScene', plugins: ['Loader'] });
```
- Use a `class X extends Phaser.Scene` with `super('BootKey')` in the constructor. Scene keys are the string used in `this.scene.start('...')`.
- Phase 1 BootScene: `this.scene.start('PreloadScene')` (or straight to `GateScene`). **No assets to load → PreloadScene is pass-through** (UI-SPEC: no progress bar renders). Do not add a `this.load` pipeline; there is nothing to load.
- Phase 1 `scene.start` transitions (from `scenes/SKILL.md` ~L143): `this.scene.start('LivingRoomScene')`.

**Skipped:** progress bar, loader plugin, preload list. Phase 8 TitleScene and loading screen replace this.

---

### `src/game/scenes/GateScene.ts` (scene, event-driven) — "press any key" gate, D-14

**Analog:** `.opencode/skills/input-keyboard-mouse-touch/SKILL.md` (tracked). Keyboard API (lines 157–179):
```typescript
this.cursors = this.input.keyboard.createCursorKeys();   // L157-158
const keyW = this.input.keyboard.addKey('W');            // L168
const keys = this.input.keyboard.addKeys('W,S,A,D');     // L179
```

**Pattern to apply (one-shot any-key advance, listener cleaned up on transition — UI-SPEC §Copywriting, CONTEXT Discretion):**
```typescript
create(): void {
  this.add.text(320, 220, 'PRESS ANY KEY', { fontFamily: 'ui-monospace, "Courier New", monospace', fontSize: '32px', fontStyle: 'bold', color: '#FFA500' }).setOrigin(0.5);
  this.add.text(320, 260, 'the house is listening', { fontFamily: 'ui-monospace, "Courier New", monospace', fontSize: '12px', color: '#8B6F5E' }).setOrigin(0.5);
  this.input.keyboard?.once('keydown', () => this.scene.start('LivingRoomScene'));
}
```
- Use `once` (not `on`) so the listener is one-shot. If you use `on`, call `this.input.keyboard?.off('keydown', handler)` in the transition path to satisfy "listener removed on transition".
- Background: `#2A2A2A` (set via `this.cameras.main.setBackgroundColor` or rely on game `backgroundColor`). No world objects in this scene.
- Text is in logical 640×480 px because this scene's camera is at zoom 1 (see main.ts note).
- Discretion: if the gate lives inside BootScene, put the same `create()` body there and skip GateScene.

**Skipped:** keyboard-capture options, `emitOnRepeat`, touch input (mobile is Phase 8).

---

### `src/game/scenes/LivingRoomScene.ts` (scene, event-driven + static build)

**Analog:** `.opencode/skills/physics-arcade/SKILL.md` (tracked) for collider + world-bounds, and `.opencode/skills/cameras/SKILL.md` for follow.

**Collider + world bounds** (physics-arcade L19, L26–27):
```typescript
this.player.setCollideWorldBounds(true);
// Register a persistent collider (checked every frame automatically)
this.physics.add.collider(this.player, this.platforms);
```

**Velocity from input** (physics-arcade L34–38):
```typescript
this.player.setVelocityX(-160);   // left
this.player.setVelocityX(160);    // right
this.player.setVelocityX(0);      // idle
```

**Camera follow with lerp, no deadzone, no offset** (cameras SKILL L133, L146):
```typescript
// startFollow(target, roundPixels?, lerpX?, lerpY?, offsetX?, offsetY?)
cam.startFollow(player, true, 0.05, 0.05, 0, 0);   // D-05/D-06/D-07: lerp 0.05, centred
// Lerp of 1 snaps; 0.1 is smooth. Lerp 0 disables that axis.
```
Do **not** call `setDeadzone` (D-07 forbids it; cameras SKILL L140 shows it only as an example).

**Phase 1 build contract (from CONTEXT + UI-SPEC):**
- Room = 20×15 tiles of 16 px = 320×240 world px (D-04). Four 1-tile (16 px) solid wall rects `#2A2A2A` on the outer edge; no interior partitions.
- Floor: 16 px checkerboard of `#4A3729` / `#6B4E3D` (D-10). Generate via `add.rectangle` per tile or a `generateTexture`d tile; no PNG.
- Collision-only furniture (D-01): TV, couch, floor lamp, coffee table. Create as static bodies (e.g. `this.physics.add.staticGroup()` or static rects) and register `this.physics.add.collider(this.player, walls)`.
- Door gaps (D-02/D-11): **left wall (→ Office)** and **right wall (→ Bedroom)**, 1–2 tiles wide, rows carved out of the wall; style each with a lighter `#8B6F5E` threshold rect. No collision on the gap itself beyond what the open wall gives; no traversal.
- Spawn (D-03): bottom-centre, facing up. Player 32×32 at roughly `(160, 208)` world (bottom wall interior). Keep the spawn coordinates as named constants — Phase 2 must honour them.
- World bounds: `this.physics.world.setBounds(0, 0, 320, 240)` and `this.cameras.main.setBounds(0, 0, 320, 240)` so the camera never exposes black outside the walls.
- Camera zoom: `this.cameras.main.setZoom(4)` → visible ≈160×120 world px (D-05).
- Hand-placed constants only; no data-driven layout (UI-SPEC §UI Considerations).

**Skipped:** Tilemap JSON + `createLayer` (tilemaps SKILL L27–33 shows the pattern; Phase 2 introduces tilemaps). Phase 1 uses rects. Add tilemaps when Phase 2's three-room geometry needs them.

---

### `src/game/objects/Player.ts` (game object, event-driven per-frame)

**Analog:** `.opencode/skills/physics-arcade/SKILL.md` (tracked). Movement from keyboard into velocity (L34–38 above) plus `this.cursors` (input skill L157–158).

**Pattern to apply:**
```typescript
import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  // 120 px/s per GAME-01; normalise diagonals so diagonal speed == 120
  static readonly SPEED = 120;
  private facing: 'up' | 'down' | 'left' | 'right' = 'up';   // D-03 spawn facing

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '__PLAYER_TEX__');    // placeholder texture generated at runtime (D-08)
    scene.add.existing(this);
    scene.physics.add.existing(this);
    (this.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
  }
  // update(cursors, wasd) → setVelocity from input, then update facing notch
}
```
- Placeholder art (D-08): 32×32 `#4A5A4A` body, 2px `#2A2A2A` outline, 8×8 `#FFA500` notch. Generate with `scene.make.graphics` + `generateTexture(key, 32, 32)` and reuse the key, or draw in a `Container`. Notch position flips toward `facing`.
- Static (no walk animation) per D-08 — do not add `anims`.
- Input: `this.input.keyboard.createCursorKeys()` + `addKeys('W,A,S,D')` (input SKILL L157–179). Read `isDown` in `LivingRoomScene.update()` and pass to `player.update(...)`.
- Normalise diagonals in a pure helper (see `movement.ts` below) so the speed contract is testable.

**Skipped:** animation controller, walk cycle, interaction hooks (Phase 3).

---

### `src/game/systems/movement.ts` + `movement.test.ts` (utility + TDD-lite spec)

**Analog (test style):** `src/test/sanity.test.ts` (tracked):
```typescript
import { describe, expect, it } from 'vitest';

describe('toolchain sanity', () => {
  it('runs vitest', () => {
    expect(1 + 1).toBe(2);
  });
});
```

**Pattern to apply (AGENTS.md TDD-lite for pure logic: write failing spec first):**
- Pure, framework-free helper: `velocityFromKeys({ left, right, up, down }, speed)` → `{ x, y }`; diagonal normalised to `speed / √2` per axis (so magnitude = 120).
- Lerp step helper for camera math is **optional**: the camera lerp is Phaser-owned (`startFollow` 0.05). Do not reimplement it unless a test needs it. Ponytail: skip.
- Place spec at `src/game/systems/movement.test.ts` (matches Vitest `include: src/**/*.test.ts`). Do **not** place it under `tests/`.
- Import with `@/game/systems/movement` (alias) — works in Vitest only if `vite-tsconfig-paths` or an alias is configured. **Check:** `vitest.config.ts` currently has no `resolve.alias` / tsconfig-paths plugin. Either use a relative import (`./movement`) or add the alias to `vitest.config.ts` in the same change. Relative import is the lazy option.

**Skipped:** diagonal-speed config knob, camera-lerp helper. Add when Phase 2 needs them.

---

### `src/components/GameCanvas.astro` (component, request-response mount)

**Analog:** none. No `.astro` component exists in `src/`. Use `.opencode/skills/astro/SKILL.md` (tracked) for component/script conventions. The stock page `src/pages/index.astro` (its `<style>` block) is the only in-repo `.astro` precedent.

**Pattern to apply (mount point + client-only Phaser import):**
```astro
---
// Frontmatter runs at build time; game code runs only in the browser script below.
---
<div id="game-frame" class="frame">
  <div id="game-root"></div>
</div>

<script>
  import { createGame } from '@/game/main';
  createGame('game-root');
</script>

<style>
  .frame {
    border: 4px solid #4A3729;   /* UI-SPEC: framed CRT on a dark wall */
    width: 640px;
    height: 480px;
  }
</style>
```
- The `<script>` tag in Astro is bundled and runs in the browser; a top-level import of `@/game/main` is fine (Phaser needs `window`, so do not call it in frontmatter).
- Fixed-size box (D-12). `Scale.FIT` (in main.ts) handles resize; the frame's `width/height` must match the 640×480 logical canvas, or add the 4px border outside the box dimensions (planner decides; UI-SPEC says 4px border on the canvas box).
- Centre the page content with flex on the page root (see Shared Patterns).
- Keep `window` / `document` access inside the script, never in frontmatter.

**Skipped:** Astro island / `client:only` directive, props. Only one mount point exists; a hydration directive adds nothing here.

---

### `src/pages/index.astro` (page, **modify** — replace the stub)

**Analog:** itself. Current contents (untracked stub, replace fully):
```astro
---
console.log('This runs in your terminal, not the browser!');
---
<html>
  <body>
    <h1>Hello, World!</h1>
  </body>
</html>
<style>
  h1 { color: orange; }
</style>
```

**Pattern to apply:**
- Remove the frontmatter `console.log` (Biome `noConsoleLog` warns; it is also noise).
- `<title>Darkfolio</title>` is the only HTML text ships (UI-SPEC §Copywriting). Remove the `<h1>`.
- Body = `<GameCanvas />` inside a flex-centred page root with `min-height: 100dvh`, `overflow: hidden`, background `#2A2A2A`, 16px gutter (UI-SPEC §Canvas Framing).
- No layout component exists; do not create `src/layouts/` for one page (ponytail).

```astro
---
import GameCanvas from '@/components/GameCanvas.astro';
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Darkfolio</title>
  </head>
  <body>
    <main class="page">
      <GameCanvas />
    </main>
  </body>
</html>

<style>
  html, body { margin: 0; background: #2A2A2A; }
  .page {
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 16px;
  }
</style>
```

---

## Shared Patterns

### Phaser game bootstrap (single entry)
**Source:** `.opencode/skills/game-setup-and-config/SKILL.md` (tracked)
**Apply to:** `src/game/main.ts`, `GameCanvas.astro`
- One exported `createGame(parentId)` factory; the Astro script calls it once. Pixel-art flags live in one config object (`pixelArt: true`).
- No CDN or external asset URLs anywhere (DEPL-02; `base: '/darkfolio'`).

### Scene transitions
**Source:** `.opencode/skills/scenes/SKILL.md` (tracked; `this.scene.start('Key')` at L143)
**Apply to:** BootScene → PreloadScene → GateScene → LivingRoomScene
- Scene keys are string constants; use one `const KEYS` object or literals consistently across files.
- Gate transition uses `this.scene.start('LivingRoomScene')` from a one-shot `keydown` (see GateScene).

### Camera setup (zoom + follow + bounds)
**Source:** `.opencode/skills/cameras/SKILL.md` (tracked; `setZoom` L27/L154, `startFollow` L30/L133, `setBounds` L33)
**Apply to:** `LivingRoomScene.ts` only (scene-local; zoom must not leak to the gate scene).

### Arcade physics collision
**Source:** `.opencode/skills/physics-arcade/SKILL.md` (tracked; `setCollideWorldBounds` L19, `physics.add.collider` L27)
**Apply to:** `LivingRoomScene.ts` (walls + furniture vs. player), `Player.ts`

### Keyboard input
**Source:** `.opencode/skills/input-keyboard-mouse-touch/SKILL.md` (tracked; `createCursorKeys` L157, `addKey`/`addKeys` L168–179)
**Apply to:** `GateScene.ts` (`once('keydown')`), `LivingRoomScene.ts` (cursors + WASD)

### Placeholder art generation
**Source:** `.opencode/skills/graphics-and-shapes/SKILL.md` (tracked; `this.add.rectangle` L29, `this.add.graphics()` L18, `generateTexture` L46)
**Apply to:** LivingRoomScene (floor, walls, furniture, door thresholds), Player (32×32 texture + facing notch). No PNG asset pipeline this phase (ponytail).

### Unit-test style
**Source:** `src/test/sanity.test.ts` (tracked; `describe/it/expect` from `vitest`)
**Apply to:** `src/game/systems/movement.test.ts`. Pure logic only; no Phaser import in specs (happy-dom cannot run WebGL).

### Code style
**Source:** `biome.json` (tracked)
**Apply to:** all new `.ts` / `.astro` game files: single quotes, semicolons, 2-space indent, no `console.log`, no unused imports/params.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/game/main.ts` | config | request-response | No Phaser code in repo yet; use skill reference |
| `src/game/scenes/*.ts` | scene | event-driven | No scene exists; use skill reference |
| `src/game/objects/Player.ts` | game object | event-driven | No game object exists; use skill reference |
| `src/components/GameCanvas.astro` | component | request-response | No `.astro` component exists in repo; use `.opencode/skills/astro/SKILL.md` |

## Pre-Planning Blockers (planner must action)

1. **Add `phaser@^4.2.1`** to `package.json` dependencies (PLAN §Tech Stack). AGENTS.md: surface to the user before adding a dep; the stack lock permits it, so plan it as an explicit task.
2. **Resolve the door-wall conflict** in favour of CONTEXT D-02 (left → Office, right → Bedroom); PLAN.md wording is stale for Phase 1/2.
3. **Vitest alias:** either relative imports in specs or add the `@/` alias to `vitest.config.ts`.
4. **`src/pages/index.astro` is untracked** — the planner's plan must replace the stub as a full-file write, and the executor should `git add` it explicitly.

## Metadata

**Analog search scope:** `src/` (tracked + untracked), `public/` (empty), `.opencode/skills/` (vendored Phaser/Astro skills, tracked), `.opencode/agents/` (tracked), root configs (`astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `biome.json`, `package.json`).
**Files scanned:** ~20 (2 test specs, 1 page, 4 root configs, 6 skill docs read by targeted grep)
**Pattern extraction date:** 2026-10-19
