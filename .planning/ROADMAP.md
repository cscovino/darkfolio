# Roadmap: Darkfolio

**Project:** Darkfolio — 16-bit RPG-style portfolio (Astro 7.3.5 + Phaser 4.2.1 + TypeScript ^5)
**Mode:** mvp (vertical slices, end-to-end deliverable per phase)
**Granularity:** standard
**Coverage:** 27 / 27 v1 requirements mapped

---

## Phases

- [x] **Phase 0: Setup (Foundation)** — Toolchain, git hooks, Astro config, path aliases — ready for `pnpm install` / `pnpm test` / `pnpm build` (completed 2026-10-15)
- [x] **Phase 00.1: Agent Team & Skills** (INSERTED) — 7 specialist agents with per-role models, Phaser/Astro/pixel-art skills, near-autonomous execution (completed 2026-10-16)
- [ ] **Phase 1: Core Game Loop** — Player walks the Living Room with movement, collision, and camera follow
- [ ] **Phase 2: Multi-Room** — Three 20×15 rooms (Living, Office, Bedroom) connected by slide-transition doors
- [ ] **Phase 3: Interaction** — E-key prompts, typewriter dialog, CRT overlays (Projects/Skills/Contact), revisit variants
- [ ] **Phase 4: Lighting** — 70% darkness, player torch, colored lamp / computer / TV lights, subtle flicker
- [ ] **Phase 5: Audio** — Ambient loops, contextual SFX, mute toggle (corner button + M key) persisting across reloads
- [ ] **Phase 6: Content Integration** — Projects / Skills / Contact pages wired into Astro content collections + in-game overlays
- [ ] **Phase 7: Custom Assets** — Aseprite character, tileset, furniture, UI sprites replace placeholders
- [ ] **Phase 8: Polish & Deploy** — Title / loading / mobile-blocking screens, SEO, GitHub Pages at `/darkfolio/`

---

## Critical Path

```
0 → 1 → 2 → 3 → 6 → 8
```

Loading, scrolling, and listening must all exist before the user can experience the deliverable. Every phase on the critical path delivers a runnable slice.

## Parallel Tracks (after Phase 2)

```
            ┌──→ Phase 3: Interaction  ──┐
            │                              │
Phase 2 ────┼──→ Phase 4: Lighting    ────┤
            │                              ├──→ Phase 6 → Phase 8
            ├──→ Phase 5: Audio         ──┤
            │                              │
            └──→ Phase 7: Custom Assets ──┘
```

- **Phase 3** unlocks Phase 6 (Content needs interactable overlay plumbing).
- **Phase 7** is asset-only (Aseprite PNGs in `public/assets/`) — no code conflict with the others; safe to run in parallel from Phase 2 onward.
- **Phases 4 / 5** are independent systems that only touch their own files.
- **Phase 8** is the final merge of all branches.

`parallelization: true` in config.json — these four branches may be worked concurrently after Phase 2 lands.

---

## Phase Details

### Phase 0: Setup (Foundation)

**Goal**: Tooling and config foundation is in place — `pnpm install`, `pnpm test`, `pnpm build` all green on a clean clone, and every commit / push is gated by hooks.

**Mode:** mvp

**Depends on**: Nothing (first phase)

**Requirements**: (none — foundation; unblocks all subsequent phases)

**Success Criteria** (what must be TRUE):

  1. `astro.config.mjs` exists with `base: '/darkfolio/'` and `output: 'static'`
  2. `tsconfig.json` declares `strict: true` and the path aliases (`@/*` → `src/*`)
  3. Pre-commit hook runs Biome format + lint on staged files
  4. Pre-push hook runs Vitest + `pnpm build`
  5. `commit-msg` hook enforces the gitmoji + conventional commit format

**Plans**: 1

- [x] 00-PLAN.md — full toolchain foundation: devDeps + configs + husky hooks + gate verification (4 tasks, wave 1)

---

