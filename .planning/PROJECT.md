# Darkfolio

## What This Is

A 16-bit RPG-style portfolio where visitors explore a 3-room dark house and discover developer projects, skills, and contact info through in-game interactions rather than scrolling. Astro 7.3 hosts the underlying content pages; Phaser 4 renders the playable dark house; Astro pages also slide up inside the game as CRT-overlay screens triggered by interactable objects.

## Core Value

The portfolio is the experience — observable behavior (walking, interacting, opening overlays) IS the deliverable, not a decoration around it.

## Requirements

### Validated

(None yet — ship to validate)

### Active

Landing & shell
- [ ] **LAND-01**: Visitor sees a game canvas on the landing page (no scroll-first portfolio)
- [ ] **LAND-02**: Game loads within 5 seconds on a desktop browser
- [ ] **LAND-03**: Mobile visitors see a blocking "play on desktop" overlay

Game core
- [ ] **GAME-01**: Player can move (WASD / arrow keys) at 120 px/s
- [ ] **GAME-02**: Player collides with walls and furniture
- [ ] **GAME-03**: Camera follows the player (lerp, not snap)
- [ ] **GAME-04**: Three rooms (Living Room, Office, Bedroom), each 20x15 tiles

Rooms & transitions
- [ ] **ROOM-01**: Doors trigger slide transitions between rooms
- [ ] **ROOM-02**: Player spawns at the correct tile on entry

Interaction
- [ ] **INTR-01**: Player can press E near an interactable to trigger dialog
- [ ] **INTR-02**: Dialog renders in a typewriter box at the bottom of the screen
- [ ] **INTR-03**: Computer opens the Projects overlay; Bookshelf opens Skills; Phone opens Contact
- [ ] **INTR-04**: Pressing E or Esc closes the CRT overlay
- [ ] **INTR-05**: Revisiting an object after first interaction shows a different dialog variant

Lighting & atmosphere
- [ ] **LITE-01**: Rooms render 70% dark; player has a 4-tile radius warm-yellow light
- [ ] **LITE-02**: Lamp / computer / TV lights render with their respective colors
- [ ] **LITE-03**: Lamps flicker subtly

Audio
- [ ] **AUD-01**: Ambient loops (house drone, wind) play from boot
- [ ] **AUD-02**: Footsteps, door, computer-boot, phone-ring, lamp toggle, TV-static play on trigger
- [ ] **AUD-03**: Mute toggle (corner button + M key) silences all audio and persists across reloads

Content
- [ ] **CONT-01**: Projects page lists 3+ projects as Markdown content-collection entries
- [ ] **CONT-02**: Skills page lists 10+ skills as Markdown entries
- [ ] **CONT-03**: Contact page shows email, GitHub, LinkedIn

Deployment
- [ ] **DEPL-01**: Build produces a static bundle deployed to GitHub Pages at `/darkfolio/`
- [ ] **DEPL-02**: All assets served from the repo (no CDN, no Google Fonts)
- [ ] **DEPL-03**: SEO meta tags present on all pages; sitemap generated

### Out of Scope

- Backend (no API routes, database, auth, email sending, form handling)
- Game systems beyond scope (no inventory, quest, combat, NPCs, day/night, minimap, achievements, scoring)
- UI features (no pause menu, settings, volume slider, brightness control, theme toggle, search/filters)
- Mobile (no touch controls, gestures, swipe, PWA, offline mode)
- Social/marketing (no social links, blog, newsletter, podcast, video, analytics, ads)
- Advanced tech (no VR/AR, AI/ML, blockchain, crypto, NFTs, Web3, i18n)
- Anything not listed in `.planning/PLAN.md` §"In Scope"

## Context

