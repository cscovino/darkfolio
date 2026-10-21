---
phase: 02-multi-room
audited: 2026-10-21
asvs_level: 1
block_on: high
threats_total: 4
threats_closed: 4
threats_open: 0
status: secured
---

# Phase 02 — Multi-Room: Security Audit

## Scope and assumptions

- Plans audited: 02-01, 02-02. Threat register taken from each plan's `<threat_model>` (`02-01-PLAN.md:277-292`, `02-02-PLAN.md:180-196`).
- `asvs_level: 1`, `block_on: high` read from `.planning/config.json`.
- Static Astro site with client-side Phaser. No auth, database, user data, or server endpoints.
- No `## Threat Flags` section exists in either SUMMARY.md.
- ASVS L1 classification: mitigation presence verified in source (grep + targeted test run), no boundary-trace auditing.

## Threat verification

| Threat ID | Category | Severity | Disposition | Status | Evidence |
|-----------|----------|----------|-------------|--------|----------|
| T-02-01 | Denial of Service | medium | mitigate | CLOSED | `startGlide` (`src/game/scenes/LivingRoomScene.ts:107-128`) sets `gliding = true` and `body.enable = false`, then tweens over a fixed `GLIDE_MS` (700, `src/game/systems/doorGlide.ts:15`) — no awaitable, no I/O. `onComplete` runs unconditionally: `body.reset(end.x, end.y)`, `body.enable = true`, `this.gliding = false` (`LivingRoomScene.ts:121-126`). `end` comes from `glideEnd` (`doorGlide.ts:40-51`), a pure function returning `axis ± GLIDE_STEP` (integer 48), so the rest position is exact. `update` early-returns while `gliding` (`LivingRoomScene.ts:68`). Rest-spot clearance is asserted by `rooms.test.ts` ("keeps both glide rest-spot body rects clear of destination solids", :92; west pair, :145). |
| T-02-02 | Information Disclosure | low | accept | CLOSED | Static portfolio game — no secrets, keys, tokens, or user data exist in source; everything is inherently public. Accepted at ASVS L1 (see Accepted Risks Log). |
| T-02-03 | Tampering | medium | mitigate | CLOSED | `rooms.test.ts` asserts the geometry invariants the mitigation names: walls clear of each door gap (:69 living/office, :126 living/bedroom), walking lanes clear of solids (:88, :99, :137, :141), glide rest-spot bodies clear of destination solids (:92, :145), the sealed-wall no-door invariant via `expect(DOORS).toHaveLength(2)` and `['north','west']` (:229-230), and door gaps clear of the sealed east/south wall bands (:233). Run on 2026-10-21: `rooms.test.ts` 24/24 pass, `doorGlide.test.ts` 17/17 pass (41 total). |
| T-02-SC | Tampering | high | mitigate | CLOSED | No install task exists in either plan; all work is source-only against the Phase 0/1 dependency set. Diff against trunk (`git diff main...HEAD -- package.json pnpm-lock.yaml`) shows **removals only**: the duplicate `check:biome` / `astro:check` script aliases and the `happy-dom` devDependency, with the lockfile diff removing `happy-dom@15.11.7` and its vitest peer suffix. No package added, no new resolution, no `hasInstallScript` entry — nothing was installed. |

## Additional checks (no declared threat; recorded for completeness)

| Check | Result |
|-------|--------|
| XSS / DOM sinks (`innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`) in `src/` and `public/` | None found. |
| Inline scripts in built HTML | `dist/index.html` contains one external `<script type="module" src="…/_astro/GameCanvas…js">`. No inline script bodies. |
| Secrets in tracked files | Pattern scan over tracked files (excluding lockfile, `.planning/`, `.opencode/`) found no keys, tokens, passwords, or private keys. |
| Dependency lockfile tracked | Yes, `pnpm-lock.yaml` is tracked and consistent with `package.json`. |

## Accepted risks log

| Threat ID | Rationale | Owner / accepted by |
|-----------|-----------|---------------------|
| T-02-02 | Single-player static page. There is no server, storage, account, or user-generated content — every byte of the bundle is public by definition. Input effects are confined to one browser session. | Plan 02-01 threat model (disposition `accept`). |

## Result

All four declared threats are CLOSED. No open threats at or above the `high` blocking threshold, and none below it either. `threats_open: 0`.
