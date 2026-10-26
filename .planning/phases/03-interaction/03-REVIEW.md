---
phase: 03-interaction
reviewed: 2026-10-26T00:00:00Z
depth: standard
files_reviewed: 19
files_reviewed_list:
  - src/components/ContentList.astro
  - src/components/GameCanvas.astro
  - src/components/GameOverlay.astro
  - src/content/entries.ts
  - src/game/data/interactables.test.ts
  - src/game/data/interactables.ts
  - src/game/data/rooms.ts
  - src/game/objects/InteractionUI.ts
  - src/game/scenes/LivingRoomScene.ts
  - src/game/systems/dialog.test.ts
  - src/game/systems/dialog.ts
  - src/game/systems/proximity.test.ts
  - src/game/systems/proximity.ts
  - src/game/systems/variants.test.ts
  - src/game/systems/variants.ts
  - src/layouts/Page.astro
  - src/pages/contact.astro
  - src/pages/index.astro
  - src/pages/projects.astro
  - src/pages/skills.astro
findings:
  critical: 0
  warning: 6
  info: 7
  total: 13
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-10-26
**Depth:** standard
**Files Reviewed:** 19 (plus `doorGlide.ts`, `Player.ts`, `buildRoom.ts`, `GateScene.ts`, `main.ts`, `currentRoom.ts` read as dependencies)
**Status:** issues_found

## Summary

Current-state review of the interaction phase after the ESC-cancel, `Page.astro`, and dead-import fixes. The scene state machine (`typing → handoff|paused → overlay → idle`, plus `gliding`) is internally consistent: every mode exit has a matching entry, the timers and tweens that can outlive a mode are either guarded by a mode check or killed on SHUTDOWN, and the `darkfolio:overlay` / `darkfolio:overlay-close` handshake is ordered correctly for the 250 ms ready-gate race (both orderings of the DOM and Phaser timers were traced; neither deadlocks). The data registry coordinates were checked against `rooms.ts` solids and are consistent. `vitest` passes (87/87) and `tsc --noEmit` is clean.

No Critical (data loss / security / crash) defects were found. The findings are robustness and accessibility gaps in the overlay, one silent-failure path that can freeze the player, and convention drift against AGENTS.md. Four of the seven findings from the previous review (WR-01, WR-02, WR-03, IN-04) and the related IN-01/IN-02/IN-03 are still present in the current code and are carried forward with their original IDs so the disposition record stays aligned.

## Critical Issues

None.

## Warnings

### WR-01: `pointerdown` listener refocuses `.content` on clicks inside the overlay

**File:** `src/components/GameOverlay.astro:96-100`
**Issue:** The listener is on `panel.parentElement` (the frame), so it fires for pointerdowns on the panel itself, including links in `.content`. It then calls `content.focus()`, moving focus off the link that was just pressed. Clicking a `mailto:`/GitHub/LinkedIn entry still navigates (click fires regardless), but keyboard/AT focus is yanked to the scroller mid-interaction.
**Fix:**
```typescript
panel.parentElement?.addEventListener('pointerdown', (event) => {
  if (panel.classList.contains('open') && !panel.contains(event.target as Node)) {
    content?.focus({ preventScroll: true });
  }
});
```

### WR-02: Overlay `ready` gate uses `window.setTimeout`; the scene uses Phaser `delayedCall`

**File:** `src/components/GameOverlay.astro:107-110` and `src/game/scenes/LivingRoomScene.ts:315-317`
**Issue:** Two independent clocks gate the same 250 ms window. Failure case: under `prefers-reduced-motion: reduce` the CSS transition is 0 ms, so the panel is fully visible immediately, yet the DOM ignores E/Esc for 250 ms (`!ready` returns before `closePanel`). If the tab is backgrounded, `setTimeout` is throttled while Phaser's clock is paused, so the two gates can disagree for seconds. The ordering is still safe (the scene's `mode === 'handoff'` guard prevents a late `'overlay'` flip from overriding an early close), so this is responsiveness, not deadlock.
**Fix:** Have the scene emit the ready signal from the same place it sets `mode = 'overlay'` (e.g. `window.dispatchEvent(new CustomEvent('darkfolio:overlay-ready'))`) and let `ready` be set only by that event. Skip the timer under reduced motion.

