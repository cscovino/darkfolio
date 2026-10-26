---
phase: 03-interaction
plan: 03
subsystem: ui
tags: [phaser4, astro, registry, crt-overlay, content-list, empty-error-states, shutdown-cleanup]

# Dependency graph
requires:
  - phase: 03-interaction (plan 01 + 02)
    provides: interactables registry, generic interaction loop, GameOverlay slot-reveal machinery, shared ContentList + /projects route, scene state machine, paused auto-dismiss branch
provides:
  - bookshelf + phone registry hosts (BROWSE / ANSWER, overlay routes /skills and /contact, verbatim dialog + status pools)
  - standalone /skills and /contact stub routes rendering the shared ContentList (Phase 6 seam complete across all three pages)
  - UI-SPEC empty/error states: ContentList NOTHING HERE YET + overlay SIGNAL LOST on a missing data-page slot
  - scene SHUTDOWN disposal: timers/tweens swept, window close listener removed, mode/gliding reset, body re-enabled (WR-02 closed)
  - frame-pointerdown panel refocus so E/Esc close from anywhere in the frame (D-30 parity)
affects: [03-interaction (phase close-out), 04-polish, 05-audio, 06-content]

# Actuals (#2632) — pairs with the plan's `estimate` to calibrate future estimates.
actuals:
  tokens: 6317
  tasks: 2
  commits: 2
  plan_head_before: 72c08f45f48ef77735108fcdd35da05ebea70450
  plan_head_after: 986d60851b4971a30b5681fadd90d61112e9c68e

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "overlay trio as registry data: a host is one INTERACTABLES entry (rect + verb + pools + overlay route); the generic loop routes it — no new code per object"
    - "build-time ContentList instances per slot: three pages, one component, zero fetch (UI-SPEC no-in-flight-state truth)"
    - "missing-slot error path: panel opens with a pre-rendered SIGNAL LOST block instead of an early return (early return = scene stuck in overlay mode)"
    - "scene shutdown disposal: one SHUTDOWN handler sweeps interaction timers/tweens/listener and resets transient scene fields (fields persist across restart — constructors do not rerun)"

key-files:
  created:
    - src/pages/skills.astro
    - src/pages/contact.astro
  modified:
    - src/game/data/interactables.ts
    - src/components/ContentList.astro
    - src/components/GameOverlay.astro
    - src/game/scenes/LivingRoomScene.ts

key-decisions:
  - "Bookshelf/phone rects stored true top-left {336,40} / {92,267} — the plan's literals {344,72} / {96,270} are the world CENTRES of centre-anchored solids (same correction class as computer/TV/lamp); top-left reproduces UI-SPEC badge anchors (344,32) / (96,259) exactly"
  - "A missing data-page slot no longer early-returns: the panel opens with SIGNAL LOST rendered — the old `if (!slot) return` left the scene in overlay mode with no panel, so E/Esc could never close (INTR-03 error contract)"
  - "Frame-pointerdown refocuses the open panel — clicking the live room strip blurs the panel (focus falls to body), which killed the panel-keydown close path; one listener keeps 'exactly once per press' structural"
  - "Shutdown removes the window-level darkfolio:overlay-close once-listener — after restart the zombie would fire into a destroyed scene (player.body undefined); guarded body re-enable because DisplayList destroys the player before the scene's SHUTDOWN handler runs"
  - "Stub entry arrays (skills 10, contacts 3) live in both the page and the overlay slot — same precedent as projects (Plan 01); the prohibition's verified form holds (both surfaces render ContentList, no copied markup), Phase 6 replaces both arrays with one content-collection source"

patterns-established:
  - "New overlay host = registry entry data (rect/verb/pools/overlay) + one hidden [data-page] slot in GameOverlay; the loop, title switch and status line are already generic"
  - "Standalone route = back link + h1 + shared ContentList with a frontmatter stub array; contact rows add per-entry href + note prop to the same component"

