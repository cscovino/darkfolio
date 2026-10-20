---
phase: "01"
slug: "core-game-loop"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
status: validated
nyquist_compliant: false
wave_0_complete: false
created: "2026-10-20"
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Audit result: **ESCALATED** — 0 of 3 requirements fully covered by automated tests; 1 partial (GAME-01 math only); 2 blocked by test-infrastructure gaps (see Escalations).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.1.9 (happy-dom environment) |
| **Config file** | `vitest.config.ts` — no `@/` alias (see Escalation E-1) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test` + AGENTS.md gate (`pnpm format`, `pnpm exec astro check`, `pnpm build`) |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test` and the AGENTS.md gate
- **Before `/gsd-verify-work`:** Full suite must be green, and the UAT batch below must be run in a browser
- **Max feedback latency:** ~3 seconds (unit); browser UAT is manual

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-T1 | 01 | 1 | — (T-01-SC) | T-01-SC | phaser@4.2.1 legitimacy verified before install | manual (checkpoint) | — (approval recorded in 01-01-SUMMARY) | n/a | ✅ approved (manual) |
| 01-01-T2 | 01 | 1 | GAME-01 | T-01-01 | Velocity bounded to SPEED; diagonals not faster | unit | `pnpm test` (`src/game/systems/movement.test.ts`) | ✅ | ⚠️ partial — math only |
| 01-01-T2 | 01 | 1 | GAME-01 | T-01-01 | Key state → player velocity wiring at 120 px/s in scene | integration | — | ❌ W0 | ❌ escalated (E-1, E-2) |
| 01-01-T2 | 01 | 1 | GAME-03 | — | Camera lerp 0.05 follows player, no snap | integration | — | ❌ W0 | ❌ escalated (E-1, E-2, E-3) |
| 01-02-T1 | 02 | 2 | GAME-01 | T-01-02 | Gate is only pre-play screen; first keydown starts LivingRoomScene; listener removed | integration | — | ❌ W0 | ❌ escalated (E-1, E-2, E-3) |
| 01-02-T2 | 02 | 2 | — (housekeeping) | — | opencode.jsonc / robots.txt tracked, byte-identical | shell | `git ls-files --error-unmatch opencode.jsonc public/robots.txt` | n/a | ✅ green (verified 2026-10-20) |
| 01-03-T1 | 03 | 2 | GAME-02 | — | Player blocked by walls and all four furniture bodies; cannot leave room | integration | — | ❌ W0 | ❌ escalated (E-1, E-2, E-3) |
| 01-03-T2 | 03 | 2 | GAME-02 | — | Facing notch tracks last direction; physics body stays 32×32 | integration | — | ❌ W0 | ⬜ manual only (see Manual-Only) |

*Status: ⬜ pending · ✅ green · ❌ red/missing · ⚠️ partial · ❌ escalated*

---

## Requirement Coverage Scorecard

| Requirement | Status | Evidence | Gap |
|-------------|--------|----------|-----|
| GAME-01 (move at 120 px/s, WASD/arrows) | ⚠️ PARTIAL | `movement.test.ts`: 5 green cases on `velocityFromKeys` (speed, cardinals, opposing keys, diagonal normalization, speed argument) | Scene key→velocity wiring and measured body speed not automated; boot/gate chain not automated |
| GAME-02 (collide with walls and furniture) | ❌ ESCALATED | none automated | No executable proof of wall or furniture blocking; scene cannot load under vitest (E-1, E-2, E-3) |
| GAME-03 (camera follows with lerp, not snap) | ❌ ESCALATED | none automated | Camera follow not executable under vitest (E-1, E-2, E-3); lerp 0.05 verified by code reading only |

**Overall:** 0/3 COVERED · 1/3 PARTIAL · 2/3 ESCALATED.

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — add `resolve.alias` for `@/` paths (mirror the tsconfig `paths`). Required before any scene or `Player` test can import. Config change, not made by this audit (see E-1).
- [ ] Phaser 2D-context stub in test file — `HTMLCanvasElement.prototype.getContext` returns null under happy-dom; Phaser's module init throws (see E-2).
- [ ] Headless scene bootstrap helper — `game.events.emit('ready')`, register `__WHITE`/`__DEFAULT`/`__MISSING` canvases, drive `game.scene.update` with `isProcessing` cleared (see E-3).
- [ ] Renderer for `generateTexture` — `LivingRoomScene.create` calls `ensurePlayerTexture` → `Graphics.generateTexture`, which requires a canvas renderer that `Phaser.HEADLESS` does not provide (see E-3).

*Spike evidence:* `/tmp/opencode/nyquist/spike.test.ts` and `/tmp/opencode/nyquist/vitest.config.ts` (outside the repo). The spike proved steps 1–4 above; it stopped at step 5 (renderer). Not committed.

---

## Escalations

### E-1 — test config lacks `@/` aliases (infrastructure, BLOCKER for scene tests)
- **Evidence:** importing `@/scenes/LivingRoomScene` in a vitest file fails: `Failed to resolve import "@/scenes/LivingRoomScene"`. Astro resolves tsconfig `paths` in its own Vite pipeline; `vitest run` does not. `Player.ts` and `LivingRoomScene.ts` both import via `@/…`, so every game-module test fails at import.
- **Verified fix (out-of-repo config):** six `resolve.alias` entries mapping `@/systems/`, `@/scenes/`, `@/objects/`, `@/game/`, and `@/` onto `src/`. This resolved all imports.
- **Recommendation:** add the alias block to `vitest.config.ts` (no new dependency). Alternative `vite-tsconfig-paths` is a new dependency and needs user approval per AGENTS.md.

