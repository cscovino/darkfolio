# Phase 2 — UI Review

**Audited:** 2026-10-21
**Baseline:** `01-UI-SPEC.md` (approved 2026-10-19, Phase 1) + abstract 6-pillar standards — no `02-UI-SPEC.md` exists for this phase; 02-CONTEXT.md (D-01…D-19) and 02-REVIEW.md (WR-01/WR-02, IN-01…IN-04) are the phase-local contracts
**Screenshots:** not captured — no browser binary available (Playwright/Chrome not installed in this environment); a dev server is reachable at `localhost:4321/darkfolio/` but capture tooling is unavailable. All findings are source-derived; visual claims are marked for UAT.
**Interaction captures:** off (`workflow.ui_interaction_capture` not enabled in `.planning/config.json`)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | Phase 2 ships zero new copy; GateScene contract (`PRESS ANY KEY`, `the house is listening`, `<title>Darkfolio</title>`) is untouched and still matches. |
| 2. Visuals | 3/4 | Three dense rooms read as distinct (warm browns / muted greens / near-black) with threshold-accented 48px doors and boarded/locked decor; yard props sit at near-zero contrast and the player may blend into the office floor. |
| 3. Color | 3/4 | Accent discipline holds (warm yellow only on gate CTA, player notch, 3 lamp glows; cold blue only on TV + computer screens), but the palette sprawled to ~15 new hexes with no shared palette module and the cold-blue token is still file-local. |
| 4. Typography | 3/4 | No new text this phase; the declared line-heights (1.2 / 1.5) and the 4px gate gap remain unimplemented, carried from Phase 1. |
| 5. Spacing | 2/4 | All in-game geometry is 16px-tile-snapped, but the page-level bug persists: `.page` `min-height: 100dvh` + `padding: 16px` with no `box-sizing` reset makes the document 32px taller than the viewport and scrolls — the overflow contract is still broken. |
| 6. Experience Design | 3/4 | Gate → 3-room glide flow and the `currentRoom` store are wired and tested; open code-review warnings (WR-01 spurious trigger, WR-02 stuck-state on teardown) plus the carried accessibility gap (no canvas role/label) remain. |

**Overall: 18/24**

**BLOCKER count: 0.** No pillar scored 1 and no source defect breaks task completion (spawn → walk → glide across all three rooms → return). Several WARNINGs and UAT-gated items below; two are carried over unfixed from Phase 1.

---

## Top 3 Priority Fixes

1. **Page scrolls by 32px (carried, still unfixed)** — `.page` in `src/pages/index.astro` uses `min-height: 100dvh; padding: 16px` with no `box-sizing` reset, so the document is `100dvh + 32px` tall and a scrollbar appears; `overflow: hidden` on `.page` does not stop body scroll. User impact: the "no scroll content / overflow impossible" contract (D-12/D-13) is visibly broken on every desktop viewport, and it has now survived two phases. Fix: add `box-sizing: border-box;` to `.page` (the frame's `content-box` is already sized to fit inside `100dvh − 32px`).

2. **Door trigger fires without confirming the player is on the entry side (WR-01)** — `triggeredSide()` in `src/game/systems/doorGlide.ts:53-72` fires a side from facing alone (bump pass) or a raw key hold (handle pass) plus zone membership. Because each `DoorDef.zone` straddles the shared wall, a player standing on the wrong side of the zone — or holding both opposite keys (net-zero movement) — can trigger a spurious 48px glide that crosses no real door and locks input for `GLIDE_MS`. User impact: uncontrolled teleport + 700 ms input dead-zone mid-play, reads as a bug. Fix: add an entry-side guard (`pos` on the source side of `door.axis`) to both passes and require `keys[side.dir] && !keys[opposite[side.dir]]` in the handle pass (see 02-REVIEW.md WR-01).

3. **Game canvas has no accessible name (carried, still unfixed)** — `src/components/GameCanvas.astro` renders `<div id="game-root">` with no role or label, so the entire experience is invisible to assistive tech. User impact: the only interactive surface announces nothing; AGENTS.md "accessibility basics" is not met. Fix: `<div id="game-root" role="application" aria-label="Darkfolio game"></div>`. Adds no visible text, so it does not violate the "no visible HTML text" contract.

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)