requirements-completed: [INTR-03, INTR-04]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Bookshelf opens Skills, Phone opens Contact through the same machinery the Computer proved — registry entries carry /skills and /contact, both routes build and serve with page chrome (INTR-03)"
    requirement: INTR-03
    verification:
      - kind: integration
        ref: "registry greps (bookshelf/phone ids + all three overlay routes) in .verify/03-03-plan-verify.log"
        status: pass
      - kind: integration
        ref: "pnpm build emits dist/index.html + dist/skills/index.html + dist/contact/index.html (.verify/03-03-gate.log)"
        status: pass
      - kind: integration
        ref: "dev-server smoke: /darkfolio/ serves game-root, /darkfolio/skills and /darkfolio/contact serve 'back to the house' (.verify/dev.log)"
        status: pass
    human_judgment: true
    rationale: "Walking to each host and opening its overlay on the live canvas is a keyboard/visual round-trip no test asserts — registry, routes and served chrome are machine-proven; the walk-over-and-press-E path needs eyes at UAT"
  - id: D2
    description: "The 10-entry skills list scrolls internally inside the 142px content region (wheel + arrow keys via panel focus) while title/status/footer never move inside the 208px panel budget (D-15, D-17)"
    requirement: INTR-03
    verification:
      - kind: other
        ref: "code inspection: .content { flex: 1; overflow-y: auto } fills exactly 208−4−24−20−18 = 142px; 10 entries (~226px) exceed it, forcing scroll; scrollTop reset wired on every open (GameOverlay.astro)"
        status: pass
      - kind: integration
        ref: "astro check 0 errors + build green (.verify/03-03-gate.log)"
        status: pass
    human_judgment: true
    rationale: "Wheel/arrow scrolling inside the panel and the never-moving chrome are layout behaviors no test asserts — the CSS math is inspected, the feel needs eyes at UAT"
  - id: D3
    description: "Empty list renders NOTHING HERE YET heading + body; a content region missing its data-page slot renders SIGNAL LOST heading + body and E/Esc still close (UI-SPEC empty/error)"
    requirement: INTR-03
    verification:
      - kind: other
        ref: "verbatim copy greps (NOTHING HERE YET, SIGNAL LOST + body) in .verify/03-03-plan-verify.log"
        status: pass
      - kind: other
        ref: "GameOverlay open handler: early return removed, errorEl.hidden = slot !== null, panel opens + focuses either way (commit 1cb3801)"
        status: pass
    human_judgment: true
    rationale: "The conditional display logic and copy are machine-checked; whether the two states render correctly inside the live panel is visual"
  - id: D4
    description: "Scene shutdown disposes interaction state (WR-02): timers/tweens stopped, close listener removed, mode + gliding reset, player body re-enabled — a mid-flow teardown leaves no disabled body or stuck mode"
    requirement: INTR-04
    verification:
      - kind: other
        ref: "grep 'shutdown' + body.enable = true count 4 (≥2) in .verify/03-03-plan-verify.log"
        status: pass
      - kind: other
        ref: "code inspection: SHUTDOWN handler sweeps cueTimer + removeAllEvents + killTweensOf(dialogBox/player), removes window listener, resets mode/gliding/activeObject, guarded body re-enable (LivingRoomScene.ts:106-126)"
        status: pass
    human_judgment: true
    rationale: "An actual scene restart mid-dialog/mid-overlay can only be exercised on a running game — handler structure is machine-checked, teardown behavior needs a live restart at UAT"
  - id: D5
    description: "D-27/D-28/D-29/D-30 input contracts locked: mode gates keep E from starting outside prompt, swallow E/Esc during handoff/overlay, skip door triggers outside idle/prompt; close fires exactly once per press with E/Esc parity"
    requirement: INTR-04
    verification:
      - kind: other
        ref: ".verify/03-03-locks.log — JustDown edges, idle/prompt gate line, startInteraction only after mode='prompt', single close dispatch, event.repeat || !ready gate, once:true close listener"
        status: pass
      - kind: other
        ref: "full gate green after both task commits (.verify/03-03-gate.log, .verify/03-03-gate2.log)"
        status: pass
    human_judgment: true
    rationale: "Keyboard round-trip through the browser (double-tap neutralization, close parity from canvas and panel, input restored) requires a human at the keyboard"
  - id: D6
    description: "Three placeholder routes exist with realistic stub content (3 projects / 10 skills / 3 contact links + flavour line) and page chrome — Phase 6 swaps the data source, not the layout (D-11, D-13)"
    requirement: INTR-03
    verification:
      - kind: integration
        ref: "dist/index.html + dist/skills/index.html + dist/contact/index.html all emitted (.verify/03-03-gate.log)"
        status: pass
      - kind: integration
        ref: "dev smoke: both new routes serve 'back to the house'; dist/skills contains the stub entries, dist/contact carries rel=noopener links (.verify/dev.log + DIST_CONTENT_OK)"
        status: pass
      - kind: other
        ref: "entries verbatim against UI-SPEC §Stub page content — greps in .verify/03-03-plan-verify.log (flavour line, ContentList on all three pages + overlay)"
        status: pass
    human_judgment: false

# Metrics
duration: 19min
completed: 2026-10-23
status: complete
---

# Phase 3 Plan 3: Overlay Trio + Hardening Summary

**Bookshelf→Skills and Phone→Contact registry hosts wired through the proven generic loop, /skills + /contact stub routes rendering the shared ContentList, UI-SPEC empty/SIGNAL-LOST states landed, and scene shutdown disposal closing WR-02 with the D-27/D-28/D-29/D-30 input contracts regression-locked**

