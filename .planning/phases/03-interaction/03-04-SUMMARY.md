---
phase: 03-interaction
plan: 04
subsystem: ui
tags: [phaser4, astro, typescript, dialog, typewriter, read-hold, overlay-handoff]

requires:
  - phase: 03-interaction (plan 02 + 03)
    provides: dialog system constants + stateAfterTyping('paused'), InteractionUI zoom-1 layer, host overlay dispatch, scene state machine, SHUTDOWN disposal
provides:
  - READ_HOLD_MS timing constant mirroring AUTO_DISMISS_MS
  - host handoff delayed by 1500ms so the completed line settles before slide-out
  - revealCount clamps negative elapsed time to 0
  - typewriter clock starts only after the dialog box finishes sliding in
  - UI-SPEC host-flow row edits reconciling the contract with the code
affects: [03-interaction (phase close-out), 06-content]

actuals:
  tokens: 1471
  tasks: 2
  commits: 2
  plan_head_before: dbd7e3d86b22a2a8ff3fe4e8deb580ce955f7111
  plan_head_after: c075264270cbce45e17fd6c41fc279a5d42cbf05

tech-stack:
  added: []
  patterns:
    - "read-hold as a scene delayedCall inside the existing 'handoff' mode — no new mode, no new key branch, inherits D-27/D-28/D-29 gating"
    - "deferred reveal origin: startInteraction sets typedElapsed = -SLIDE_IN_MS so the box lands before revealCount climbs above 0"
    - "handoffToOverlay guard: if (mode !== 'handoff') return prevents a late timer from double-dispatching the overlay event"

key-files:
  created: []
  modified:
    - src/game/systems/dialog.ts
    - src/game/systems/dialog.test.ts
    - src/game/scenes/LivingRoomScene.ts
    - .planning/phases/03-interaction/03-UI-SPEC.md

key-decisions:
  - "READ_HOLD_MS = 1500ms, mirroring AUTO_DISMISS_MS so host and dialog-only flows share the same settled beat"
  - "The hold lives inside the existing 'handoff' mode so D-27/D-28/D-29 input locks are inherited without re-implementation"
  - "A skip still gets the full hold (D-02 precedent: normal flow continues)"
  - "No end cue on the host hold — the ▼ cue stays reserved for the dialog-only auto-dismiss pause (D-04)"
  - "Deferred reveal start is shared via startInteraction(), so TV/lamp also stop burning characters during the slide-in"
  - "User pre-approved the two scoped 03-UI-SPEC.md row edits (handoff table row + Host flow bullet) before writing"

patterns-established:
  - "Timed hold inside an existing mode: add a constant + one delayedCall, extract the continuation into a guarded private method"
  - "Reveal origin shift: negative typedElapsed clamps to zero reveal until the UI element has finished its entrance"

requirements-completed: [INTR-02, INTR-03]

coverage:
  - id: D1
    description: "Host dialog holds READ_HOLD_MS (1500ms) after typing finishes before sliding out and dispatching the overlay"
    requirement: INTR-02
    verification:
      - kind: unit
        ref: "src/game/systems/dialog.test.ts#pins READ_HOLD_MS at 1500 alongside the other timing constants"
        status: pass
      - kind: other
        ref: "grep READ_HOLD_MS in src/game/systems/dialog.ts + src/game/scenes/LivingRoomScene.ts, handoffToOverlay present (.verify/03-04-hold.log)"
        status: pass
    human_judgment: true
    rationale: "The scheduling is machine-pinned; whether 1500ms feels readable on a live screen is the UAT re-run of test 3"
  - id: D2
    description: "The typewriter clock starts only after the dialog box finishes its 250ms slide-in, so no characters reveal while the box is still rising"
    requirement: INTR-02
    verification:
      - kind: unit
        ref: "src/game/systems/dialog.test.ts#revealCount(-1) and revealCount(-SLIDE_IN_MS) both return 0"
        status: pass
      - kind: other
        ref: "grep 'typedElapsed = -SLIDE_IN_MS' in src/game/scenes/LivingRoomScene.ts + 'Math.max(0' in src/game/systems/dialog.ts (.verify/03-04-reveal.log)"
        status: pass
    human_judgment: true
    rationale: "The clamp and origin shift are machine-proven; the perceived first-char landing needs eyes at UAT"
  - id: D3
    description: "03-UI-SPEC.md host-flow contract matches the shipped behavior: handoff row names the 1500ms read-hold and the Host flow bullet names the deferred reveal start"
    requirement: INTR-02
    verification:
      - kind: other
        ref: "grep '1500ms read-hold' and 'typewriter clock starts when the dialog box finishes sliding in' in .planning/phases/03-interaction/03-UI-SPEC.md"
        status: pass
    human_judgment: false