### WR-03: SHUTDOWN handler duplicates the DOM panel-close logic

**File:** `src/game/scenes/LivingRoomScene.ts:118-123`
**Issue:** The scene hand-rolls `classList.remove('open')`, `aria-hidden`, and `blur()` on `#game-overlay` instead of going through `closePanel()` in `GameOverlay.astro`. Any future change to close behaviour (exit animation, extra event, ARIA) will silently skip the shutdown path. The duplication also means the shutdown path does not dispatch `darkfolio:overlay-close`, which is why the scene has to remove its own listener by hand (lines 109-115).
**Fix:** Expose one close helper (e.g. a `darkfolio:overlay-force-close` event handled by the overlay script that calls `closePanel()`), dispatch it from SHUTDOWN, and keep the explicit `removeEventListener` for the scene's own close listener.

### WR-04: Missing overlay markup permanently freezes the player (new)

**File:** `src/components/GameOverlay.astro:57` and `src/game/scenes/LivingRoomScene.ts:296-332`
**Issue:** The overlay script wraps its entire listener registration in `if (panel && titleEl && statusEl)`. If any of those ids is absent (markup edit, rename, or a module that throws before line 57), no `darkfolio:overlay` listener is attached, so the event is dispatched into nothing. The scene then does `this.time.delayedCall(SLIDE_IN_MS, …)` and sets `mode = 'overlay'`, while `body.enable` stays `false` and `overlayCloseListener` waits for a `darkfolio:overlay-close` that can never come, because no panel is open to close. Result: the player cannot move, E/Esc do nothing, and only a page reload recovers.
**Failure case:** rename `id="overlay-status"` in `GameOverlay.astro`; walk to the computer, press E, let the dialog finish. The panel never opens, the scene reports `overlay`, and the character is frozen.
**Fix:** Make the missing-element case fail loudly (`throw` or `console.error`) rather than silently skipping registration, and/or have the scene verify the panel exists (`document.getElementById('game-overlay')`) before entering `handoff`, falling back to `idle` with the body re-enabled when it does not.

### WR-05: Closed overlay stays keyboard-focusable and inside `aria-hidden` (new)

**File:** `src/components/GameOverlay.astro:8` (`.content tabindex="0"`), `:146-148` (`.panel` translated off-frame, no `visibility`/`inert`), `:61-72` (observer only blurs on hide)
**Issue:** When closed, the panel is `aria-hidden="true"` but its `.content` scroller (`tabindex="0"`) and any active-page links (e.g. the contact `mailto:`/GitHub/LinkedIn anchors) remain in the tab order. This violates the ARIA rule that `aria-hidden` subtrees must not contain focusable elements. Because `.frame` is `overflow: hidden` and the panel is pushed off-frame with `translateY(100%)`, tabbing into it makes the browser scroll the clipped frame to reveal the focused element, shifting the game canvas.
**Failure case:** open the contact overlay once, close it with E, then press Tab from the page: focus lands on an invisible link inside the clipped panel and the `#game-frame` scrolls.
**Fix:** Toggle `inert` (or `visibility: hidden` with a matching transition) on `#game-overlay` together with the `open` class, e.g. `panel.inert = true` in `closePanel()` and `panel.inert = false` when opening.

### WR-06: Scene comments cite plan/decision IDs and phase names, against AGENTS.md (new)

