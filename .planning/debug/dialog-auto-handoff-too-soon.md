---
status: diagnosed
trigger: "UAT gap G-03-3 (Phase 03 — Interaction), severity: major. Truth: Dialog slides out, Projects overlay slides up automatically with entries already in DOM. Actual: this slides up too soon, I could not read entirely the text before the dialog slides up."
created: 2026-10-23T00:00:00Z
updated: 2026-10-23T00:00:00Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: "The host handoff has no post-typing dwell: `finishTyping()` starts the 200ms dialog slide-out in the same frame the last character is revealed, so the completed line is at rest for ~0ms; the 250ms slide-in additionally consumes the first ~10 characters of the reveal window."
test: "Static trace of the typing → handoff timeline against the four host dialog strings (lengths 66–82 chars) — arithmetic on CHAR_MS/SLIDE_IN_MS/SLIDE_OUT_MS vs. human reading speed."
expecting: "If confirmed, every host interaction (computer/bookshelf/phone) shows the full text for exactly one render frame then slides away, while the dialog-only branch holds 1500ms."
next_action: "Diagnosis complete — return root cause (diagnose-only mode, no fix applied)."

reasoning_checkpoint:
  hypothesis: "finishTyping() (LivingRoomScene.ts:260-303) transitions to 'handoff' and immediately starts the SLIDE_OUT_MS=200ms slide-out on the very frame the typewriter completes; no read-hold exists on the host path, and the typewriter clock starts concurrently with the 250ms slide-in, so the player never gets the completed line at rest."
  confirming_evidence:
    - "update() (LivingRoomScene.ts:147-155) reveals the full text and calls finishTyping() in the same frame the threshold `typedElapsed >= text.length * CHAR_MS` is crossed."
    - "finishTyping() host branch (LivingRoomScene.ts:266, 282-303) sets mode='handoff' and adds the slide-out tween with zero delay — no timer between full reveal and slide-out."
    - "The dialog-only branch (LivingRoomScene.ts:268-279) does have a read-hold (AUTO_DISMISS_MS=1500 + blinking ▼); hosts have no equivalent, so the missing beat is specific to the host path."
    - "startInteraction() (LivingRoomScene.ts:246-257) sets typedElapsed=0 while the box is at DIALOG_HIDDEN_Y=120 and slides in for 250ms → revealCount(elapsed, len) = floor(elapsed/25) exposes 10 chars before the box is at rest."
  falsification_test: "If a real host interaction ever displayed the completed line at rest for a measurable beat (≥500ms) before the slide-out began, or if a hold timer existed anywhere in the host branch, this hypothesis would be false."
  fix_rationale: "The symptom is 'text unreadable before the overlay rises'; the mechanism is that the reveal window == the total display window with zero settling time, so adding a post-reveal hold (and/or not spending reveal time on the slide-in) is the root-cause-level correction, not a symptom patch."
  blind_spots: "Not reproduced live in a browser this session (code + arithmetic only); perceived readability also depends on the player's reading speed and display size. A frame-rate/missed-frame variant could reveal several chars at once, but that does not change the zero-dwell conclusion."
  candidate_causes:
    - "code: host handoff starts on the typing-complete frame with no read-hold (scene state machine)"
    - "config/spec: comment/timing contract in 03-UI-SPEC.md §Host flow states 'typing ends → dialog slides out' with no dwell, and no READ_HOLD constant exists in dialog.ts"
  and_gate: "no — the zero-dwell alone fully explains the symptom; the slide-in overlap makes it worse but is not required for it."

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: Dialog slides out, Projects overlay slides up automatically with entries already in DOM (UAT test 3 / truth for G-03-3)
actual: "this slides up too soon, I could not read entirely the text before the dialog slides up."
errors: None reported
reproduction: Test 3 in UAT — E at the Computer, let the typewriter finish without pressing E/Esc
started: Discovered during UAT

## Eliminated
<!-- APPEND only - prevents re-investigating -->

- hypothesis: "The overlay CustomEvent is dispatched before the dialog slide-out completes (overlapping transitions)"
  evidence: "The event is only dispatched inside the slide-out tween's onComplete (LivingRoomScene.ts:287-296); the panel cannot rise until 200ms after the slide-out starts."
  timestamp: 2026-10-23T00:00:00Z

- hypothesis: "A stray E/Esc skip edge fires during typing and cuts the reveal short"
  evidence: "Skips require Phaser JustDown (LivingRoomScene.ts:142-143); the E edge that started the interaction is consumed in that same update (line 192). Test 2 (skip) passed, and the reported symptom occurs when the player presses nothing."
  timestamp: 2026-10-23T00:00:00Z

- hypothesis: "The DOM panel's 250ms CSS/ready gate or `ready` flag opens the panel early"
  evidence: "GameOverlay.astro only adds `.open` inside the darkfolio:overlay handler (line 86); the ready gate only gates closing, never opening."
  timestamp: 2026-10-23T00:00:00Z

