---
phase: "02"
slug: "multi-room"
status: validated
nyquist_compliant: false
wave_0_complete: false
created: "2026-10-21"
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Reconstructed post-execution by /gsd-validate-phase (State B — no VALIDATION.md seeded at plan time).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.1.9 (happy-dom environment) |
| **Config file** | `vitest.config.ts` — no `@/` alias (see Escalation E-1, carried from Phase 01) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test` + AGENTS.md gate (`pnpm format`, `pnpm exec astro check`, `pnpm build`) |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test` and the AGENTS.md gate
- **Before `/gsd-verify-work`:** Full suite must be green; browser UAT batch below must be run
- **Max feedback latency:** ~5 seconds (unit); browser UAT is manual

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-T1 | 01 | 1 | GAME-04, ROOM-01, ROOM-02 | T-02-01 | Continuous 640x480 L-world, deterministic north-door glide, store update | unit (pure) + grep | `pnpm test` (`rooms.test.ts`, `doorGlide.test.ts`, `currentRoom.test.ts`) | ✅ | ✅ green |
| 02-01-T1 | 01 | 1 | GAME-04, ROOM-01, ROOM-02 | T-02-01 | Scene wiring: update() → triggeredSide → startGlide tween → setCurrentRoom on complete; gliding input lock | integration | — | ❌ W0 | ❌ escalated (E-1, E-2, E-3) |
| 02-01-T2 | 01 | 1 | GAME-04 | — | Dense Office layout: ≥8 solids incl. computer + bookshelf hosts; clear south lane + rest spot; rug in decor | unit | `pnpm test` (`rooms.test.ts#office dense layout`) | ✅ | ✅ green |
| 02-01-T3 | 01 | 1 | ROOM-01 | — | Sealed east + locked front door decor; no door gap on sealed wall bands; front-door plank behind spawn | unit | `pnpm test` (`rooms.test.ts#sealed wall bands and door decor`) | ✅ | ✅ green |
| 02-02-T1 | 02 | 2 | GAME-04, ROOM-01, ROOM-02 | T-02-03 | West door pair by data; Bedroom dense layout + phone host; clear lanes/rest spots both sides | unit | `pnpm test` (`rooms.test.ts`, `doorGlide.test.ts#west door`) | ✅ | ✅ green |
| 02-02-T2 | 02 | 2 | GAME-04 | — | Yard dressing inside YARD_RECT, clear of room zones; zero physics bodies | unit + grep | `pnpm test` (`rooms.test.ts#yard dressing`) | ✅ | ✅ green |
| 02-02-T2 | 02 | 2 | GAME-04 | — | Visual read of yard as exterior rather than rendering bug | manual | — | n/a | ⬜ manual only |

*Status: ⬜ pending · ✅ green · ❌ red/missing · ⚠️ partial · ❌ escalated*

---

## Requirement Coverage Scorecard

| Requirement | Status | Evidence | Gap |
|-------------|--------|----------|-----|
| GAME-04 (three rooms, each 20x15 tiles) | ⚠️ PARTIAL | `rooms.test.ts`: 26 green cases incl. new `room contract constants` (TILE=16, ROOM_W=20, ROOM_H=15, WORLD box, 3 zones of 320x240, origins, layouts) and `yard dressing` | Scene-level: camera/physics bounds = house box, buildOffice/buildBedroom composition, drawYard rendering not automated (E-1, E-2, E-3) |
| ROOM-01 (doors trigger slide transitions) | ⚠️ PARTIAL | `doorGlide.test.ts`: 18 green cases (triggeredSide bump/handle/precedence/order/no-retrigger for both doors; reachRect up/down/left/right; glideEnd determinism; glide constants) + `rooms.test.ts` gap-alignment + sealed-wall invariants | Scene-level: trigger routing in LivingRoomScene.update, startGlide tween, gliding input lock, setCurrentRoom on glide completion not automated (E-1, E-2, E-3) |
| ROOM-02 (player spawns at correct tile on entry) | ⚠️ PARTIAL | `doorGlide.test.ts`: glideEnd exact integer rest spots (408,192)/(408,288)/(272,344)/(368,344) deterministic on repeat; `currentRoom.test.ts`: 11 green cases (roomAt half-open/declaration order/null, setCurrentRoomFrom keep-last guard, store round-trip/default) + `rooms.test.ts` spawn/rest-spot clearance | Scene-level: Player.setFacing/getFacing, body.reset to integer end, spawn at (480,448) in live scene not automated (E-1, E-2, E-3) |

**Overall:** 0/3 fully COVERED at scene level · 3/3 PARTIAL (pure-logic layer green) · scene wiring ESCALATED (carried infra blockers).

---

## Wave 0 Requirements

Carried from Phase 01 (still open — no change in this phase):

