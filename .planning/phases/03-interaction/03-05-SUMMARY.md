---
phase: 03-interaction
plan: 05
subsystem: ui
tags: [phaser4, astro, css, focus-management, accessibility, overlay]

requires:
  - phase: 03-interaction (plan 03 + 04)
    provides: overlay slot machinery, shared ContentList, scene state machine, SHUTDOWN disposal, read-hold host handoff
provides:
  - .page border-box so the document equals the viewport and the page scrollbar disappears at its source
  - overlay .content as the keyboard focus target with tabindex="0" so Arrow/Page/Home/End scroll the list natively
  - document-level scroll-key guard that stops propagation before Phaser's window capture can cancel the default
  - focus release on every hide path (closePanel + scene SHUTDOWN via MutationObserver) so focus never sits inside an aria-hidden panel
affects: [03-interaction (phase close-out), 06-content]

actuals:
  tokens: 1505
  tasks: 2
  commits: 2
  plan_head_before: f8ebba08d22c62dcdbc02e8a699b74e26e0b137d
  plan_head_after: 4c8c98bec2acd4398e17335a3c21d57b7d27259a

tech-stack:
  added: []
  patterns:
    - "fix document overflow at the source: border-box the page box instead of clipping with overflow:hidden"
    - "keyboard scroll ownership via native focus: a focused overflow-y:auto element is the browser's scroll target"
    - "stop propagation of scroll keys on document before they reach Phaser's window listener, preserving the browser's default scroll"
    - "focus safety on hide: blur the focused scroller before aria-hidden, and watch aria-hidden for the scene's SHUTDOWN sweep"

key-files:
  created: []
  modified:
    - src/pages/index.astro
    - src/components/GameOverlay.astro
    - .planning/phases/03-interaction/03-UI-SPEC.md

key-decisions:
  - "box-sizing: border-box on .page is the root fix; no html/body overflow lock that would mask the 32px sizing defect"
  - "Scroll keys stop propagation on document before Phaser's window listener can preventDefault them; the browser's native scroll of focused .content is the mechanism"
  - "MutationObserver on #game-overlay aria-hidden releases focus for the scene's SHUTDOWN hide path without editing LivingRoomScene"
  - "User pre-approved the scoped UI-SPEC Focus-row edit before writing"

patterns-established:
  - "Document-level scroll guard lives on the panel's own listener, not in the scene's capture set, so no open/close/shutdown restore state is needed"
  - "Native scroll container + stopPropagation replaces wheel handlers and scroll arithmetic"

requirements-completed: [INTR-03, INTR-04]

coverage:
  - id: D1
    description: "Document scrollbar removed at its source: .page is border-box and no document-level overflow lock was added"
    requirement: INTR-03
    verification:
      - kind: automated_ui
        ref: "src/pages/index.astro .page rule contains box-sizing: border-box; only one 'overflow' occurrence in the file"
        status: pass
    human_judgment: false
  - id: D2
    description: "Overlay .content is tabindex=0 and becomes the focus target on open and on frame refocus"
    requirement: INTR-03
    verification:
      - kind: automated_ui
        ref: "src/components/GameOverlay.astro: class='content' has tabindex='0'; content?.focus({ preventScroll: true }) used on open and pointerdown"
        status: pass
      - kind: integration
        ref: "pnpm build emits dist/index.html containing game-overlay and tabindex='0'"
        status: pass
    human_judgment: false
  - id: D3
    description: "Arrow/Page/Home/End stop propagation before the game's window capture while the panel is open"
    requirement: INTR-03
    verification:
      - kind: automated_ui
        ref: "src/components/GameOverlay.astro: SCROLL_KEYS.has(event.key) branch precedes the event.repeat/ready gate"
        status: pass
    human_judgment: false
  - id: D4
    description: "E/Esc close parity is untouched by the focus changes: the same stopPropagation + closePanel branch lives after the scroll guard"
    requirement: INTR-04
    verification:
      - kind: automated_ui
        ref: "src/components/GameOverlay.astro: E/Esc branch still checks event.repeat || !ready and calls event.stopPropagation() + closePanel()"
        status: pass
    human_judgment: true
    rationale: "The branch structure is machine-checked; the 'exactly once per press' feel needs the UAT re-run of test 4"
  - id: D5
    description: "Every hide path releases focus from inside the panel before it becomes aria-hidden"
    requirement: INTR-04
    verification:
      - kind: automated_ui
        ref: "src/components/GameOverlay.astro: content?.blur() in closePanel(); MutationObserver blurs activeElement when aria-hidden becomes true and panel contains it"
        status: pass
    human_judgment: true
    rationale: "Focus-release code is machine-checked; a real shutdown mid-overlay can only be exercised live"
  - id: D6
    description: "UI-SPEC Focus row reconciled: content region is the focus target, panel keeps tabindex=-1, both outline:none"
    requirement: INTR-03
    verification:
      - kind: other
        ref: ".planning/phases/03-interaction/03-UI-SPEC.md Focus row contains tabindex='0' for the content region"
        status: pass
    human_judgment: false