### Phase 00.1: Agent Team & Skills (INSERTED)

**Goal**: A specialist agent team exists in `.opencode/agents/` — 7 domain agents with per-role models, permission guardrails, and step limits — Phaser/Astro/pixel-art Agent Skills are installed under `.opencode/skills/`, every agent passes a dispatch smoke test, and subsequent phases can run near-autonomously via `/gsd-autonomous`.

**Mode:** mvp

**Depends on**: Phase 0

**Requirements**: (none — meta/workflow phase; enables agentic execution of all subsequent phases)

**Success Criteria** (what must be TRUE):

  1. `.opencode/agents/team/` contains 7 agents (game-lead, phaser-specialist, gameplay-dev, qa, pixel-artist, designer, scribe), each declaring an explicit `model`, `mode: subagent`, permission guardrails on `edit`, and a `steps` limit
  2. Phaser official skills (28 + v3-to-v4-migration) and pixel-art + Astro skills are installed as `.opencode/skills/*/SKILL.md` and loadable
  3. Each agent, when dispatched a smoke-test task, returns useful output on its configured model (routing + model wiring proven)
  4. AGENTS.md documents the roster and when GSD commands should route work to each agent
  5. `/gsd-autonomous` plans and executes Phase 1+ unattended with the team available as subagents

**Plans**: 4/4 plans complete
**Wave 1**

- [x] 00.1-01-PLAN.md — tracer: .gitignore tracking unwind + scribe agent + single dispatch proof (wave 1)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 00.1-02-PLAN.md — remaining 6 team agents + AGENTS.md roster/routing docs (wave 2)
- [x] 00.1-03-PLAN.md — vendor-copy pinned Phaser skills + hand-authored astro/pixel-art skills (wave 2)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 00.1-04-PLAN.md — smoke-team harness + sanctioned full run + phase gate close (wave 3)

---

### Phase 1: Core Game Loop

**Goal**: A visitor lands on the page and can walk the player around the Living Room with working movement, collision, and a following camera.

**Mode:** mvp

**Depends on**: Phase 0

**Requirements**: GAME-01, GAME-02, GAME-03

**Success Criteria** (what must be TRUE):

  1. Landing page (`/`) mounts a Phaser game canvas in place of any scroll-first portfolio
  2. Player moves at 120 px/s in response to WASD or arrow keys
  3. Player is blocked by walls and furniture (cannot walk through them)
  4. Camera follows the player with smooth lerp (no snap)
  5. No console errors on boot

**Plans**: 3

**Wave 1**

- [ ] 01-01-PLAN.md — tracer: phaser dep (behind blocking-human legitimacy gate) + TDD movement system + walkable-room slice page → canvas → scene → physics → camera (GAME-01/02/03)

**Wave 2** *(blocked on Wave 1 completion; 01-02 and 01-03 run parallel — zero file overlap)*

- [ ] 01-02-PLAN.md — D-14 boot chain + press-any-key GateScene (UI-SPEC copy contract) + STATE.md housekeeping tracking (GAME-01)
- [ ] 01-03-PLAN.md — Living Room element map: checkerboard floor, D-01 furniture in `solids`, D-02-locked door gaps + D-08 player outline/notch (GAME-02)

---

### Phase 2: Multi-Room

**Goal**: Three connected rooms (Living Room, Office, Bedroom, each 20×15 tiles) — player can traverse the whole house via slide-transition doors.

**Mode:** mvp

**Depends on**: Phase 1

**Requirements**: GAME-04, ROOM-01, ROOM-02

**Success Criteria** (what must be TRUE):

  1. Living Room, Office, and Bedroom each exist as a 20×15 tile scene
  2. Walking through the Living Room north door slides the camera into the Office
  3. Walking through the Living Room west door slides into the Bedroom
  4. Reverse doors (Office south, Bedroom east) slide back to Living Room
  5. Player enters each room at the correct tile (the door they just came through)
  6. Collision and camera follow continue to work in all three rooms

