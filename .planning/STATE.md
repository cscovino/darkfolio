# State: Darkfolio

*Last updated: 2026-10-15 after initial GSD roadmap creation*

## Project Reference

**Project:** Darkfolio — 16-bit RPG-style portfolio (Astro 7.3.5 + Phaser 4.2.1 + TypeScript ^5)
**Core Value:** The portfolio is the experience — observable behavior (walking, interacting, opening overlays) IS the deliverable, not a decoration around it.
**Repo:** `/home/jetson/github/darkfolio` (single Astro install on `master`, no commits yet)
**Mode:** mvp (vertical slices — every phase delivers a runnable, end-to-end capability)
**Granularity:** standard (per `.planning/config.json`)

## Current Position

- **Current phase:** Phase 0 — Setup (Foundation)
- **Current plan / step:** none yet — roadmap creation just completed; Phase 0 ready to plan
- **Status:** 🔄 In Progress (Phase 0 marked as next; no plans / steps executed yet on this branch)
- **Active branch:** `phase-0-setup` (per `.gsd/plans/darkfolio-plan.md` §"Git Workflow")
- **Last completed phase:** None
- **Next action:** `/gsd-plan-phase 0` to decompose Phase 0 success criteria into executable plans

## Phase Status

| Phase | Branch              | Status               | Plans | Notes |
|-------|---------------------|----------------------|-------|-------|
| 0 — Setup (Foundation)        | `phase-0-setup`           | 🔄 In Progress (next) | 0/? | Foundation — no v1 reqs; enables every other phase |
| 1 — Core Game Loop            | `phase-1-core-loop`       | ⏳ Pending            | 0/? | GAME-01, GAME-02, GAME-03 |
| 2 — Multi-Room                | `phase-2-multi-room`      | ⏳ Pending            | 0/? | GAME-04, ROOM-01, ROOM-02 — gateway to parallel branches |
| 3 — Interaction               | `phase-3-interaction`     | ⏳ Pending            | 0/? | INTR-01..05 |
| 4 — Lighting                  | `phase-4-lighting`        | ⏳ Pending            | 0/? | LITE-01..03 |
| 5 — Audio                     | `phase-5-audio`           | ⏳ Pending            | 0/? | AUD-01..03 |
| 6 — Content Integration       | `phase-6-content`         | ⏳ Pending            | 0/? | CONT-01..03 — depends on Phase 3 |
| 7 — Custom Assets             | `phase-7-assets`          | ⏳ Pending            | 0/? | No v1 reqs — Aseprite sprites, parallel-safe |
| 8 — Polish & Deploy           | `phase-8-polish`          | ⏳ Pending            | 0/? | LAND-01..03, DEPL-01..03 — depends on everything |

## Dependency Diagram

```
0 → 1 → 2 ──→ 3 ──→ 6 ──→ 8
            ├──→ 4 ──┤
            ├──→ 5 ──┤
            └──→ 7 ──┘
```

**Critical path:** 0 → 1 → 2 → 3 → 6 → 8
**Parallel after Phase 2:** 3, 4, 5, 7 (per `parallelization: true` in config.json)

## Performance Metrics

| Metric                  | Target              | Current |
|-------------------------|---------------------|---------|
| Phases planned          | 9 (0–8)             | 9 ✅    |
| v1 requirements mapped  | 27 / 27             | 27 ✅   |
| Orphan requirements     | 0                   | 0 ✅    |
| Critical-path phases    | 6 (0, 1, 2, 3, 6, 8) | 6 ✅    |
| Parallel branches       | 4 (3, 4, 5, 7)      | 4 ✅    |
| Success criteria / phase | 4–6 each            | ✅      |

## Accumulated Context

### Decisions captured for this roadmap
- **GAME-04 → Phase 2** (not Phase 1): the "three rooms exist and are reachable" behavior is observable only after the doors/transition work lands. Phase 1 ships Living-Room-only.
- **LAND-* → Phase 8** (not Phase 1): the game-canvas requirement is technically met earlier, but the title screen + loading bar + mobile-blocking overlay that turn the page into a portfolio are explicitly Phase 8 work per the prior plan.
- **DEPL-* → Phase 8**: deployment config / build pipeline / SEO are the explicit Phase 8 scope, not split out.
- **Phase 0 carries no v1 reqs** — it is foundation; downstream phases inherit its hooks/config.
- **Phase 7 carries no v1 reqs** — internal visual-quality phase; concrete deliverables are Aseprite sprites.

### Pending (will be addressed by downstream agents)
- Site base path is `/darkfolio/` per `.planning/PROJECT.md` and prior plan — Phase 0 must set `base: '/darkfolio/'` on `astro.config.mjs`.
- Phaser 4 lighting system specifics (Phase 4) — defer to phase planning.
- Audio asset sources (Phase 5) — defer — freesound.org / opengameart.org / tabletaopaudio.com are the documented sources per prior plan.

### Constraints / blockers
- None yet.

## Session Continuity

**Next session resume:**
1. Run `/gsd-plan-phase 0` to decompose Phase 0 success criteria into executable plans.
2. After Phase 0 ships (`phase-0-setup` merged), run `/gsd-plan-phase 1`.
3. Continue down the critical path; once Phase 2 lands, dispatch Phases 3 / 4 / 5 / 7 in parallel via separate worktrees per `parallelization: true`.

**Resume anchor:** this file plus `.planning/ROADMAP.md` are enough to recover the full project state. Branch names map 1:1 to phase IDs.