## Performance

- **Duration:** 19 min
- **Started:** 2026-10-23T09:09:32Z
- **Completed:** 2026-10-23T09:28:49Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- All three overlay mappings live as pure registry data: Computer→Projects, Bookshelf→Skills (10 entries scroll inside the 142px region), Phone→Contact (rows are links with `rel="noopener noreferrer"`)
- The Phase 6 seam is complete: all three routes + all three overlay slots render the one shared ContentList; no fetch, no `set:html`/`innerHTML` anywhere in the content path (prohibition gates green)
- Empty (NOTHING HERE YET) and error (SIGNAL LOST) states land with verbatim copy; the missing-slot path now opens the panel with the error block — the previous early return left the scene stuck in overlay mode with no panel to close
- WR-02 disposed: one SHUTDOWN handler sweeps interaction timers/tweens, removes the window close listener, resets mode + gliding, re-enables the player body (guarded — the display list destroys the player first)
- Full gate green before every commit (format, test 80/80, astro check 0 errors, build); dev smokes serve `/darkfolio/skills` + `/darkfolio/contact` with the back link and `/darkfolio/` with game-root

## Task Commits

Each task was committed atomically:

1. **Task 1: hosts + routes + scroll + empty/error states** - `1cb3801` (feat) — interactables bookshelf/phone entries, skills.astro, contact.astro, ContentList href/note, GameOverlay slots + SIGNAL LOST
2. **Task 2: WR-02 shutdown disposal + D-28/D-29 input-lock regressions** - `986d608` (fix) — scene SHUTDOWN sweep + window-listener removal + guarded body re-enable, frame-pointerdown refocus

**Plan metadata:** committed at phase end (see git log)

## Files Created/Modified
- `src/game/data/interactables.ts` - bookshelf + phone hosts (true top-left rects, BROWSE/ANSWER verbs, verbatim 3+3 dialog/status pools, overlay routes)
- `src/pages/skills.astro` - standalone dark route: back link, h1, shared ContentList with the 10 stub skills
- `src/pages/contact.astro` - standalone dark route: 3 contact rows as links (mailto/GitHub/LinkedIn, target=_blank + noopener) + flavour line via the note prop
- `src/components/ContentList.astro` - optional per-entry `href` (anchor wraps the row, noopener + inherited color) and optional `note` line; empty state unchanged
- `src/components/GameOverlay.astro` - hidden `skills`/`contact` slots (build-time ContentList), pre-rendered SIGNAL LOST block, open handler renders error when the slot is missing, frame-pointerdown refocus
- `src/game/scenes/LivingRoomScene.ts` - field `overlayCloseListener` (removed on shutdown), full SHUTDOWN disposal handler

## Decisions Made
- **True top-left rects again**: {344,72} / {96,270} are world centres — stored {336,40} / {92,267} so badge anchors (344,32) / (96,259) reproduce exactly, same correction class as the computer/TV/lamp
- **Error state opens the panel**: INTR-03 says "renders SIGNAL LOST rather than retrying" — so the open path no longer early-returns on a missing slot; title/status still set, panel focused, E/Esc close (the only close path)
- **One keydown handler, kept on the panel**: frame-pointerdown refocuses the open panel instead of moving the handler to window — moving it would have reintroduced the close-press re-open race (Phaser's window listener would see the press in the same dispatch, and stopPropagation does not stop same-target listeners)
- **Guarded body re-enable at shutdown**: Phaser's DisplayList destroys the player before the scene's SHUTDOWN handler runs, so `player.body` can be undefined — the handler enables only a live body while still counting the plan's required re-enable

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Spec clarification] Bookshelf/phone rects stored as true top-left, not the plan's literal centre coords**
- **Found during:** Task 1 (registry implementation)
- **Issue:** Plan specifies bookshelf `{x:344,y:72}` and phone `{x:96,y:270}` — these are the world CENTRES of centre-anchored layout solids; as top-left they shift the badge anchors and shrink reach gaps, contradicting UI-SPEC anchors (344,32) / (96,259)
- **Fix:** stored `{x:336,y:40}` / `{x:92,y:267}` + why-comment in interactables.ts — the convention locked by the same correction in Plans 01 and 02 (dispatch environment note confirms true top-left)
- **Files modified:** src/game/data/interactables.ts
- **Verification:** anchor math reproduced by the badge formula (rect.x + w/2, rect.y − 8); reach tests in proximity.test.ts still green
- **Committed in:** 1cb3801