**Plans**: TBD

---

### Phase 3: Interaction

**Goal**: Interactable objects respond to E-key proximity, surface typewriter dialog, and open a CRT overlay that renders the appropriate Astro page — revisits show different dialog.

**Mode:** mvp

**Depends on**: Phase 2

**Requirements**: INTR-01, INTR-02, INTR-03, INTR-04, INTR-05

**Success Criteria** (what must be TRUE):

  1. Standing within the interaction radius of an interactable shows a "Press E" prompt
  2. Pressing E opens a typewriter dialog box anchored to the bottom of the screen
  3. The Computer interactable slides the Projects overlay up; Bookshelf opens Skills; Phone opens Contact
  4. Pressing E or Esc closes the CRT overlay with a slide-down animation
  5. Revisiting any interactable after the first interaction shows a different dialog variant (selection persisted per object)

**Plans**: TBD

---

### Phase 4: Lighting

**Goal**: The house feels dark and atmospheric — 70% darkness baseline, a warm-yellow player torch, colored light sources, and subtle flicker.

**Mode:** mvp

**Depends on**: Phase 2

**Requirements**: LITE-01, LITE-02, LITE-03

**Success Criteria** (what must be TRUE):

  1. Rooms render 70% dark with room shapes faintly visible at the edges
  2. Player carries a 4-tile radius warm-yellow (`#FFA500`) light that follows movement
  3. Lamps render warm-yellow light, computer renders cold-blue, TV renders cold-blue
  4. Lamps flicker subtly — visible offset, low enough to not distract from gameplay
  5. Walking outside any light radius drops the local area to near-black

**Plans**: TBD

---

### Phase 5: Audio

**Goal**: The house has sound — ambient atmosphere from boot, contextual SFX on every interaction, and a mute toggle that survives reloads.

**Mode:** mvp

**Depends on**: Phase 2

**Requirements**: AUD-01, AUD-02, AUD-03

**Success Criteria** (what must be TRUE):

  1. House drone + wind ambient loops begin playing the moment the game boots
  2. Footstep, door, computer-boot, phone-ring, lamp toggle, and TV-static SFX fire on their trigger events
  3. The corner mute button and the M key both silence all audio instantly
  4. Mute state persists across page reloads (read back from `localStorage` on boot)
  5. Toggling mute on then reloading the page leaves the house silent

**Plans**: TBD

---

### Phase 6: Content Integration

**Goal**: The Projects, Skills, and Contact pages are real Astro content collections — renderable both standalone and inside the in-game CRT overlay.

**Mode:** mvp

**Depends on**: Phase 3

**Requirements**: CONT-01, CONT-02, CONT-03

**Success Criteria** (what must be TRUE):

  1. `/projects` lists 3 or more projects as Markdown content-collection entries (title + description + link)
  2. `/skills` lists 10 or more skills as Markdown entries
  3. `/contact` displays an email address, GitHub URL, and LinkedIn URL
  4. The in-game Computer overlay shows the same content as `/projects`
  5. The in-game Bookshelf overlay shows the same content as `/skills`
  6. The in-game Phone overlay shows the same content as `/contact`

**Plans**: TBD

**UI hint**: yes (CRT overlay slides astro pages up over the canvas)

---

### Phase 7: Custom Assets

**Goal**: All placeholder sprites are replaced with Darkwood-themed custom Aseprite pixel art — no visible regression at 60 fps.

**Mode:** mvp

**Depends on**: Phase 2 (parallel from here; uses Aseprite, no code conflict with other branches)

**Requirements**: (none — internal visual-quality phase; replaces placeholders)

**Success Criteria** (what must be TRUE):

  1. Hooded-character player sprite (32×32, 4-direction animation) replaces the placeholder square
  2. Darkwood tileset (16×16 tile grid) replaces the placeholder colored rectangles
  3. Furniture and object sprites (sofa, TV, bookshelf, desk, computer, bed, nightstand, phone, lamp, door) replace their placeholders
  4. UI sprites (dialog box frame, interaction prompt, CRT overlay frame) replace their placeholders
  5. Game still holds a stable 60 fps with the new assets in place

