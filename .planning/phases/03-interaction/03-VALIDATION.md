---
phase: "03"
slug: "interaction"
status: validated
nyquist_compliant: true
wave_0_complete: false
created: "2026-10-26"
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.1.9 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~4 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| INTR-01 | 01 | 1 | Walking near an interactable shows the [E] verb badge; 32px reach boundary is inclusive and room-scoped | — | Reach rule + registry geometry pinned by data-driven tests | unit | `pnpm vitest run src/game/systems/proximity.test.ts` | ✅ | ✅ green |
| INTR-02 | 01 | 1 | Typewriter dialog reveals one char per 25ms; E/Esc skip to full text; host→handoff vs dialog-only→paused split | — | Timing constants, reveal math, and flow split pinned | unit | `pnpm vitest run src/game/systems/dialog.test.ts` | ✅ | ✅ green |
| INTR-03 | 03 | 3 | Computer→/projects, Bookshelf→/skills, Phone→/contact; TV and Lamp are dialog-only; all hosts share ContentList routes | — | Route map pinned by registry test; routes emitted by build | unit/integration | `pnpm vitest run src/game/data/interactables.test.ts && pnpm build` | ✅ | ✅ green |
| INTR-04 | 03 | 3 | E or Esc closes the CRT overlay once per press and returns control to the player | T-3-06 | DOM listener dispatches close once; scene mode gates prevent re-open | manual | UAT keyboard round-trip (see Manual-Only) | ✅ | manual |
| INTR-05 | 02 | 2 | Revisits cycle dialog variants deterministically (A→B→C→A); counters are independent per object and in-memory only | T-3-03 | Deterministic cycling + counter independence + reset semantics pinned | unit | `pnpm vitest run src/game/systems/variants.test.ts` | ✅ | ✅ green |
| G-03-3 | 04 | 4 | Host dialog rests READ_HOLD_MS before sliding out; typewriter clock starts only after the dialog box lands | — | READ_HOLD_MS constant + negative-elapsed reveal clamp pinned | unit | `pnpm vitest run src/game/systems/dialog.test.ts` | ✅ | ✅ green |
| G-03-6 | 05 | 5 | Document has no page-level scrollbar; overlay content region owns Arrow/Page/Home/End scrolling | — | .page border-box + content tabindex + scroll-key guard inspected | manual | UAT scroll/scrollbar check (see Manual-Only) | ✅ | manual |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| E/Esc close parity from canvas and focused panel, single-fire per press, input restored | INTR-04 | Browser focus, OS key repeat, and visual slide-down require a human keyboard round-trip | 1. Walk to any host and open its overlay.<br>2. Press `E` once → panel slides down and the player can walk again.<br>3. Re-open the overlay, press `Esc` once → same clean close.<br>4. Verify no double-close/re-open deadlock and that the game does not read the close key as a new interaction. |
| Document scrollbar absent; Arrow/Page/Home/End scroll only the overlay content list | G-03-6 | Browser viewport sizing and native scroll focus require visual/document measurement | 1. Open the Bookshelf/Skills overlay.<br>2. Confirm the browser shows no page-level vertical scrollbar.<br>3. Press `ArrowDown`/`PageDown` → the 10-entry skills list scrolls internally while title, status line, and footer stay fixed.<br>4. Wheel over the panel chrome (title bar, status line, footer) → the frame and page do not move. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-10-26