**File:** `src/game/scenes/LivingRoomScene.ts:137, 166, 247-248, 278-279, 291, 314`; `src/game/systems/variants.ts:1, 17`; `src/game/data/interactables.ts:74`; `src/game/data/rooms.ts:5`
**Issue:** AGENTS.md §"Code comments" requires comments to reference code only and never plan numbers or phase names. Current comments cite `D-16`, `D-18`, `D-19`, `D-20`, `D-27/D-28`, `D-29`, `D-01`, `D-03`, `D-04`, `UI-SPEC`, and `Phase 1` (rooms.ts). Those identifiers point at planning artifacts that will drift or be archived, so the comments become unreadable to anyone without `.planning/` open. Several of these are also "what" comments that AGENTS.md prohibits.
**Fix:** Replace each with the *why* in plain code terms, e.g. `// One increment per E press; the count selects both the dialog variant and the status line.` and `// Deterministic cycle, not random, so visitors see a stable sequence.` Drop the `D-xx` / `UI-SPEC` / `Phase 1` tokens entirely.

### IN-01: `.content` focus outline removed with no replacement indicator

**File:** `src/components/GameOverlay.astro:205`
**Issue:** `outline: none` on the scroller leaves keyboard users with no visible focus state after `content.focus()` on open.
**Fix:**
```css
.content:focus-visible { box-shadow: inset 0 0 0 2px #e8dcc8; }
```

### IN-02: `MutationObserver` is never disconnected

**File:** `src/components/GameOverlay.astro:61-72`
**Issue:** The observer is created once and never stored or disconnected. Harmless on this static page; it becomes a leak only if the overlay script ever re-runs (HMR or view transitions).
**Fix:** Keep the reference and call `observer.disconnect()` on `astro:before-swap` / `pagehide`, or accept and document that the page is single-load.

### IN-03: Negative-clock unit coverage is thin

**File:** `src/game/systems/dialog.test.ts:29-32`
**Issue:** Only `-1` and `-SLIDE_IN_MS` are pinned. The integration path (`typedElapsed` starting at `-SLIDE_IN_MS` and advancing by `delta`) is untested, so a regression that lets reveal start early would not be caught by the unit suite.
**Fix:** Add `expect(revealCount(-1000, TEXT.length)).toBe(0)` and a sequence test that accumulates deltas from `-SLIDE_IN_MS` and asserts the first character appears at `SLIDE_IN_MS + CHAR_MS`.

### IN-04: `overlayCloseListener` enables `player.body` without a guard

**File:** `src/game/scenes/LivingRoomScene.ts:320-326`
**Issue:** The close listener casts `this.player.body` to a non-optional type and sets `.enable` unguarded, while SHUTDOWN and `dismissPaused` use `as … | undefined` with a check. The inconsistency is harmless today but would throw if the listener ever ran after the sprite was destroyed.
**Fix:**
```typescript
const body = this.player.body as Phaser.Physics.Arcade.Body | undefined;
if (body) body.enable = true;
```

### IN-05: `YARD_RECT` is an unused export

**File:** `src/game/data/rooms.ts:19`
**Issue:** `YARD_RECT` is declared and exported but never imported anywhere in `src/`. Dead export; the yard is drawn from `YARD_LAYOUT`.
**Fix:** Delete the constant, or use it where the yard bounds are needed.

### IN-06: Visit counters use a plain object keyed by id

**File:** `src/game/systems/variants.ts:2-11`
**Issue:** `counts` is a `Record<string, number>` created with `{}`, so inherited keys leak in: `visitCount('constructor')` returns `Object`'s constructor function and `incrementVisit('constructor')` yields a string concatenation, not a count. Current ids are fixed and safe, so this is latent.
**Fix:** `const counts = new Map<string, number>();` with `counts.set(id, (counts.get(id) ?? 0) + 1)` and `counts.get(id) ?? 0`.

### IN-07: `slot` narrowing in the overlay handler relies on a closure write

**File:** `src/components/GameOverlay.astro:113-120`
**Issue:** `let slot: HTMLElement | null = null` is assigned inside a `forEach` callback. TypeScript's control-flow analysis does not see that write, so `slot !== null` is typed as a comparison against a value it has narrowed to `null`. It works at runtime, but the pattern hides the intent and is fragile to refactoring.
**Fix:** `const slot = panel.querySelector<HTMLElement>(\`[data-page="${key}"]\`);` and then toggle `hidden` in a separate loop, or use `Array.from(...).find(...)`.

---

_Reviewed: 2026-10-26_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