**Plans**: TBD

---

### Phase 8: Polish & Deploy

**Goal**: The site ships — title screen, loading bar, mobile block, SEO, and a working GitHub Pages deployment at `/darkfolio/`.

**Mode:** mvp

**Depends on**: Phase 0, Phase 1, Phase 2, Phase 3, Phase 4, Phase 5, Phase 6, Phase 7

**Requirements**: LAND-01, LAND-02, LAND-03, DEPL-01, DEPL-02, DEPL-03

**Success Criteria** (what must be TRUE):

  1. Landing page renders a game canvas with no scroll-first portfolio fallback
  2. Game reaches an interactive first frame within 5 seconds on a desktop browser
  3. Mobile visitors (UA-sniffed or viewport-sniffed) see a blocking "play on desktop" overlay and cannot enter the game
  4. `pnpm build` produces a static bundle that deploys to GitHub Pages at `/darkfolio/` with all asset paths resolving
  5. Every asset (sprites, OGG audio, fonts) is served from the repo — no CDN, no Google Fonts
  6. SEO meta tags (title, description, OG image) are present on every page; an Astro-generated `sitemap.xml` is emitted

**Plans**: TBD

**UI hint**: yes (title screen + loading progress + mobile-blocking overlay)

---

## Progress

| Phase | Plans Complete | Status   | Completed |
|-------|----------------|----------|-----------|
| 0. Setup (Foundation)        | 1/1 | Complete    | 2026-10-15 |
| 00.1. Agent Team & Skills (INSERTED) | 4/4 | Complete    | 2026-10-16 |
| 1. Core Game Loop            | 0/3 | Not started            | - |
| 2. Multi-Room                | 0/? | Not started            | - |
| 3. Interaction               | 0/? | Not started            | - |
| 4. Lighting                  | 0/? | Not started            | - |
| 5. Audio                     | 0/? | Not started            | - |
| 6. Content Integration       | 0/? | Not started            | - |
| 7. Custom Assets             | 0/? | Not started            | - |
| 8. Polish & Deploy           | 0/? | Not started            | - |

---

## Requirement Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| GAME-01 | Phase 1 | Pending |
| GAME-02 | Phase 1 | Pending |
| GAME-03 | Phase 1 | Pending |
| GAME-04 | Phase 2 | Pending |
| ROOM-01 | Phase 2 | Pending |
| ROOM-02 | Phase 2 | Pending |
| INTR-01 | Phase 3 | Pending |
| INTR-02 | Phase 3 | Pending |
| INTR-03 | Phase 3 | Pending |
| INTR-04 | Phase 3 | Pending |
| INTR-05 | Phase 3 | Pending |
| LITE-01 | Phase 4 | Pending |
| LITE-02 | Phase 4 | Pending |
| LITE-03 | Phase 4 | Pending |
| AUD-01  | Phase 5 | Pending |
| AUD-02  | Phase 5 | Pending |
| AUD-03  | Phase 5 | Pending |
| CONT-01 | Phase 6 | Pending |
| CONT-02 | Phase 6 | Pending |
| CONT-03 | Phase 6 | Pending |
| LAND-01 | Phase 8 | Pending |
| LAND-02 | Phase 8 | Pending |
| LAND-03 | Phase 8 | Pending |
| DEPL-01 | Phase 8 | Pending |
| DEPL-02 | Phase 8 | Pending |
| DEPL-03 | Phase 8 | Pending |

**Coverage:** 27/27 v1 requirements mapped ✓ — zero orphans.

Phase 0 (foundation) and Phase 7 (custom assets) carry no v1 requirements by design — they exist to enable / visually fulfill the requirements shipped by other phases.