duration: 10min
completed: 2026-10-26
status: complete
---

# Phase 3 Plan 5: Overlay Scroll + Document Overflow Gap Closure Summary

**Document scrollbar removed at its source and overlay content region owns keyboard scrolling while E/Esc close parity stays intact**

## Performance

- **Duration:** 10 min
- **Started:** 2026-10-26T07:43:36Z
- **Completed:** 2026-10-26T07:53:56Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Closed G-03-6: .page is now border-box so the document equals the viewport — no page scrollbar, no residual 32px scroll
- Overlay .content is now tabindex="0" and receives focus on open and on frame refocus, making Arrow/Page/Home/End scroll the skills list natively
- Document keydown listener stops propagation for the eight scroll keys before Phaser's window capture can cancel them
- Focus is released before the panel hides on every path: closePanel() blurs .content, and a MutationObserver catches the scene's SHUTDOWN aria-hidden write
- UI-SPEC Focus row reconciled to describe the content region as the focus target

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove the 32px document overflow at its source (.page border box)** - `471a0f4` (fix)
2. **Task 2: Give the overlay content list keyboard scroll ownership** - `4c8c98b` (fix)

**Plan metadata:** committed at phase end (see git log)

## Files Created/Modified
- `src/pages/index.astro` - added `box-sizing: border-box` to `.page` so the border box equals the viewport
- `src/components/GameOverlay.astro` - `.content` is focusable and the focus target; scroll-key guard stops propagation before game capture; focus released on hide; MutationObserver for SHUTDOWN sweep
- `.planning/phases/03-interaction/03-UI-SPEC.md` - Focus row reconciled with the content region as focus target

## Decisions Made
- **Root fix, not clipping:** `box-sizing: border-box` on `.page` removes the 32px overflow at its source; `html`/`body` keep only `margin: 0` so a future layout change cannot be masked by an overflow lock
- **Panel listener owns scroll policy:** scroll keys are stopped on `document` before they reach Phaser's `window` listener; no toggling of the scene's global capture set is needed
- **Native scroll is the mechanism:** the guard calls `stopPropagation()` only — `preventDefault()` would cancel the browser's scroll of the focused `.content`
- **Focus safety without scene edits:** a `MutationObserver` on `#game-overlay` covers the SHUTDOWN hide path that writes `aria-hidden="true"` without calling `closePanel()`
- **User approval recorded:** the scoped UI-SPEC Focus-row edit was surfaced and approved before writing

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 3 implementation is complete (5/5 plans); next is the STATE.md-mandated Phase 1/2 verification refresh sweep, then `/gsd-verify-work 03`
- Phase 6 inherits the same clean ContentList seam; no interaction wiring changed

---
*Phase: 03-interaction*
*Completed: 2026-10-26*

## Self-Check: PASSED

- `src/pages/index.astro` modified and committed
- `src/components/GameOverlay.astro` modified and committed
- `.planning/phases/03-interaction/03-UI-SPEC.md` modified and committed
- Commits `471a0f4` and `4c8c98b` are ancestors of HEAD
- Full gate green (format/test/astro check/build) on final state
- `dist/index.html` emits `game-overlay` and `tabindex="0"`
