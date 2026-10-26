---
phase: 03-interaction
plan: 01
subsystem: ui
tags: [phaser4, astro, typescript, custom-events, crt-overlay, typewriter, container-queries]

# Dependency graph
requires:
  - phase: 02-navigation
    provides: rooms with layout solids, door glide system, zoom-4 follow camera, currentRoom state
provides:
  - interactables data registry (InteractableDef + INTERACTABLES, top-left rects, registry-order tie-break)
  - pure proximity system (nearestInRange: 32px two-axis gap rule, same-room check, nearest-by-Euclidean with declaration-order ties)
  - pure dialog system (CHAR_MS/AUTO_DISMISS_MS/SLIDE_IN_MS/SLIDE_OUT_MS constants, revealCount, stateAfterTyping)
  - InteractionUI zoom-1 second-camera layer (world-anchored [E] badge + bottom typewriter dialog box)
  - GameOverlay DOM CRT panel (build-time per-page slots, textContent-only bridge, 250ms ready key gate)
  - shared ContentList component (Phase 6 seam) + standalone /projects route
  - window CustomEvent bridge pair: darkfolio:overlay / darkfolio:overlay-close
  - scene interaction state machine (idle | prompt | typing | handoff | overlay) with movement + door locks
affects: [03-interaction, 04-polish, 06-content]

# Actuals (#2632) — pairs with the plan's `estimate` to calibrate future estimates.
actuals:
  tokens: 7068
  tasks: 2
  commits: 3

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "data-registry + generic loop: interactables.ts entries drive nearestInRange; new objects are data, not classes"
    - "pure-module pair: constants + pure functions, scene owns all time (doorGlide.ts precedent)"
    - "Phaser<->DOM bridge: window CustomEvent pair, scene mirrors CSS slide durations via delayedCall"
    - "zoom-1 UI camera: second transparent camera renders only the UI container, constructed last"
    - "DOM overlay: cqw-scaled fonts inside container-type:size game frame, build-time slots revealed on open"

key-files:
  created:
    - src/game/data/interactables.ts
    - src/game/systems/proximity.ts
    - src/game/systems/proximity.test.ts
    - src/game/systems/dialog.ts
    - src/game/systems/dialog.test.ts
    - src/game/objects/InteractionUI.ts
    - src/components/GameOverlay.astro
    - src/components/ContentList.astro
    - src/pages/projects.astro
  modified:
    - src/game/scenes/LivingRoomScene.ts
    - src/components/GameCanvas.astro

key-decisions:
  - "Interactable rects stored top-left: computer {x:510,y:23,w:20,h:14} — the plan's {520,30} is the world CENTRE of centre-anchored OFFICE_LAYOUT.solids[1]; only top-left yields the UI-SPEC badge anchor (520,15) and the 15px desk gap"
  - "Bridge payloads render textContent-only (T-3-01); close press stopPropagation'd on the panel so the scene never reads it as re-open"
  - "GameOverlay ignores keys until a 250ms ready timeout after each open — a double-tap would close the just-opened panel and deadlock the scene mode gate"
  - "Scene dispatches overlay event from the slide-out tween onComplete, then delayedCall(SLIDE_IN_MS) flips handoff->overlay so D-29 input gating spans the CSS slide"
  - "Close re-enables the player body via a once-listener on darkfolio:overlay-close; no Player.ts lock flag (scene-side gating is the whole mechanism)"

patterns-established:
  - "Interaction registry: add the remaining four objects as INTERACTABLES entries plus their content slots; no architecture change"
  - "Overlay slot reveal: GameOverlay pre-renders one hidden [data-page] slot per page at build time; open event reveals by key"
  - "Typewriter skip = finish: E/Esc during typing set full reveal and run finishTyping immediately, same math as completion"