# Metrics
duration: 6 min
completed: 2026-10-26
status: complete
---

# Phase 3 Plan 4: Dialog Read-Hold + Deferred Reveal Summary

**Host dialog read-hold and deferred typewriter start so the completed line is readable before the overlay rises**

## Performance

- **Duration:** 6 min
- **Started:** 2026-10-26T07:25:03Z
- **Completed:** 2026-10-26T07:31:03Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Closed G-03-3: host objects now rest for 1500ms after typing finishes before the dialog slides out and the overlay rises
- Stopped the typewriter from burning ~10 characters during the 250ms dialog slide-in by clamping revealCount and shifting the clock origin to -SLIDE_IN_MS
- Reconciled the approved UI-SPEC host-flow wording with the code (handoff table row + Host flow bullet)
- Full pre-commit gate green after each task: format, test, astro check, build, dist/index.html emitted

## Task Commits

Each task was committed atomically:

1. **Task 1: Host read-hold — schedule the handoff after READ_HOLD_MS** - `96de602` (fix)
2. **Task 2: Reveal clock starts when the dialog box lands + reconcile UI-SPEC** - `c075264` (fix)

**Plan metadata:** committed with STATE.md + ROADMAP.md (docs)

## Files Created/Modified
- `src/game/systems/dialog.ts` - added READ_HOLD_MS constant and clamped revealCount low bound to 0
- `src/game/systems/dialog.test.ts` - pinned READ_HOLD_MS and added negative-elapsed reveal cases
- `src/game/scenes/LivingRoomScene.ts` - delayed host handoff via handoffToOverlay, deferred typewriter start to -SLIDE_IN_MS
- `.planning/phases/03-interaction/03-UI-SPEC.md` - handoff row + Host flow bullet now describe the read-hold and deferred reveal start

## Decisions Made
- **READ_HOLD_MS mirrors AUTO_DISMISS_MS (1500ms)** — gives host and dialog-only flows the same settled beat, avoiding a second timing rule
- **Hold lives inside existing `'handoff'` mode** — no new mode, timer class or key branch; D-27/D-28/D-29 gating is inherited
- **Skip still gets the hold** — D-02 says a skip jumps to full text and normal flow continues; dialog-only already waits its full pause
- **No ▼ cue on host hold** — the cue remains reserved for the dialog-only auto-dismiss pause per D-04
- **Deferred reveal start is shared** — `startInteraction()` is the single entry for all interactables, so TV/lamp also benefit without a host-only branch
- **User approval recorded** — the two scoped 03-UI-SPEC.md row edits were surfaced to the user before writing and approved; the approval is recorded here

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 3 interaction implementation is complete; next is the STATE.md-mandated Phase 1/2 verification refresh sweep, then `/gsd-verify-work 03`
- Phase 6 gets the same clean ContentList seam; no interaction wiring changed

---
*Phase: 03-interaction*
*Completed: 2026-10-26*

## Self-Check: PASSED

- `src/game/systems/dialog.ts` modified and committed
- `src/game/systems/dialog.test.ts` modified and committed
- `src/game/scenes/LivingRoomScene.ts` modified and committed
- `.planning/phases/03-interaction/03-UI-SPEC.md` modified and committed
- Commits `96de602` and `c075264` are ancestors of HEAD
- Full gate green (format/test/astro check/build) on final state