- Phase 2 added **zero** new string literals: no new scenes with text, no labels, no empty/error/empty-state copy. `src/game/scenes/GateScene.ts` (untouched) still renders `'PRESS ANY KEY'` (32px, bold, `#FFA500`) and `'the house is listening'` (12px, `#8B6F5E`) byte-for-byte against the Phase 1 contract; `src/pages/index.astro` still ships only `<title>Darkfolio</title>`.
- No generic labels (`Submit`, `OK`, `Click Here`, `Save`) anywhere in the phase's files.
- Empty, error, and destructive copy remain dismissed per the Phase 1 contract (zero fetching, zero assets, no destructive actions); Phase 2 introduces no data-driven UI that would require them.
- Finding (not a defect): the only copy surface is still the Phase 1 gate; Phase 2's rooms are silent by design (interaction/dialog is Phase 3).

### Pillar 2: Visuals (3/4)

- Composition follows the room model: each room is a 20×15 tile checkerboard floor (per-room `floorA`/`floorB`) with 1-tile walls, collision-only furniture, and decor; draw order is floor graphics → walls (solids) → solids → decor in `buildLiving`/`buildOffice`/`buildBedroom`, and `drawYard()` runs first so the yard sits under the L.
- Room identity is distinct per D-18: Living = warm browns (`#4a3729`/`#6b4e3d`), Office = muted greens/greys (`#35402f`/`#42503c` with `#46534a` rug), Bedroom = deep browns/near-black (`#2e2118`/`#3a2c1e`) with the warm lamp pop (`#ffa500`). The player (`#4a5a4a` body, `#2a2a2a` outline, `#ffa500` notch) stays the only green-on-brown focal point in the Living Room.
- Doorways are readable: 48px (3-tile) gaps with `#8b6f5e` threshold rects on both sides of each shared wall (north + west), plus 2px frame accents (`#9a7d64`) on the sealed/locked doors; sealed east door (`#241a10` planks + `#14100a` lines) and the locked front door behind spawn (`#241a10` + `#555555` lock glint) are visually distinct from the open, lighter thresholds. D-15 sightlines are supported by the data (no furniture blocks the gap lanes; tests assert lane/rest-spot clearance).
- WARNING: the yard props (`#2a2a20` dead shrub, `#241c14` fence posts) sit on ground `#1c1a14` with patches `#22261a` — contrast is ~0.05 in channel space, so the silhouettes may not register as "exterior dressing" and can read as a rendering bug rather than a yard (D-12). Needs UAT judgement; if confirmed, lighten props to `#3a3428`/`#4a4234` or add a 1px highlight.
- WARNING (UAT): the player body `#4a5a4a` on the office floor `#35402f`/`#42503c` is closer in luminance than on the living floor; the `#2a2a2a` outline is the separator. Confirm silhouette legibility on a real display before Phase 3 attaches interaction prompts to hosts.
- INFO: the office has no warm accent light source besides the lamp glow and the cold-blue computer screen; the desk plant (`#5a7a4a`) and bookshelf (`#3d2f1f`) are the only non-floor greens — acceptable, but the room leans grey. Cosmetic.
- INFO: `LivingRoomScene` is misnamed — it is the single live scene composing all three rooms + the yard (IN-03). Cosmetic, but it will confuse Phase 3 wiring if per-room scenes are expected.

### Pillar 3: Color (3/4)

- Accent discipline holds against the Phase 1 contract: warm yellow `#FFA500` appears only on the gate CTA, the player facing notch (4 textures, one logical element), and the three lamp glows (living/office/bedroom); cold blue `#6B8FBF` appears only on the TV screen and the office computer screen. No accent leakage onto furniture, floors, or walls.
- 60/30/10 holds structurally: dominant `#2A2A2A` walls + page background + yard-adjacent darks; secondary browns/greys (floors, furniture, thresholds); accent confined to the declared light-source/UI spots.
- WARNING: the palette sprawled. Phase 2 introduced ~15 hexes not in the locked Darkwood set or the Phase 1 element map (`#35402f`, `#42503c`, `#46534a`, `#5a7a4a`, `#5a4a32`, `#3d2f1f`, `#2e2118`, `#3a2c1e`, `#31261c`, `#4a3423`, `#9a7d64`, `#8fa5b5`, `#2a2a20`, `#241c14`, `#241a10`, `#14100a`). D-18 (per-room color temperature) legitimately needs new tones, but they were hand-typed into `src/game/data/rooms.ts` with no canonical list, so the "Darkwood palette" is now defined by wherever a hex happens to appear.
- WARNING (carried): the palette is still duplicated as literals across files (`rooms.ts` holds all of them; `Player.ts`, `GateScene.ts`, `main.ts`, `index.astro`, `GameCanvas.astro` each re-type their own). The Phase 4 LITE-02 cold-blue token (`#6B8FBF`) exists only as the file-local `0x6b8fbf` literal in `rooms.ts` decor tuples — never extracted. Phase 4 will have to hunt it down.
- INFO: the yard's ground `#1c1a14` is near-pure black, darker than the declared dominant `#2A2A2A`; it reads as exterior void rather than a room, which is the intent (D-12), but it is a fourth "dark" tone outside the 60/30/10 framing. Acceptable if intentional.

