---
phase: "04"
slug: "lighting"
status: validated
nyquist_compliant: true
wave_0_complete: false
created: "2026-11-08"
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.1.9 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `pnpm vitest run src/game/systems/lighting.test.ts src/game/systems/lightFlicker.test.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~5 seconds |

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
| 04-01-01 | 01 | 1 | LITE-01 | T-4-02 | Registry and pure veil/torch math, no DOM or random source | unit | `pnpm vitest run src/game/systems/lighting.test.ts` | ✅ | ✅ green |
| 04-01-02 | 01 | 1 | LITE-01 | T-4-01 | Veil + occluded torch composite bounded to one 192px rebuild per frame | integration | `pnpm build && pnpm test` | ✅ | ✅ green |
| 04-02-01 | 02 | 2 | LITE-01, LITE-02 | T-4-01, T-4-03 | Pools bake once in the constructor; ERASE stamps only per frame | unit/integration | `pnpm vitest run src/game/systems/lighting.test.ts && pnpm build` | ✅ | ✅ green |
| 04-02-02 | 02 | 2 | LITE-03 | T-4-04 | Flicker derives only from scene elapsed + registry seeds; no clock/random | unit | `pnpm vitest run src/game/systems/lightFlicker.test.ts` | ✅ | ✅ green |
| 04-02-03 | 02 | 2 | LITE-01 | — | Fade helpers pure; glide-end state flip untouched | unit | `pnpm vitest run src/game/systems/lighting.test.ts src/game/systems/doorGlide.test.ts` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Pool colours, wall stops and doorway glimpses read correctly | LITE-02 | Visual composition on a live WebGL canvas | `pnpm dev`; enter each room; confirm three warm pools and two cold pools, each stopping at walls and visible through the door openings |
| Flicker is subtle and out of phase; torch steady | LITE-03 | Perceptual judgment of rhythm and amplitude | `pnpm dev`; watch the three lamps for ~10s, then the TV and computer; confirm the torch never flickers |
| Door glide fades the veil with no arrival snap | LITE-01 | Motion judgment across a real transition | `pnpm dev`; walk through each door and watch the source room darken behind while the destination brightens |
| Frame rate holds near 60 fps | LITE-01/02/03 | Frame timing needs a real browser | `pnpm dev`; observe the game while moving through lit rooms; confirm no visible stutter |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-11-08 (state B reconstruction — all five tasks carry passing automated commands; only perceptual backstops remain manual)

## Validation Audit

{"Gaps found": 0, "Resolved": 0, "Escalated": 0} — 2026-11-08, state B (no VALIDATION.md; reconstructed from both plans, summaries and the green 109-test suite).
