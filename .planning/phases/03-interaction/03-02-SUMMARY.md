---
phase: 03-interaction
plan: 02
subsystem: ui
tags: [phaser4, astro, typescript, visit-counters, dialog-only, typewriter, auto-dismiss]

# Dependency graph
requires:
  - phase: 03-interaction (plan 01)
    provides: interactables registry, dialog system constants + stateAfterTyping('paused'), InteractionUI zoom-1 layer, GameOverlay status-line slot, scene interaction state machine
provides:
  - per-object visit counters (variants.ts: incrementVisit / visitCount / resetVisits / variantFor, deterministic modulo cycle)
  - TV + floor lamp registry entries (dialog-only: verb WATCH / TOGGLE, no overlay field)
  - scene paused branch: blinking ▼ end cue (500/500) + AUTO_DISMISS_MS slide-out beat
affects: [03-interaction (plan 03), 06-content]

# Actuals (#2632) — pairs with the plan's `estimate` to calibrate future estimates.
actuals:
  tokens: 2678
  tasks: 2
  commits: 2

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "deterministic variant cycling: module-level Record<string,number> counters + variantFor(count, pool) = pool[(count-1) % pool.length]; one increment per E press, same N drives dialog + status line"
    - "dialog-only beat: stateAfterTyping(false) -> 'paused' -> blink timer + delayedCall(AUTO_DISMISS_MS) -> slide-out; single dismiss path removes every timer it created"
    - "Phaser end-cue anchoring: getWrappedText() + GetTextSize().lineWidths place the ▼ inline after the last revealed char"

key-files:
  created:
    - src/game/systems/variants.ts
    - src/game/systems/variants.test.ts
  modified:
    - src/game/data/interactables.ts
    - src/game/scenes/LivingRoomScene.ts
    - src/game/objects/InteractionUI.ts

key-decisions:
  - "Visit counter increments exactly once per E press inside startInteraction; the returned N picks both the dialog variant and the overlay status-line variant (D-18/D-19) — no downstream state re-increments"
  - "TV/lamp rects stored as true top-left {464,256} / {512,320} — the plan's literal {472,264} / {520,328} are the world CENTRES of centre-anchored solids; top-left reproduces the UI-SPEC badge anchors (472,248) / (520,312) exactly (same correction class as the 03-01 computer rect)"
  - "'paused' has a single exit path (dismissPaused) that removes the blink timer and hides the cue; a scene SHUTDOWN hook sweeps the timer too (T-3-04) so a second interaction re-blinks cleanly"

patterns-established:
  - "New interactable with variants = registry entry data only (dialogPool [+ statusPool for hosts]); the generic loop and counter wiring are already complete"
  - "Dialog-only objects: no overlay field routes them through stateAfterTyping(false) into the paused auto-dismiss branch — never the CustomEvent bridge"

