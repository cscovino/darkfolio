# Phase 1 — UI Review

**Audited:** 2026-10-20
**Baseline:** `01-UI-SPEC.md` (approved 2026-10-19) — copy, color element map, typography, canvas framing; decisions D-01..D-14 from `01-CONTEXT.md`
**Screenshots:** not captured — no browser available in this run. All findings are source-derived; visual claims are marked for UAT.
**Interaction captures:** off (`workflow.ui_interaction_capture` not enabled; no browser in this run)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | `PRESS ANY KEY`, `the house is listening`, `<title>Darkfolio</title>` match the contract byte-for-byte; no stray copy. |
| 2. Visuals | 3/4 | Composition follows the element map; the gate is intentionally bare; lamp glow reads as a notch-like blip (UAT). |
| 3. Color | 3/4 | Every hex matches the contract and accent use is confined to the three declared spots; but the palette is duplicated as literals across 5 files and the Phase-4 cold-blue token was never extracted. |
| 4. Typography | 3/4 | Sizes (32 / 12) and weights (700 / 400) match; the declared line-heights (1.2 / 1.5) are not implemented; the 4px gate gap is unverified. |
| 5. Spacing | 2/4 | Page `min-height: 100dvh` + `padding: 16px` under content-box sizing makes the document 32px taller than the viewport — the page scrolls, breaking the "overflow hidden / no scroll" layout contract. |
| 6. Experience Design | 3/4 | Gate → Living Room flow and camera/collision wiring are correct in source; held-key carry-over at the gate, no canvas accessible name, and SC#5 console-clean are unverified. |

**Overall: 18/24**

**BLOCKER count: 0.** No pillar scored 1, and no source defect breaks task completion (any key → room → walk). Several WARNINGs and UAT-gated items below.

---

## Top 3 Priority Fixes

1. **Page scrolls by 32px** — `.page` in `src/pages/index.astro` uses `min-height: 100dvh; padding: 16px` with no `box-sizing` reset, so the document is `100dvh + 32px` tall and a scrollbar appears; `overflow: hidden` on `.page` does not stop the body scrolling. User impact: the "no scroll-first content, overflow impossible" contract (D-12/D-13) is visibly broken on every desktop viewport. Fix: add `box-sizing: border-box;` to `.page` (the frame's `content-box` is already sized to fit inside 100dvh−32).

2. **Game canvas has no accessible name** — `src/components/GameCanvas.astro` renders `<div id="game-root">` with no role or label, so a screen reader announces nothing for the entire experience. User impact: the only interactive surface is invisible to assistive tech; AGENTS.md "accessibility basics" is not met. Fix: `<div id="game-root" role="application" aria-label="Darkfolio game"></div>`. This adds no visible text, so it does not violate the "no visible HTML text" contract.

3. **Held key carries into the Living Room** — `GateScene` advances on `keyboard.once('keydown')`; if the visitor is still holding an arrow/WASD key, OS auto-repeat fires `keydown` on the Living Room's freshly created keys and the player starts walking on entry. User impact: the first second of play is uncontrolled and reads as a bug. Verify in UAT first; if confirmed, fix by having `LivingRoomScene` ignore movement input until every movement key has been released once after entering.

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)

- `src/game/scenes/GateScene.ts` — `'PRESS ANY KEY'` (32px, bold, `#FFA500`) and `'the house is listening'` (12px, `#8B6F5E`) match UI-SPEC §Copywriting exactly.
- `src/pages/index.astro` — `<title>Darkfolio</title>`; no other HTML text ships. Matches the contract.
- Empty, error, and destructive copy are all dismissed in the contract with recorded reasons; nothing ships that contradicts them.
- No generic labels (`Submit`, `OK`, `Click Here`) anywhere in `src/`.
- Nit (not scored): the subline sits 4px-ish below the CTA by estimate only; see Typography.

### Pillar 2: Visuals (3/4)