requirements-completed: [INTR-01, INTR-02, INTR-03, INTR-04]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Walking near the Computer in the Office shows the floating [E] BOOT UP badge anchored above the desk (zoom-1 UI camera over the zoom-4 world)"
    requirement: INTR-01
    verification:
      - kind: unit
        ref: "src/game/systems/proximity.test.ts#finds the computer at the closest standing spot at the desk / counts an exact 32px gap as in range / rejects a 33px gap / rejects an office object from another room"
        status: pass
      - kind: unit
        ref: "src/game/systems/proximity.test.ts#pins the computer entry to the office desk"
        status: pass
    human_judgment: true
    rationale: "Badge pixel placement and zoom-1-over-zoom-4 layering on the live canvas have no automated assertion — geometry and registry are unit-proven, the rendering needs eyes at UAT"
  - id: D2
    description: "E slides the Darkwood-paper dialog up and types one [COMPUTER] line at 25ms/char; E or Esc skips to full text"
    requirement: INTR-02
    verification:
      - kind: unit
        ref: "src/game/systems/dialog.test.ts#pins the typewriter and slide timings / reveals one character per CHAR_MS tick / clamps to the text length once typing is due"
        status: pass
      - kind: other
        ref: "grep 'JustDown' + \"mode === 'idle'\" src/game/scenes/LivingRoomScene.ts (task-2 verify, .verify/03-01-locks.log)"
        status: pass
    human_judgment: true
    rationale: "Typewriter cadence and tween feel on the canvas are not machine-assertable; constants, reveal math and skip edges are unit-pinned"
  - id: D3
    description: "Typing completion slides the dialog out and the CRT overlay up automatically with the three stub Projects entries already in the DOM; the standalone /projects route renders the same ContentList"
    requirement: INTR-03
    verification:
      - kind: integration
        ref: "pnpm build emits dist/index.html + dist/projects/index.html (task-1 verify, .verify/03-01-tracer.log)"
        status: pass
      - kind: integration
        ref: "dev-server smoke: /darkfolio/ serves game-root, /darkfolio/projects serves 'back to the house' (.verify/dev.log)"
        status: pass
      - kind: unit
        ref: "src/game/systems/dialog.test.ts#hands off to the overlay when the object hosts a page"
        status: pass
    human_judgment: true
    rationale: "The auto-handoff choreography (dialog slide-out -> overlay slide-up, one keypress) is a visual timing beat verified by eye at UAT"
  - id: D4
    description: "E or Esc closes the overlay with a slide-down and returns control; movement and door triggers stay locked through every dialog/overlay state"
    requirement: INTR-04
    verification:
      - kind: other
        ref: "grep 'darkfolio:overlay' LivingRoomScene.ts + GameOverlay.astro (task-1 verify block 4)"
        status: pass
      - kind: other
        ref: "code inspection: non-idle/prompt modes skip handleInput + door check, velocity zeroed at typing transition (LivingRoomScene.update)"
        status: pass
    human_judgment: true
    rationale: "Keyboard round-trip through the browser (panel focus, repeat neutralization, close -> walk again) requires a human at the keyboard"

# Metrics
duration: 52min
completed: 2026-10-23
status: complete
---

# Phase 3 Plan 1: Tracer Interaction Slice Summary

**Computer interaction path end-to-end: [E] BOOT UP badge on a zoom-1 UI camera, 25ms/char typewriter dialog that auto-handoffs into a DOM CRT overlay showing the Projects page, closed by E/Esc with input locked throughout**

## Performance

- **Duration:** 52 min
- **Started:** 2026-10-23T07:53:56Z
- **Completed:** 2026-10-23T08:46:00Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Full interaction stack proven on one path: pure geometry module → scene state machine → zoom-1 canvas UI → Phaser↔DOM CustomEvent bridge → Astro route
- 15 new vitest cases (73 total, all green) pinning the UI-SPEC reach rule, registry geometry, typewriter constants and flow split
- The phase's hardest no-analog (zoom-1 UI camera over the zoom-4 world) works with no double-render artifacts — layer split decided at construction time
- Full gate green: format, test, astro check, build; dev-server smoke serves both routes; dist/projects emitted

## Task Commits

Each task was committed atomically:

1. **Task 1 (part 1): pure systems TDD** - `1592e3f` (feat) — RED captured in `.verify/03-01-red.log`, then interactables/proximity/dialog + tests
2. **Task 1 (part 2): tracer slice** - `1b78568` (feat) — InteractionUI, GameOverlay, ContentList, projects route, GameCanvas frame, LivingRoomScene wiring
3. **Task 2: input locks + reveal stability** - `4b9a855` (feat) — setReveal same-value guard, positive-mode-form input gate

**Plan metadata:** committed at phase end (see git log)

## Files Created/Modified
- `src/game/data/interactables.ts` - InteractableDef type + computer registry entry (top-left rect, dialog/status pools)
- `src/game/systems/proximity.ts` - nearestInRange: two-axis ≤32px gap, same-room, nearest-wins, declaration-order ties
- `src/game/systems/proximity.test.ts` - desk case, exact-32 boundary, room rejection, nearest, ties, registry pin
- `src/game/systems/dialog.ts` - CHAR_MS/AUTO_DISMISS_MS/SLIDE_IN_MS/SLIDE_OUT_MS, revealCount, stateAfterTyping
- `src/game/systems/dialog.test.ts` - constant pins, reveal progression/clamp, host/dialog-only flow split
- `src/game/objects/InteractionUI.ts` - zoom-1 UI camera layer: world-tracked badge, bottom typewriter dialog, DIALOG_HIDDEN_Y slide language
- `src/components/GameOverlay.astro` - CRT panel: green wash, scanlines, cqw fonts, build-time slots, ready-gated keydown, textContent-only bridge
- `src/components/ContentList.astro` - shared entry list with documented empty state (Phase 6 seam)
- `src/pages/projects.astro` - standalone dark route: back link, h1, shared ContentList
- `src/components/GameCanvas.astro` - always-4:3 container-type:size frame contract, overlay mount
- `src/game/scenes/LivingRoomScene.ts` - interaction state machine, JustDown edges, movement/door locks, handoff + close wiring