### Pillar 4: Typography (3/4)

- Phase 2 added **no** text. The only canvas text is still `GateScene`: 32px display (bold) + 12px label, monospace stack (`ui-monospace, "Courier New", monospace`) — matches the 3-size/2-weight scale (16px body reserved, correctly unused).
- WARNING (carried): the declared line-heights (display 1.2, label 1.5) are still not set anywhere; Phaser uses its font-metric default. Single-line text keeps this low-impact, but the contract column is unimplemented.
- WARNING (carried, UAT): the gate subline gap. CTA origin-centered at y=224, subline at y=256; estimated text boxes leave ~6px, not the declared 4px. Measure in a browser.
- INFO: no font-size or weight drift introduced; the 16px body size remains correctly unused.

### Pillar 5: Spacing (2/4)

- Met: all in-game geometry is tile-snapped — 16px tiles, 32×32 player, 16px walls, 48px (3-tile) door gaps, 32px (2-tile) west gap height, 8×8 lamp glow notches; `ROOM_W`/`ROOM_H` 20×15, `WORLD_W`/`WORLD_H` 640×480. Decor sub-tile rects (8×8, 12×8, etc.) are consistent with the Phase 1 pixel-art convention.
- **Conformance break (carried, still unfixed):** `src/pages/index.astro` `.page` declares `min-height: 100dvh` and `padding: 16px` with no `box-sizing: border-box` anywhere in `src/` or `public/` (grep confirmed). `.page` renders at `100dvh + 32px`; `html`/`body` do not set `overflow: hidden`, so the document scrolls 32px on every viewport. The `overflow: hidden` on `.page` clips only its own children. This contradicts UI-SPEC §Canvas Framing ("overflow: hidden (no scroll content)") and the Truths claim that overflow is contractually impossible. Phase 2 did not touch this file.
- The `.frame` max-height `calc(100dvh − 40px)` plus 4px border (content-box) fits inside `100dvh − 32px`, so the frame itself is correct once `.page` is border-box.
- Concern (UAT, carried): on viewports smaller than 680×520 the frame shrinks and Phaser `FIT` CSS-scales the 640×480 canvas to a non-integer factor. UI-SPEC promises "integer zoom steps", which `Scale.FIT` does not produce below native size. At 1440×900 the frame is native 640×480 and renders 1:1. Phase 2 scope excludes mobile (Phase 8).
- INFO: door zones (48×48) and reach rects extend the spacing scale by 16px (`REACH = 16`) — a documented, tested constant in `doorGlide.ts`. Acceptable.

### Pillar 6: Experience Design (3/4)

- Flow: `BootScene → PreloadScene (pass-through, no progress bar) → GateScene → LivingRoomScene`, with the one-shot `keydown` removing itself on fire (Phase 1 contract intact). Phase 2 keeps `main.ts` and `GateScene.ts` untouched.
- Multi-room flow is wired and tested: both door pairs (north Living↔Office, west Living↔Bedroom) trigger a `~700 ms` `Sine.easeInOut` glide (`GLIDE_MS = 700`, `GLIDE_STEP = 48`) with deterministic rest spots `(408,192)`/`(408,288)` and `(272,344)`/`(368,344)`; input locks during glide (`gliding = true`, body disabled) and restores on completion; camera bounds clamp to the 640×480 L; `startFollow(player, true, 0.05, 0.05)` reuses the Phase 1 lerp.
- First-class state: `currentRoom` store (`src/game/state/currentRoom.ts`) + `roomAt()` zone system (`src/game/systems/currentRoom.ts`) give Phases 3–5 a single value to read; `setCurrentRoomFrom()` is called from `update()` while not gliding.
- WARNING (WR-01, open): spurious door trigger — see Top Fix 2. Affects flow robustness.
- WARNING (WR-02, open): `startGlide` restores physics/input/body only inside the tween's `onComplete`. If the tween is stopped or the scene tears down mid-glide, `onComplete` never fires: body stays disabled, `gliding` stays `true`, the player becomes permanently unresponsive, and `currentRoom` stays stale. Fix: register `tween.on('stop', finish)` and `this.events.once(SHUTDOWN, finish)` (see 02-REVIEW.md WR-02).
- WARNING (IN-02, open): `currentRoom` is stale for the full 700 ms glide (update returns early while gliding; state is only set in `onComplete`). No Phase 2 consumer reads it mid-glide, but Phase 3 interaction/overlay logic may. Fix: set `setCurrentRoom(side.dest)` at glide start.
- WARNING (IN-04, open): the handle pass checks raw `keys[side.dir]`, so holding both opposite keys while standing in a reach zone still satisfies the held-key condition. Combine with the WR-01 entry-side guard.
- WARNING (carried): held-key carry-over from the gate (Phase 1 Top Fix 3) is still unaddressed; `LivingRoomScene` does not ignore movement input until all movement keys have been released once after entering.
- WARNING (carried): the canvas still has no `role`/`aria-label`/focus target (`GameCanvas.astro`); a keyboard user cannot tell the game is there. See Top Fix 3.
- WARNING (carried): no window-blur handling; keys held when focus leaves may remain stuck `isDown` until the next keypress.
- Loading/error/empty states remain contractually dismissed (zero assets, zero fetching, static hand-placed rooms); Phaser's WebGL→Canvas fallback is automatic. Not a finding.
- Registry audit: not applicable (no `components.json`; shadcn not initialized; no third-party registries; AGENTS.md locks the tech stack). Note: `Registry audit: 0 third-party blocks checked, no flags`.

