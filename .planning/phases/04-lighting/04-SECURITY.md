---
phase: 04-lighting
audited: 2026-11-08
asvs_level: 1
block_on: high
threats_total: 5
threats_closed: 5
threats_open: 0
status: secured
---

# Phase 04 — Lighting: Security Audit

## Scope and assumptions

- Plans audited: 04-01, 04-02. Threat register taken from each plan's `<threat_model>` block.
- `asvs_level: 1`, `block_on: high` resolved from GSD config defaults.
- Static Astro site with client-side Phaser. No auth, database, user data, or server endpoints.
- No `## Threat Flags` entries in either SUMMARY.md.
- ASVS L1 classification: mitigation presence verified in source (grep + the phase's green test suite), no boundary-trace auditing. Register authored at plan time → L1 short-circuit.

## Threat verification

| Threat ID | Category | Severity | Disposition | Status | Evidence |
|-----------|----------|----------|-------------|--------|----------|
| T-4-01 | Denial of Service | low | mitigate | CLOSED | Per-frame lighting cost is bounded in `Light.ts`: one torch-DT rebuild (192px) + one veil rebuild; `bakePool` runs only from the `LightLayer` constructor behind a `scene.textures.exists` guard (bake-once, never in `update`). Grep over `src/game`: zero `snapshot`/`readPixels` hits. |
| T-4-02 | Tampering | low | mitigate | CLOSED | Grep confirms no `window.`/`document.`/`innerHTML`/`eval(` in `Light.ts`, `lighting.ts`, `lightFlicker.ts`; no `Light` token in `GateScene.ts` (D-19 boot gate lighting-free); no lighting file references the `darkfolio:overlay` bridge (T-3-01 contract untouched). |
| T-4-03 | Denial of Service | low | mitigate | CLOSED | Five static pools baked once in the constructor; per-frame work is one clear, four region fills, five ERASE stamps, one torch stamp and one 192px torch rebuild. `hashSeed` is called once per light at construction (grep: not in any frame path); `brightnessAt` is O(1) integer math with no iteration (`lightFlicker.ts`). Frame-rate truth routes to human review (04-UAT.md test 4). |
| T-4-04 | Tampering | low | mitigate | CLOSED | Flicker derives only from the scene-accumulated elapsed value and registry-id seeds. Grep over `src/game` (non-test): zero `Math.random`/`Date.now`/`localStorage`/`sessionStorage` hits. `Light.ts` grep-gated DOM-free; no overlay-bridge writes. |
| T-4-SC | Tampering | high | accept | CLOSED | No package installs in the phase; `git diff main -- package.json pnpm-lock.yaml` is empty. Legitimacy gate not triggered. Row kept per convention. |

## Additional checks (no declared threat; recorded for completeness)

| Check | Result |
|-------|--------|
| DOM sinks (`eval`, `new Function`) in lighting modules | None found. |
| Secrets in tracked files | Static public portfolio — no keys/tokens/credentials introduced by this phase's diff. |
| User/external input reaching GPU textures | None — pools, colours and seeds derive solely from bundle-compiled `rooms.ts`/`lights.ts`. |

## Accepted risks log

| Threat ID | Rationale | Owner / accepted by |
|-----------|-----------|---------------------|
| T-4-SC | No package installs in the phase; dependency surface unchanged. | Plan 04-01/04-02 threat models (disposition `accept`). |

## Audit trail

## Security Audit

{"Threats found": 5, "Closed": 5, "Open": 0} — 2026-11-08, state B (from plan threat models, ASVS L1 short-circuit).

## Result

All five register rows CLOSED. `threats_open: 0`. No open threats at or above the `high` blocking threshold, and none below it either.