requirements-completed: [INTR-01, INTR-05]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Every registered object cycles deterministic dialog variants on revisit; visit N shows pool[(N-1) % pool.length], per-object counters independent, same N drives the overlay status line"
    requirement: INTR-05
    verification:
      - kind: unit
        ref: "src/game/systems/variants.test.ts#variantFor maps visit 1/3 to first/last entry and wraps visit 4/7 back to A"
        status: pass
      - kind: unit
        ref: "src/game/systems/variants.test.ts#counters increment per object id independently / return the new count and never auto-increment on read / clear on reset"
        status: pass
      - kind: other
        ref: "grep 'incrementVisit' src/game/scenes/LivingRoomScene.ts + grep 'statusPool'/'PROJECTS INDEX' src/game/data/interactables.ts (.verify/03-02-variants.log)"
        status: pass
    human_judgment: false
  - id: D2
    description: "State is in-memory only — a page reload resets every visit counter; no storage API anywhere under src/game"
    requirement: INTR-05
    verification:
      - kind: other
        ref: "! grep -rq 'localStorage' src/game (task-1 and task-2 verify, runs green)"
        status: pass
      - kind: unit
        ref: "src/game/systems/variants.test.ts#clears every counter on reset"
        status: pass
    human_judgment: false
  - id: D3
    description: "TV and floor lamp join the interaction loop as dialog-only objects: [E] WATCH / [E] TOGGLE badge, typewriter dialog, blinking ▼ end cue during the ~1.5s pause, auto slide-out with no keypress, no overlay ever"
    requirement: INTR-01
    verification:
      - kind: unit
        ref: "src/game/systems/dialog.test.ts#pauses for auto-dismiss when dialog-only (stateAfterTyping(false) === 'paused')"
        status: pass
      - kind: other
        ref: "grep 'WATCH'/'TOGGLE' src/game/data/interactables.ts + grep 'AUTO_DISMISS_MS' src/game/scenes/LivingRoomScene.ts (.verify/03-02-tvlamp.log)"
        status: pass
    human_judgment: true
    rationale: "The paused beat's feel (500/500 blink cadence, cue placement after the last wrapped line, 200ms slide-out, badge hidden throughout, no overlay) is a visual timing behavior no test asserts — the geometry, state split and constants are unit-pinned, the choreography needs eyes at UAT"

# Metrics
duration: 9min
completed: 2026-10-23
status: complete
---

# Phase 3 Plan 2: Visit Variants + Dialog-Only Objects Summary

**Deterministic per-object visit counters cycling dialog + overlay status-line variants (A→B→C→A), plus the TV and floor lamp joining the interaction loop as dialog-only objects with a blinking ▼ end cue and 1.5s auto-dismiss**

## Performance

- **Duration:** 9 min
- **Started:** 2026-10-23T08:55:15Z
- **Completed:** 2026-10-23T09:04:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Revisit behavior (SC#5) delivered on the tracer skeleton: `variants.ts` module-level counters, one atomic increment per E press, same N driving dialog variant and overlay status line (D-18/D-19)
- Living Room TV + floor lamp fully interactive as dialog-only objects — badge, typewriter, blinking end cue, auto-dismiss beat — with zero overlay dispatch (D-03/D-04)
- 7 new vitest cases (80 total, all green) pinning the deterministic cycle, counter independence, read-purity and reset semantics; full gate green (format, test, astro check, build)

## Task Commits

Each task was committed atomically:

1. **Task 1: Per-object visit counters drive dialog + status-line variants** - `c1953a5` (feat) — RED captured in `.verify/03-02-red.log`, then variants.ts + scene counter wiring
2. **Task 2: TV + floor lamp dialog-only flow** - `ed94a37` (feat) — registry entries, paused branch, blink cue, auto-dismiss

**Plan metadata:** committed at phase end (see git log)

## Files Created/Modified
- `src/game/systems/variants.ts` - per-object visit counters + pure variantFor modulo cycle (in-memory, reset on reload)
- `src/game/systems/variants.test.ts` - cycle wraparound, counter independence, read-purity, reset cases
- `src/game/data/interactables.ts` - TV + lamp entries (dialog-only, verbatim UI-SPEC copy, true top-left rects)
- `src/game/scenes/LivingRoomScene.ts` - incrementVisit on the E press, variant-driven dialog/status, paused branch with blink timer + AUTO_DISMISS_MS dismiss
- `src/game/objects/InteractionUI.ts` - blinking ▼ end cue anchored inline after the last wrapped line (getWrappedText + GetTextSize)

## Decisions Made
- **One increment per E press, one N for both surfaces**: `incrementVisit` runs only in `startInteraction`; dialog text and the overlay event's status line both derive from the returned N — skip/handoff/overlay states never touch the counter
- **True top-left rects for TV/lamp**: the plan's literal rect values are the world centres of centre-anchored layout solids; storing top-left (as the 03-01 computer-rect decision locked) reproduces the UI-SPEC badge anchors exactly
- **Single paused exit path**: `dismissPaused` removes the cue timer, hides the cue, slides out, re-enables the body; a SHUTDOWN hook sweeps the same timer for scene teardown (T-3-04)
- **Skip-hardening edge fix**: a skip during the dialog slide-in could leave the box partway up through the whole pause — the paused branch snaps the box to y=0 after killing the slide-in tween

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Spec clarification] TV/lamp rects stored as true top-left, not the plan's literal centre coords**
- **Found during:** Task 2 (registry entries)
- **Issue:** Plan specifies TV `{x:472,y:264}` and lamp `{x:520,y:328}` — these are the world CENTRES (solids are centre-anchored); as top-left they shift the badge anchors to (480,256)/(528,320) and shrink reach gaps by 8px, contradicting UI-SPEC's anchors (472,248)/(520,312)
- **Fix:** stored `{x:464,y:256}` / `{x:512,y:320}` + why-comment in interactables.ts — same correction class as the 03-01 computer-rect decision
- **Files modified:** src/game/data/interactables.ts
- **Verification:** UI-SPEC anchor math reproduced exactly by the badge formula (rect.x + w/2, rect.y − 8); registry is data-driven so no other caller assumed the centre form
- **Committed in:** ed94a37