---

## Files Audited

- `.planning/phases/01-core-game-loop/01-UI-SPEC.md` (baseline contract)
- `.planning/phases/01-core-game-loop/01-UI-REVIEW.md` (prior scores/findings)
- `.planning/phases/02-multi-room/02-CONTEXT.md`, `02-DISCUSSION-LOG.md`, `02-PATTERNS.md`
- `.planning/phases/02-multi-room/02-01-PLAN.md`, `02-02-PLAN.md`
- `.planning/phases/02-multi-room/02-01-SUMMARY.md`, `02-02-SUMMARY.md`
- `.planning/phases/02-multi-room/02-REVIEW.md`, `02-REVIEW-DISPOSITION.md`
- `src/game/data/rooms.ts`, `src/game/data/rooms.test.ts`
- `src/game/systems/currentRoom.ts`, `src/game/systems/currentRoom.test.ts`
- `src/game/systems/doorGlide.ts`, `src/game/systems/doorGlide.test.ts`
- `src/game/state/currentRoom.ts`
- `src/game/scenes/LivingRoomScene.ts`, `src/game/scenes/OfficeScene.ts`, `src/game/scenes/BedroomScene.ts`
- `src/game/objects/Player.ts`, `src/game/main.ts`
- `src/game/scenes/GateScene.ts`, `src/game/scenes/BootScene.ts`, `src/game/scenes/PreloadScene.ts`
- `src/pages/index.astro`, `src/components/GameCanvas.astro`
- `.opencode/skills/pixel-art/SKILL.md`
- Grep: hardcoded hex/rgb, accent usage, font sizes/weights, spacing classes, arbitrary px/rem, aria/role/tabindex, box-sizing, loading/error/empty states, palette/token modules

---

## Visual UAT Checklist (no browser in this run)

- [ ] Page does not scroll at 1440×900, 1280×720, 1920×1080 (Pillar 5 fix verified)
- [ ] Gate: "PRESS ANY KEY" and subline centered; subline gap ≈ 4px
- [ ] Spawn in Living → walk north through doorway → ~0.7s floaty glide into the green Office, no fade/cut; input dead mid-glide, live after; south to return; rest spots pixel-identical on repeat
- [ ] Spawn in Living → walk west through doorway → glide into the near-black Bedroom with the warm lamp pop; east to return; rest spots pixel-identical on repeat
- [ ] Full SC#1–6 walk: Living → north door → Office → south door → Living → west door → Bedroom → east door → Living; collision and camera follow live in all three rooms
- [ ] Each room reads distinct from its doorway (D-15); furniture silhouettes visible through gaps before crossing
- [ ] Sealed east door reads as boarded; locked front door behind spawn reads as locked (planks + glint)
- [ ] Office floor/furniture distinct from the player silhouette; notch points correctly in all four directions
- [ ] Yard past outer corners reads as dark exterior (dirt + shrub + fence), never a black void or walkable gap
- [ ] No console errors on boot or during the full walk (SC#5)
- [ ] Canvas at a small viewport (<680px): scaling not visibly uneven (accepted risk, Phase 8 mobile)
- [ ] Player does not move on entry when an arrow key was held through the gate
- [ ] Yard props (shrub, fence) are visible silhouettes, not invisible (contrast check)