- Element map matches the contract: floor checkerboard, four wall rects with D-02 gaps, four furniture pieces, TV screen accent, lamp glow, player with outline and notch (`LivingRoomScene.ts`, `Player.ts`).
- Draw order is correct: floor graphics first, walls, then threshold rects over the wall line (D-11), then furniture, then the player.
- Focal point: the player sits dead-center per D-07 and is the only green object. Good.
- WARNING: the lamp glow rect `(200,84, 8×8)` overlaps the top half of the 16×16 stand `(200,88)`, so it reads as a notched blob on the lamp rather than a lamp glow. Needs UAT judgement; the spec does not pin it.
- WARNING: the gate scene is two text lines on a flat `#2A2A2A` field. Spec-conformant (D-14 minimal gate), but it is the first impression and has no framing or hint. Accepted for Phase 1.
- INFO: the west/east door gaps are 32px tall, the same as the 32px player, so the player can stand inside a gap against the world edge and reach a dead end. Expected for "styled only" (D-02); flag for Phase 2.

### Pillar 3: Color (3/4)

- Hex audit against the contract, all exact: page `#2A2A2A` (`index.astro`, `main.ts` backgroundColor); frame `#4A3729` 4px (`GameCanvas.astro`); floor `#4A3729`/`#6B4E3D` (`LivingRoomScene.ts`); walls `#2A2A2A`; thresholds and couch `#8B6F5E`; coffee table and lamp stand `#555555`; TV casing `#3D3D3D`; TV screen `#6B8FBF`; lamp glow and notch `#FFA500`; player body `#4A5A4A` with `#2A2A2A` outline (`Player.ts`).
- Accent discipline holds: `#FFA500` appears only on the gate CTA, the four notch textures, and the lamp glow — the three declared spots.
- 60/30/10 holds structurally: dominant `#2A2A2A` (walls, page), secondary browns and grays (floor, furniture), accent confined.
- WARNING: the palette is hand-typed as literals in five files (`index.astro`, `main.ts`, `GameCanvas.astro`, `LivingRoomScene.ts`, `Player.ts`), and the spec's "reusable token for Phase 4 LITE-02" for the cold-blue (`#6B8FBF`) exists only as a file-local `const TV_SCREEN` in `LivingRoomScene.ts`. Phase 4 will have to hunt it down. Extract a shared palette module when Phase 4 starts, or now.
- UAT: checkerboard `#4A3729`/`#6B4E3D` contrast against the `#4A5A4A` player with its `#2A2A2A` outline — confirm silhouette legibility on a real display.

### Pillar 4: Typography (3/4)

- Sizes: 32px display and 12px label, matching the 3-size scale (16px body reserved, correctly unused).
- Weights: `fontStyle: 'bold'` (700) for the CTA, default 400 for the subline. Matches.
- Font stack: `FONT = 'ui-monospace, "Courier New", monospace'` applied to both texts. Matches.
- WARNING: the declared line-heights (display 1.2, label 1.5) are not set anywhere; Phaser uses its font-metric default. Single-line text makes this low-impact, but the contract column is unimplemented.
- WARNING (UAT): the subline gap. The CTA is origin-centered at y=224 and the subline at y=256; estimated text boxes leave roughly 6px between them, not the declared 4px. Measure in a browser.
- Gate block vertical centre is about y=234 against a canvas centre of 240. Not a contract line; noted only.

### Pillar 5: Spacing (2/4)

- Met: 4px canvas border (`xs`), 16px gutter around the frame (`md`), 16px tile geometry (every wall, floor cell, furniture footprint, and the 32px player are multiples), 640×480 logical canvas.
- **Conformance break:** `src/pages/index.astro` `.page` declares `min-height: 100dvh` and `padding: 16px`. There is no `box-sizing: border-box` anywhere in `src/` or `public/` (grep confirmed), so `.page` renders at `100dvh + 32px`. The `html`/`body` do not set `overflow: hidden`, so the document scrolls 32px on every viewport. The `overflow: hidden` on `.page` clips only its own children and does not prevent this. This contradicts UI-SPEC §Canvas Framing ("overflow: hidden (no scroll content)") and the Truths claim that overflow is contractually impossible.
- The `.frame` max-height `calc(100dvh - 40px)` plus 4px border (content-box) fits inside `100dvh - 32px`, so the frame itself is correct once `.page` is border-box.
- Concern (UAT): on viewports smaller than 680×520, the frame shrinks and Phaser `FIT` CSS-scales the 640×480 canvas to a non-integer factor. UI-SPEC promises "integer zoom steps", which is not what `Scale.FIT` produces below native size. At 1440×900 the frame is native 640×480 and renders 1:1, so the issue is confined to small viewports. Phase 1 scope excludes mobile (Phase 8).