**2. [Rule 2 - Missing critical] Close-from-anywhere-in-the-frame was dead after a room-strip click (must-have #6 / D-30)**
- **Found during:** Task 2 (input-contract confirmation)
- **Issue:** the panel close path is a keydown handler on the focused panel; clicking the live top 272px of the frame blurs the panel (focus falls to body), leaving the scene stuck in `overlay` mode — E/Esc could never close
- **Fix:** frame-pointerdown refocuses the panel while it is open; single handler + existing `repeat || !ready` gate keeps exactly-once-per-press structural
- **Files modified:** src/components/GameOverlay.astro
- **Verification:** .verify/03-03-locks.log (handler + refocus greps); full gate green
- **Committed in:** 986d608

**3. [Rule 2 - Missing critical] Window close listener left as a zombie across scene shutdown**
- **Found during:** Task 2 (shutdown handler)
- **Issue:** `darkfolio:overlay-close` was registered window-level with `once:true`; a teardown while the overlay is open kept the listener, which would fire into the destroyed scene later (`player.body` undefined → TypeError)
- **Fix:** promoted to the `overlayCloseListener` field, removed in the SHUTDOWN handler alongside the timer/tween sweep
- **Files modified:** src/game/scenes/LivingRoomScene.ts
- **Verification:** .verify/03-03-locks.log + shutdown grep (task-2 verify block 1 green)
- **Committed in:** 986d608

**4. [Environment] Executor model substituted**
- **Found during:** executor spawn (environment gate)
- **Issue:** the agent's pinned model was gated out by the spawning environment
- **Fix:** sanctioned substitution to the available executor model; recorded per user directive — no code impact
- **Verification:** n/a (orchestrator-level)
- **Committed in:** n/a

---

**Total deviations:** 4 (1 spec clarification, 2 missing-critical additions, 1 environment substitution)
**Impact on plan:** No scope change — every must-have truth is observable; deviations 2-3 close gaps in the plan's own D-30/WR-02 contracts.

## WR-01: explicitly deferred (recorded per plan Task 2)

**WR-01 — door trigger can fire from a bump without confirming the entry side — is NOT fixed in this phase.** Rationale: the hazard lives in Phase 2 door logic (`triggeredSide` in `src/game/systems/doorGlide.ts`), and Phase 3 fully discharges the interaction-side hazard through the D-27/D-28 mode gating — door triggers are skipped in every dialog/overlay state (proven in Plan 01 Task 2, re-confirmed in this plan's `.verify/03-03-locks.log`). Changing `triggeredSide` here would re-open ROOM-01/ROOM-02 verification for no Phase 3 requirement. The entry-side confirmation stays flagged for the **Phase 8 polish sweep**.

**WR-02 is closed** on the interaction surfaces: the scene SHUTDOWN handler disposes timers/tweens/listener and resets mode + gliding + body (Task 2).

## Known Stubs
- `src/pages/contact.astro` + `src/components/GameOverlay.astro` (contact slot) — placeholder addresses `hello@example.com`, `github.com/example`, `linkedin.com/in/example`: intentional realistic stand-ins per D-13/D-11; Phase 6 (`06-content`) replaces them with the real contact data behind the same ContentList props.
- `src/game/data/interactables.ts` (lamp entry) — `TOGGLE` verb is placeholder wording carried from 03-02 (no lamp toggling this phase); anticipates Phase 5 audio/lighting.

## Issues Encountered
- A ContentList template ternary shipped with a missing `}` — caught by `pnpm exec astro check` in the task-1 gate before any commit, fixed (fragment-wrapped else branch) and re-run green.
- Astro 7 runs `pnpm dev` as a detached daemon (`astro dev stop` required); `kill $P` alone left port 4321 serving, and one `pkill -f 'astro dev'` attempt matched its own shell. Subsequent smokes stop the daemon via `pnpm exec astro dev stop`; port confirmed free after each run.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 3 execution complete (3/3 plans); next: the STATE.md-mandated Phase 1/2 verification refresh sweep, then `/gsd-verify-work 03`
- Phase 6 gets a clean seam: three routes + three overlay slots, one ContentList, frontmatter stub arrays swapped for content collections with no wiring changes
- Phase 4/5 inherit a scene that renders live behind the overlay (only input is gated) with no zombie timers/listeners on teardown

---
*Phase: 03-interaction*
*Completed: 2026-10-23*

## Self-Check: PASSED

All 7 created/modified source files + SUMMARY.md present on disk; commits 1cb3801 and 986d608 are ancestors of HEAD; plan-level verification claims re-run green (shutdown present, body.enable = true count 4, ContentList on all three pages + overlay, dist/index + dist/skills + dist/contact emitted); task `<verify>` blocks all logged under .verify/ (03-03-hosts.log, 03-03-gate.log, 03-03-gate2.log, 03-03-locks.log, 03-03-plan-verify.log, dev.log).