- hypothesis: "revealCount off-by-one reveals the full text before the completion threshold, ending typing early"
  evidence: "revealCount = min(len, floor(elapsed/25)); the threshold is exactly len*25, so the first frame that satisfies it is also the first frame that reveals char len — no early completion relative to the text."
  timestamp: 2026-10-23T00:00:00Z

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-10-23T00:00:00Z
  checked: src/game/scenes/LivingRoomScene.ts:147-155 (typing branch of update())
  found: "`typedElapsed += delta`, `setReveal(revealCount(...))`, then if (eDown || escDown || typedElapsed >= text.length * CHAR_MS) { setReveal(full); finishTyping(); } — the completion frame reveals the last char and enters finishTyping in the same tick."
  implication: "There is no frame budget between 'text complete' and 'handoff begins'."

- timestamp: 2026-10-23T00:00:00Z
  checked: src/game/scenes/LivingRoomScene.ts:260-303 (finishTyping host branch)
  found: "mode = stateAfterTyping(true) = 'handoff'; killTweensOf(dialogBox); tweens.add(y: DIALOG_HIDDEN_Y, SLIDE_OUT_MS=200); onComplete → dispatch darkfolio:overlay → delayedCall(SLIDE_IN_MS) → mode 'overlay'."
  implication: "Zero delay between full reveal and the slide-out tween; total post-typing motion = 200ms out + 250ms panel up."

- timestamp: 2026-10-23T00:00:00Z
  checked: src/game/scenes/LivingRoomScene.ts:268-279 (paused/dialog-only branch) + src/game/systems/dialog.ts
  found: "Dialog-only objects hold AUTO_DISMISS_MS=1500ms with a blinking ▼ end cue before sliding out; no equivalent constant or timer exists for hosts (dialog.ts has no READ_HOLD)."
  implication: "The codebase already implements a read-hold concept — it is simply absent on the host path."

- timestamp: 2026-10-23T00:00:00Z
  checked: src/game/scenes/LivingRoomScene.ts:246-257 (startInteraction) + InteractionUI.showDialog (line 126-133)
  found: "typedElapsed=0 is set while dialogBox is placed at DIALOG_HIDDEN_Y=120 and tweened to y=0 over SLIDE_IN_MS=250. revealCount = floor(elapsed/25) therefore reveals ~10 characters while the box is still rising (matte occupies y 464–584 in a 480px frame at t=0)."
  implication: "Roughly 250ms of the reveal timeline is spent with the box off-position, so the at-rest typing window is (len*25 − 250)ms."

- timestamp: 2026-10-23T00:00:00Z
  checked: src/game/data/interactables.ts host dialog lengths (computer 80/82/77, bookshelf 78/78/80, phone 66/68/81) vs. the timeline
  found: "Shortest host line: 66 chars → 1650ms typing, box at rest only for the final ~1400ms, then the 200ms slide-out starts on the final-char frame. Longest: 82 chars → 2050ms. Full-text-at-rest display time = one render frame (~17ms) in both cases."
  implication: "A ~13–15 word line needs ~3.5–4.5s to read at 200–250 wpm; the user gets under 2s of animated reveal and effectively zero settled time — matching 'could not read entirely'."

- timestamp: 2026-10-23T00:00:00Z
  checked: .planning/phases/03-interaction/03-UI-SPEC.md:239-249 (§State machine / Host flow)
  found: "Spec text: 'E → typewriter → typing ends → dialog slides out (200ms) → overlay slides in (250ms)'; no dwell or read-hold is specified for hosts, while the dialog-only flow explicitly specifies a 1500ms pause."
  implication: "The defect is encoded in the agreed choreography as well as the code — the gap-closure must add the missing hold to both the code path and the timing contract."

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: "The host handoff begins on the exact frame the typewriter completes. In update() (src/game/scenes/LivingRoomScene.ts:147-155) the condition `this.typedElapsed >= text.length * CHAR_MS` both reveals the last character and calls finishTyping(); finishTyping()'s host branch (lines 266, 282-303) immediately sets mode='handoff' and adds the SLIDE_OUT_MS=200ms slide-out tween — there is no read-hold timer between full reveal and slide-out (unlike the dialog-only branch, which holds AUTO_DISMISS_MS=1500 with a blinking cue). Compounding it, startInteraction() (lines 246-257) starts the typewriter clock (typedElapsed=0) while the box is still at DIALOG_HIDDEN_Y=120 and sliding in for SLIDE_IN_MS=250, so revealCount() exposes ~10 characters before the box reaches its resting position. Net result for a 66–82 char host line: the completed text is at rest for a single render frame before sliding out and the overlay rising."
fix: "Not applied — diagnose-only mode."
verification: "Static trace + timing arithmetic; no live browser reproduction this session."
files_changed: []