### Pillar 6: Experience Design (3/4)

- Flow: BootScene → PreloadScene (pass-through, no progress bar — matches contract) → GateScene → LivingRoomScene. The one-shot `keydown` removes itself on fire, matching the cleanup decision.
- Movement and camera wiring is correct in source: 120 px/s, normalized diagonals, wall and furniture colliders on the `solids` static group, `setCollideWorldBounds`, `startFollow(player, true, 0.05, 0.05)` (D-06), zoom 4 on the world camera only, camera bounds clamped to 320×240, UI text on a separate unzoomed GateScene camera.
- Facing notch: init `'up'` (D-03/D-08), updated on velocity change, notch offset 4px inset per direction. Body stays 32×32 across all four textures.
- WARNING (UAT): held-key carry-over from the gate (see Top Fix 3).
- WARNING: the canvas has no role, label, or focus target (`GameCanvas.astro`); a keyboard user can't tell the game is there. See Top Fix 2.
- WARNING (UAT): no visible handling for window blur. Keys held when focus leaves may remain stuck `isDown` until the next keypress in that window. Verify and decide whether to reset keys on blur.
- Loading and error states are contractually absent (zero assets; the spec dismisses them). Not a finding.
- UNVERIFIED — SC#5 "no console errors": not checkable without a browser. Requires a UAT console pass in the dev server and production build.
- Registry audit: not applicable (shadcn not initialized, no third-party registries).

---

## Visual UAT Checklist (no browser in this run)

- [ ] Page does not scroll at 1440×900, 1280×720, 1920×1080 (Pillar 5 fix verified)
- [ ] Gate: "PRESS ANY KEY" and subline centered; subline gap ≈ 4px
- [ ] Any key enters the Living Room; no extra key presses required
- [ ] Holding an arrow key through the gate does not move the player on entry
- [ ] Checkerboard floor reads as 16px tiles; player silhouette distinct from floor
- [ ] Notch points up at spawn and flips correctly for left, right, down
- [ ] Player stops flush against all four walls and all four furniture pieces (no visible overlap or gap)
- [ ] Camera trail visibly lags and settles over ~1s; camera never shows black outside walls
- [ ] West/east door gaps (rows 6–7) visible as lighter thresholds
- [ ] Lamp glow reads as a lamp accent
- [ ] Browser console empty after gate and after walking (SC#5)
- [ ] Canvas at a small viewport (<680px): scaling not visibly uneven (accepted risk, Phase 8 mobile)

---

## Files Audited

- `.planning/phases/01-core-game-loop/01-UI-SPEC.md`
- `.planning/phases/01-core-game-loop/01-CONTEXT.md`
- `.planning/phases/01-core-game-loop/01-01-SUMMARY.md`, `01-02-SUMMARY.md`, `01-03-SUMMARY.md`
- `src/pages/index.astro`
- `src/components/GameCanvas.astro`
- `src/game/main.ts`
- `src/game/scenes/BootScene.ts`, `PreloadScene.ts`, `GateScene.ts`, `LivingRoomScene.ts`
- `src/game/objects/Player.ts`
- `src/game/systems/movement.ts`
- Grep: `box-sizing`, `aria`/`role`/`tabindex`, global styles (none found)
- Phaser `Config.js`: confirmed `pixelArt: true` implies `roundPixels: true` (spec satisfied)