### E-2 — Phaser needs a 2D canvas context at module load (infrastructure, BLOCKER)
- **Evidence:** `import('phaser')` throws `TypeError: Cannot set properties of null (setting 'fillStyle')` in `checkInverseAlpha` because happy-dom's `getContext('2d')` returns null.
- **Verified fix:** a `vi.hoisted` stub on `HTMLCanvasElement.prototype.getContext` that returns a permissive proxy (with `getImageData` and `measureText` shaped results). Phaser then imports cleanly.

### E-3 — headless Phaser cannot run `LivingRoomScene.create` (environment, BLOCKER for GAME-02/GAME-03)
- **Evidence (boot path, 5 iterations):**
  1. `Phaser.HEADLESS` boot never emits `ready` under happy-dom → fixed by emitting `ready` manually.
  2. `SceneManager.isProcessing` stays true → fixed by clearing it after each `game.scene.update`.
  3. Default textures (`__WHITE`, `__DEFAULT`, `__MISSING`) never load (async `Image` onload) → fixed by `addCanvas` stand-ins.
  4. `LivingRoomScene.create` reached, then `Graphics.generateTexture` (in `ensurePlayerTexture`) fails: `renderer.blendModes` of null. `HEADLESS` has no renderer, and a CANVAS renderer fails feature detection under happy-dom.
- **Iteration budget:** 3 debug iterations per gap were exhausted by the boot path. The remaining blocker is structural (no renderer), so the gap is escalated rather than worked around by weakening assertions.
- **Recommendation (pick one, needs user decision):**
  - (a) In-repo renderer stub passed into `game.renderer` (fragile: canvas renderer touches many properties).
  - (b) Browser-level test with Playwright. Real renderer, real keyboard, real collisions. New dependency, so surface to the user first.
  - (c) Move the furniture/gap/spawn constants into a pure module and assert geometry in vitest. Requires an implementation refactor, so it is out of this audit's scope.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Gate shows before the room; any key enters the room; gate-time keys have no visible effect (gate → room) | GAME-01 | Renderer + keyboard integration not runnable headless (E-3) | `pnpm dev` → http://localhost:4321/darkfolio/: gate first, orange PRESS ANY KEY over brown subline, one keypress enters room, player not pre-moved |
| Player blocked by TV, couch, coffee table, lamp from every approach; blocked by all walls | GAME-02 | E-3 | Walk into each piece from N/S/E/W; confirm no overlap, no clipping |
| Player can walk INTO either door gap but never leaves the room | GAME-02 | E-3; gap width (32 px) equals player width (32 px) — zero slack, corner snagging possible | Walk west and east at rows 6–7; confirm entry into recess, no exit, no snag |
| Camera lerps (no snap) and follows on both axes | GAME-03 | E-3 | Walk diagonally; confirm trailing lag, no jitter at zoom 4 |
| Checkerboard floor, TV/screen, lamp glow, thresholds, notch flips with direction, static body | GAME-02 (art) | Visual | Per 01-03 human-check items 1–6 |
| Console clean across boot → gate → room (ROADMAP SC#5) | ROADMAP SC#5 | Browser console | Open devtools; zero errors across the flow |
| Landing page mounts canvas in place of portfolio (ROADMAP SC#1) | ROADMAP SC#1 | Visual | Load /darkfolio/; canvas present, no scroll-first content |

Carry all rows above into the end-of-phase UAT batch.

---

## Findings (WARNING, from code reading, unverified at runtime)

- **W-1 (GAME-01):** the 120 px/s guarantee is proven for the velocity helper only. Arcade body speed after `setVelocity` and world bounds is not measured. Confirm in browser.
- **W-2 (GAME-02):** the west and east door gaps are 32 px (2 tiles) and the player body is 32×32, so clearance is zero. Arcade may snag at the wall edge. Confirm in browser.
- **W-3 (GAME-03):** lerp 0.05 is set by `startFollow(player, true, 0.05, 0.05)`. Verified by reading only.

No BLOCKER-class defect was found in the implementation by reading. The gaps are coverage gaps, not confirmed behavioral failures.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies — **not met** (E-1, E-2, E-3)
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify — **not met** (01-01-T2 GAME-03, 01-02-T1, 01-03-T1 lack automated verify)
- [ ] Wave 0 covers all MISSING references — **not met** (4 Wave 0 items open)
- [x] No watch-mode flags
- [ ] Feedback latency < 10s — **met** for unit (~3s); browser UAT manual
- [ ] `nyquist_compliant: true` set in frontmatter — **not set** (escalated)

**Approval:** pending — escalations E-1, E-2, E-3 require a user decision before this phase can be marked compliant.

---

## Validation Audit 2026-10-20

| Metric | Count |
|--------|-------|
| Gaps found | 3 (GAME-01 partial, GAME-02 missing, GAME-03 missing) |
| Resolved (new automated tests) | 0 |
| Escalated | 2 (GAME-02, GAME-03) + GAME-01 wiring |