- Repo state: Phase 0 landed on `chore-toolchain-foundation` — toolchain live (Biome/Husky/lint-staged/commitlint/Vitest), `pnpm install && pnpm test && pnpm build` green on a clean clone; `src/pages/index.astro` stub and `public/` assets still untracked (Phase 1 owner commits them)
- Aesthetic: 16-bit pixel art, "Darkwood gritty" palette (browns `#4A3729`/`#6B4E3D`/`#8B6F5E`, grays `#2A2A2A`/`#3D3D3D`/`#555555`, muted greens `#3A4A3A`/`#4A5A4A`, accents warm yellow `#FFA500` / cold blue)
- Dialog tone: humorous / meta, breaks the fourth wall
- Game mechanics: Phaser 4.2.1 + Arcade Physics, 60 fps target, 16x16 tiles, 32x32 character
- Asset creation: Aseprite, PNG sprite sheets, OGG audio files
- Workflow: GSD spec-driven (`@opengsd/gsd-core`), ponytail-style minimal coding, TDD-lite (red-first) for pure logic, browser-verified for visual code
- Predecessor state: planning previously lived in `.gsd/`; migrated to canonical `.planning/` so future gsd:* plugin commands work directly

## Constraints

- **Tech stack**: Astro 7.3.5, Phaser 4.2.1, TypeScript ^5 strict, pnpm 12, Biome + Husky + lint-staged + commitlint, Vitest — anything outside this list needs prior approval. Reason: D1 (TS ^5 chosen over plan's stated ^7 due to Astro 7 toolchain compat).
- **Performance**: 60 fps on desktop, <10 MB total assets, <5 s load time, no memory leaks.
- **Deployment**: GitHub Pages at `/darkfolio/`; site must work without a server.
- **Style discipline**: ponytail rules — no single-use abstractions, no "what"-comments, no tests for trivial functions, no error handling for impossible scenarios.
- **Code-style tooling**: Biome owns lint + format; do not add Prettier or ESLint.
- **No client telemetry**: no analytics, no CDN assets, no Google Fonts — self-host everything.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Adopt canonical GSD tree (`.planning/`) | Future `gsd:*` plugin commands write to `.planning/`; aligning avoids double state trees | Pending migration |
| TypeScript ^5, not ^7 | Astro 7 toolchain currently expects TS 5.x types | Pending |
| `.planning/` committed (not gitignored) | Project canon — clones must read the spec | Pending |
| Branches `phase-N-slug` / `fix-` / `chore-`, squash PR | Each phase surfaces as one reviewable PR | Good |
| Commit format: gitmoji + conventional, code-only refs in subject | Atomic, code-searchable; never mention plans / AGENTS / plugins | Good |
| No `Co-Authored-By:` trailers | Plan-level rule from day one | Good |
| Pre-commit gate: format + test + astro check + build | Ponytail gate must pass before every commit | Good |
| `astro check` in AGENTS.md gate, not in husky hooks | Keeps hooks fast; pre-push stays test + build | Pending |
| Vitest tests for non-trivial pure logic (TDD-lite) | Phaser scenes are render-coupled; visual deferred to browser | Good |
| Skip research phase in `gsd-new-project` | Tech/scope already locked in darkfolio-plan.md | Good |
| commitlint script carries no `--edit`; hook body passes it | pnpm appends hook args to the script — duplicated `--edit` silently validated COMMIT_EDITMSG instead of `$1` (gate bypass, found in Phase 0 code review, fixed + pinned by test) | Good |
| `allowBuilds` pnpm-workspace entry for @biomejs/biome | pnpm 12 hard-fails unapproved postinstall builds; install was blocked otherwise | Good |
| tsconfig include `src/**/*` (not `src/**`) | TS5010 rejects trailing recursive wildcards; `astro check` was vacuously green at `Result (0 files)` | Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason.
2. Requirements validated? → Move to Validated with phase reference.
3. New requirements emerged? → Add to Active.
4. Decisions to log? → Add to Key Decisions.
5. "What This Is" still accurate? → Update if drifted.

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections.
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state.

---
*Last updated: 2026-10-15 after Phase 0*