**2. [Plan-authored overlap] Task 1's data + overlay halves already shipped in Plan 01**
- **Found during:** Task 1 (TDD)
- **Issue:** The plan's verify baseline ("interactables.ts does not exist") predates Plan 01, which already created the registry with the verbatim 3-line statusPool (incl. 'PROJECTS INDEX') and GameOverlay writing `statusLine` via textContent — no re-implementation possible or needed
- **Fix:** task-1 delta delivered what was genuinely missing: the variants module (real RED captured, `.verify/03-02-red.log`) + the scene's incrementVisit/variantFor wiring; dialog.ts/dialog.test.ts needed no extension (no new pure surface — the plan's own scoping)
- **Files modified:** src/game/systems/variants.ts, src/game/systems/variants.test.ts, src/game/scenes/LivingRoomScene.ts
- **Verification:** all three task-1 `<verify>` blocks green; dialog.test.ts and variants.test.ts both present in `.verify/03-02-variants.log`
- **Committed in:** c1953a5

**3. [Environment] Executor model substituted**
- **Found during:** executor spawn (environment gate)
- **Issue:** the agent's pinned model was gated out by the spawning environment
- **Fix:** sanctioned substitution to the available executor model; recorded per user directive — no code impact
- **Verification:** n/a (orchestrator-level)
- **Committed in:** n/a

---

**Total deviations:** 3 (1 spec clarification, 1 plan-authored overlap, 1 environment substitution)
**Impact on plan:** No scope change — all eight must-have truths observable; the rect clarification is a correctness fix against UI-SPEC geometry.

## Known Stubs
- `src/game/data/interactables.ts` — lamp entry's `TOGGLE` verb is placeholder wording (plan-acknowledged): no lamp toggling is built this phase; the verb anticipates Phase 5's audio/lighting. Intentional per 03-02-PLAN Task 2 + 03-CONTEXT Deferred items.

## Issues Encountered
- commitlint rejected the task-2 subject's uppercase start (`TV and lamp…`) — retried as `dialog-only auto-dismiss flow for tv and lamp objects`; files staged from the prior attempt committed cleanly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 03 gets the two remaining overlay hosts (bookshelf, phone) as pure registry data + slot reveals — the counter wiring, variant cycle and paused branch are done
- Plan 03's hardening has the timer pattern to sweep: cueTimer (this plan) + full shutdown cleanup noted in T-3-04

---
*Phase: 03-interaction*
*Completed: 2026-10-23*

## Self-Check: PASSED

All 5 source files + SUMMARY.md present; commits c1953a5 and ed94a37 are ancestors of HEAD; full gate green on final state (pnpm format/test/astro check/build, dist/index.html emitted); all plan `<verify>` blocks pass and are logged in .verify/.