## Decisions Made
- **Top-left interactable rects** (plan's `{520,30}` is the centre of centre-anchored solids): only top-left reproduces the UI-SPEC badge anchor (520,15) and the documented ≈15px desk gap; pinned by registry test
- **Scene owns all timing**: DOM panel slides itself via CSS; scene mirrors with delayedCall(SLIDE_IN_MS) so the mode gate spans the slide (D-29) without transitionend coupling
- **Ready-gated panel keys**: 250ms post-open timeout + e.repeat check + stopPropagation — kills the double-tap-close deadlock and the close-press-reopen race at the DOM boundary
- **No Player.ts lock flag**: body.enable=false + mode gate in the scene is the entire movement lock (PATTERNS: scene-side gating)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Spec clarification] Interactable rect stored as true top-left, not the plan's literal centre**
- **Found during:** Task 1 (registry implementation)
- **Issue:** Plan step 1 computes the computer rect as `{ x: 520, y: 30, w: 20, h: 14 }` — but `rooms.ts` documents layout solids as centre-anchored, so (520,30) is the rect CENTRE; using it as top-left puts the badge anchor at (530,22) and shrinks the desk gap to 8px, contradicting UI-SPEC (anchor (520,15), gap ≈15px)
- **Fix:** stored `{ x: 510, y: 23, w: 20, h: 14 }` (true top-left) + why-comment in interactables.ts
- **Files modified:** src/game/data/interactables.ts
- **Verification:** registry pin + desk/boundary cases in proximity.test.ts; UI-SPEC anchor math (520,15) reproduced exactly
- **Committed in:** 1592e3f

**2. [Plan-authored overlap] Task 2's behavior tests and E/Esc skip shipped inside Task 1**
- **Found during:** Task 2 (TDD)
- **Issue:** Task 1 step 3's action text already specifies skip-to-end math, stateAfterTyping both branches and constant pins as task-1 tests — task 2's `<behavior>` block repeats them; E/Esc-during-typing was also required by task 1 step 9. A fabricated task-2 RED was impossible (plan-spec'd surface already implemented and pinned)
- **Fix:** all dialog.test.ts cases written in task 1's RED phase (genuine failure captured); task 2 delivered its real delta — setReveal same-value stability guard + the positive-mode-form input gate the verify grep pins. `stateAfterTyping(false)`/'paused' is exported and test-pinned but wired by plan 02 (paused-state branch), per the plan's own scoping
- **Files modified:** src/game/systems/dialog.test.ts, src/game/objects/InteractionUI.ts, src/game/scenes/LivingRoomScene.ts
- **Verification:** .verify/03-01-red.log (RED), .verify/03-01-locks.log (task-2 verify green), full gate green
- **Committed in:** 1592e3f, 4b9a855

**3. [Environment] Executor model substituted**
- **Found during:** executor spawn (authentication/environment gate)
- **Issue:** init context declares executor model `anthropic/claude-sonnet-5`; the spawning environment gated that model out
- **Fix:** sanctioned substitution to the available executor model; recorded per user directive — no code impact
- **Verification:** n/a (orchestrator-level)
- **Committed in:** n/a

---

**Total deviations:** 3 (1 spec clarification, 1 plan-authored overlap, 1 environment substitution)
**Impact on plan:** No scope change — all four requirements observable end-to-end; the rect clarification is a correctness fix against UI-SPEC geometry.

## Issues Encountered
- Shell `&` precedence backgrounded part of the tracer re-verify chain; re-ran the build/dist check explicitly and killed the leftover dev server (port 4321 confirmed free). No code impact.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 02 (variants + remaining objects + paused state) extends registry data + one paused branch; `stateAfterTyping` and the dialog/status pools are already in place
- ContentList is the Phase 6 seam: swapping stub arrays for content collections touches no wiring
- Overlay slot map supports new pages as one hidden div each; title/status switch per open already generic

---
*Phase: 03-interaction*
*Completed: 2026-10-23*

## Self-Check: PASSED

All 11 created/modified source files + SUMMARY.md present; commits 1592e3f, 1b78568, 4b9a855 are ancestors of HEAD; dist/index.html + dist/projects/index.html emitted by the final build.
