---
status: complete
phase: 04-lighting
source: [04-VERIFICATION.md]
started: 2026-11-09T20:05:00Z
updated: 2026-11-10T14:25:17.363Z
round: 3
previous: diagnosed 2026-11-08 (tests 1/3/4 failed → gaps G-04-1/G-04-3/G-04-4, closed by plans 04-03/04-04 + the WR-01 fix)
---

## Current Test

[testing complete]

## Tests

### 1. Pools stop at walls (G-04-1 re-run)
expected: Standing in the Bedroom, no lamp light on the yard behind the north wall; every pool cut off by its room's walls, quantized rims, fixtures bright apart from the flicker dip. (LITE-01/LITE-02, D-03/D-06)
result: pass

### 2. Torch tight, darkness dominates (G-04-3 re-run)
expected: The 40px torch circle reads small, the facing lobe (reach 48px) is noticeable, lamp/screen pools read as local accents, most of the view is dark. (LITE-01, D-10/D-20 as amended 2026-11-08)
result: pass

### 3. One wall per seam (G-04-4 re-run)
expected: No doubled band anywhere; the shared wall sits at the current room's level when idle; during a glide it dips with the cross-fade (0.7 → 0.825 → 0.7) and never reads as a lighter line. (LITE-01, D-04 as amended, D-09)
result: pass

### 4. Flicker re-confirm + fixture-dip judgment
expected: Lamps breathe out of phase 0.5–1.5s apart, screens fainter and slower, torch rock steady; decide whether the bulb dipping ~13% darkness at its low step bothers you (the live D-12 vs D-14 trade-off). (LITE-03, D-12/D-14/D-15/D-16)
result: pass

### 5. Frame rate + UI full-bright re-confirm
expected: ~60fps walking all three rooms; dialog box, E-badge and CRT overlay untouched by the veil. (D-17/D-18/D-21)
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

None recorded this round. Closed in code before this walk: G-04-1 (angle-safe 5-point shadow polygons, registry probe 0 uncovered points), G-04-3 (radii 40/48/24 with a proportional lobe), G-04-4 (single shared 16px band per seam + seam-strip veil), WR-01 (seam band rides the current room while idle).