- [ ] `vitest.config.ts` — add `resolve.alias` for `@/` paths (mirror tsconfig `paths`). Required before any scene or `Player` test can import. Config change, not made by this audit (see E-1).
- [ ] Phaser 2D-context stub in test file — `HTMLCanvasElement.prototype.getContext` returns null under happy-dom; Phaser module init throws (see E-2).
- [ ] Headless scene bootstrap helper — `game.events.emit('ready')`, register `__WHITE`/`__DEFAULT`/`__MISSING` canvases, drive `game.scene.update` with `isProcessing` cleared (see E-3).
- [ ] Renderer for `generateTexture` — `LivingRoomScene.create` calls `ensurePlayerTexture` → `Graphics.generateTexture`, which requires a canvas renderer that `Phaser.HEADLESS` does not provide (see E-3).

*Pure-logic tests (rooms/currentRoom/doorGlide) require none of the above and are green.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Glide feel: ~0.7s floaty Sine.easeInOut, no fade/cut, input dead mid-glide, live after | ROOM-01 | Visual + timing judgment; tween lives in scene (E-3) | `pnpm dev` → walk north into doorway; confirm glide into Office; repeat; rest spots pixel-identical |
| Camera follows player in all three rooms; bounds = 640x480 house box | GAME-04 | E-3 | Walk all three rooms; confirm follow lerp and no escape into yard |
| Player blocked by walls/furniture in all three rooms; no clipping | GAME-02 (carried) | E-3 | Walk into each solid from N/S/E/W |
| Sealed east door + locked front door read as atmosphere; yard reads as exterior | GAME-04 | Visual | Peek through gaps; confirm boarded east door, locked front door behind spawn, dark yard with shrub/fence |
| Console clean across boot → all three rooms | ROADMAP SC#5 | Browser console | Open devtools; zero errors across the full walk |

Carry all rows above into the end-of-phase UAT batch.

---

## Escalations

### E-1 — test config lacks `@/` aliases (infrastructure, BLOCKER for scene tests)
Carried from Phase 01. Verified fix (out-of-repo config): six `resolve.alias` entries. Not applied by this audit.

### E-2 — Phaser needs a 2D canvas context at module load (infrastructure, BLOCKER)
Carried from Phase 01. `import('phaser')` throws under happy-dom without a canvas-context stub.

### E-3 — headless Phaser cannot run `LivingRoomScene.create` (environment, BLOCKER)
Carried from Phase 01. `Graphics.generateTexture` (in `ensurePlayerTexture`) needs a canvas renderer that `Phaser.HEADLESS` does not provide. Renderer stub (option a) or Playwright (option b) needs a user decision.

### E-4 — Player.setFacing/getFacing untested
`src/game/objects/Player.ts` gained `setFacing`/`getFacing` in Phase 02. Both require a Phaser scene + texture swap, so they sit behind E-1/E-2/E-3. Verified by code reading only; no automated proof.

**No BLOCKER-class defect was found in the implementation by reading. The gaps are coverage gaps, not confirmed behavioral failures.**

---

## Findings (WARNING, from code reading, unverified at runtime)

- **W-1 (ROOM-01):** the glide unlock lives only in the tween `onComplete`; a fixed 700ms tween always completes, but the lock-release path is scene-level and untested (E-3). Confirm in browser.
- **W-2 (ROOM-02):** rest spots are exact integers derived once (axis ± 48px); `glideEnd` uses plain arithmetic, proven by test for all four directions.
- **W-3 (GAME-04):** `WORLD_W`/`WORLD_H` promoted to the 640x480 house box; `physics.world.setBounds` + `camera.setBounds` use the house box — verified by code reading only (E-3).

---

## Validation Sign-Off

- [x] All pure-logic tasks have automated verify (rooms/currentRoom/doorGlide green)
- [ ] Scene-wiring tasks have automated verify — **not met** (E-1, E-2, E-3)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (pure layer)
- [x] Wave 0 pure-logic requirements: no MISSING (rooms/currentRoom/doorGlide covered)
- [ ] Wave 0 scene requirements: 4 items open (carried)
- [x] No watch-mode flags
- [x] Feedback latency < 10s (~5s unit)
- [ ] `nyquist_compliant: true` set in frontmatter — **not set** (scene gaps escalated)

**Approval:** pending — escalations E-1, E-2, E-3 (carried) and E-4 require a user decision before this phase can be marked compliant.

---

## Validation Audit 2026-10-21

| Metric | Count |
|--------|-------|
| Gaps found | 4 (GAME-04 scene wiring, ROOM-01 scene wiring, ROOM-02 scene wiring, Player.setFacing/getFacing) |
| Resolved (new automated tests) | 3 pure-logic clusters: `rooms.test.ts` +26 (was 17) adds contract constants + door registry + spawn constants; `currentRoom.test.ts` +4 (was 7) adds store default/round-trip + half-open edges; `doorGlide.test.ts` +4 (was 14) adds constants + west reachRect + rest-spot zone exclusion |
| Escalated | 4 (E-1, E-2, E-3 carried; E-4 new) |
| Total tests after audit | 67 (was 50) |

### Files for Commit
- `src/game/data/rooms.test.ts`
- `src/game/systems/currentRoom.test.ts`
- `src/game/systems/doorGlide.test.ts`
- `.planning/phases/02-multi-room/02-VALIDATION.md`
