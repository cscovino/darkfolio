# Darkfolio — GSD Core Plan

> A 16-bit Darkwood-inspired portfolio built with Astro 7.3 + Phaser 4 + TypeScript 7.0.
> Spec-driven development using GSD Core phase loop and Ponytail code style.

---

## Project Overview

**Name:** Darkfolio (Dark + Portfolio, with Darkwood inspiration)
**Repo:** `darkfolio`
**GitHub Pages:** `username.github.io/darkfolio`
**Description:** A 16-bit RPG-style portfolio website where visitors explore a dark house, interact with objects, and discover the developer's projects, skills, and contact info through an immersive game experience.

---

## Tech Stack

| Layer | Tool | Version |
|-------|------|---------|
| Framework | Astro | 7.3.5 |
| Game Engine | Phaser | 4.2.1 |
| Language | TypeScript | 7.0 |
| Runtime | Node.js | 22+ |
| Package Manager | pnpm | 12.6.0 |
| Linting + Formatting | Biome | Latest |
| Git Hooks | Husky + lint-staged | Latest |
| Testing | Vitest | Latest |
| Asset Creation | Aseprite | Desktop app |
| Deployment | GitHub Pages | Static |

---

## Scope

### In Scope

- Landing page (game entry: title → loading → game)
- Projects page (rendered standalone + in CRT overlay)
- Skills page (rendered standalone + in CRT overlay)
- Contact page (rendered standalone + in CRT overlay)
- 3-room house game (Living Room, Office, Bedroom)
- Player movement, collision (walls + furniture), camera follow
- Room transitions (slide)
- Lighting system (70% dark, light radius, flickering)
- Audio system (ambient + SFX, mute toggle)
- Dialog system (typewriter, bottom screen, random variants)
- CRT overlay (slide up/down, E/Esc to close)
- Interactable objects (Computer, Bookshelf, TV, Phone, Bed, Lamp)
- Save system (localStorage, tracks interactions)
- Debug mode (F3 toggle)
- Mobile warning (blocking overlay)
- Loading screen (progress bar)
- Custom pixel art assets
- Biome linting/formatting
- Husky git hooks
- Vitest unit tests
- Astro content collections

### Out of Scope

#### Backend
- No API routes, database, user accounts, email sending, form handling, CMS

#### Game Systems
- No inventory, quest, combat, NPCs, day/night, weather, minimap, achievements, scoring

#### UI Features
- No pause menu, settings page, volume slider, brightness control, dark/light toggle, search/filters

#### Mobile
- No touch controls, gesture controls, swipe navigation, PWA, offline support, service worker

#### Social/Marketing
- No social media links, blog, newsletter, podcast, video, analytics, ads

#### Advanced Tech
- No VR/AR, AI/ML, blockchain, crypto, NFTs, Web3, i18n

#### Content
- No resume download (unless in contact), email/phone (unless in contact), map

### Explicitly Forbidden

Agents must NOT:
1. Add features not listed in "In Scope"
2. Install dependencies not listed in "Tech Stack"
3. Create pages not listed in "In Scope"
4. Add UI elements not in "In Scope"
5. Implement systems in "Out of Scope"
6. Add "what" comments (only "why" when non-obvious)
7. Create abstractions for single-use code
8. Add error handling for impossible scenarios
9. Write tests for trivial functions
10. Add configuration options for things that don't need configuration

---

## Path Aliases

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/game/*": ["src/game/*"],
      "@/systems/*": ["src/game/systems/*"],
      "@/scenes/*": ["src/game/scenes/*"],
      "@/objects/*": ["src/game/objects/*"],
      "@/data/*": ["src/game/data/*"],
      "@/styles/*": ["src/styles/*"],
      "@/layouts/*": ["src/layouts/*"],
      "@/pages/*": ["src/pages/*"]
    }
  }
}
```

---

## Husky Hooks

| Hook | Command | Purpose |
|------|---------|---------|
| pre-commit | `pnpm lint-staged` | Biome check + format on staged files |
| pre-push | `pnpm test && pnpm build` | Tests + build |
| commit-msg | `pnpm commitlint --edit` | Validate conventional commits |

### Commit Format
```
<emoji> <type>(<scope>): <subject>
```

Emojis:
- ✨ `:sparkles:` — feat
- 🐛 `:bug:` — fix
- 📝 `:memo:` — docs
- 🎨 `:art:` — style
- ♻️ `:recycle:` — refactor
- ⚡ `:zap:` — perf
- ✅ `:white_check_mark:` — test
- 🔧 `:wrench:` — chore
- 🚀 `:rocket:` — deploy

Example: `✨ feat(game): add player movement`

---

## Biome Configuration

All code quality checks handled by Biome (no custom hooks):

| Check | Biome Rule |
|-------|-----------|
| console.log | `lint/suspicious/noConsoleLog` |
| Unused imports | `lint/correctness/noUnusedImports` |
| Unused variables | `lint/correctness/noUnusedVariables` |
| Unused functions | `lint/correctness/noUnusedFunctions` |
| Duplicate imports | `lint/correctness/noDuplicateImports` |
| Trailing whitespace | formatter (auto) |
| Missing newline at EOF | formatter (auto) |
| Mixed line endings | formatter (auto) |

---

## Game Specifications

| Spec | Value |
|------|-------|
| Perspective | Top-down |
| Tile size | 16x16 |
| Character size | 32x32 (2x2 tiles) |
| Character speed | 120 px/s |
| Animation | 3 walk + 1 idle per direction (16 sprites) |
| Darkness | 70% dark |
| Player light radius | 4 tiles (64px) |
| Light color | Warm yellow (#FFA500) |
| FPS target | 60 fps |
| Physics | Arcade Physics |
| Collision | Walls + furniture |
| Door transitions | Slide |
| Movement keys | WASD / Arrow keys |
| Interact key | E |
| Debug toggle | F3 |

### Rooms

All rooms: 20x15 tiles (320x240 pixels)

**Living Room (entry):**
- Door north → Office
- Door west → Bedroom
- Furniture: Sofa, TV, Bookshelf, Lamp
- Interactable: Bookshelf (Skills overlay)

**Office:**
- Door south → Living Room
- Furniture: Desk, Computer, Bookshelf, Chair, Filing cabinet, Lamp
- Interactable: Computer (Projects overlay), Bookshelf (flavor)

**Bedroom:**
- Door east → Living Room
- Furniture: Bed, Nightstand, Phone, Lamp
- Interactable: Phone (Contact overlay)

### Color Palette (Darkwood Gritty)
- Browns: #4A3729, #6B4E3D, #8B6F5E
- Grays: #2A2A2A, #3D3D3D, #555555
- Muted greens: #3A4A3A, #4A5A4A
- Accents: Warm yellow (lamp), Cold blue (computer/TV)

### Dialog Tone
Humorous/meta — self-aware, funny, breaks fourth wall.

Examples:
- "This computer contains my portfolio... if you dare."
- "The bookshelf judges you silently."
- "The phone rings. Should you answer? (You should.)"

Revisit variants: 3-4 per object, same idea, different words.

---

## Audio Specifications

All audio in OGG format.

| Sound | Type | Volume |
|-------|------|--------|
| Ambient house drone | Loop | 30% |
| Wind against window | Loop | 30% |
| Footsteps (wood) | SFX | 70% |
| Footsteps (carpet) | SFX | 70% |
| Door open/close | SFX | 70% |
| Computer boot | SFX | 70% |
| Phone ring | SFX | 70% |
| Dialog blip | SFX | 70% |
| Lamp toggle | SFX | 70% |
| TV static | SFX | 70% |

---

## Asset Specifications

### Character
- 32x32 pixels
- 16 frames (4 directions × 4 frames)
- PNG sprite sheet
- Transparent background
- Hooded figure, dark cloak

### Tileset
- 16x16 tiles
- PNG format
- Layers: floor, walls, furniture, objects
- Transparent background
- Darkwood gritty palette

### Furniture Sprites
- Sofa: 32x16
- TV: 16x16
- Bookshelf: 16x32
- Desk: 32x16
- Computer: 16x16
- Bed: 32x32
- Nightstand: 16x16
- Phone: 16x16
- Lamp: 16x16
- Door: 16x32

### UI Sprites
- Dialog box frame: 320x120
- Interaction prompt: 64x16
- CRT overlay frame: 640x480

---

## Phase Structure

```
Phase 0: Setup (Foundation)
    │
    ▼
Phase 1: Core Game Loop (Walk around one room)
    │
    ▼
Phase 2: Multi-Room (3 rooms + doors)
    │
    ├──────────────────┬──────────────────┬──────────────────┐
    ▼                  ▼                  ▼                  ▼
Phase 3:            Phase 4:           Phase 5:           Phase 7:
Interaction         Lighting           Audio              Custom Assets
    │                  │                  │                  │
    └──────────────────┴──────────────────┴──────────────────┘
                       │
                       ▼
              Phase 6: Content Integration
                       │
                       ▼
              Phase 8: Polish & Deploy
```

### Critical Path
```
0 → 1 → 2 → 3 → 6 → 8
```

### Parallel Track (after Phase 2)
```
2 → 3 → 6
2 → 4 ┘
2 → 5 ┘
2 → 7 ┘
```

---

## Phase Details

### Phase 0: Setup

**Goal:** Complete config foundation. End state: `pnpm install` succeeds, husky fires on commit, the AGENTS.md pre-commit gate is enforceable end-to-end.

**Decisions (locked):**
- D1. TypeScript → `^5` (Astro 7 toolchain compat — overrides §"Tech Stack")
- D2. `.planning/` is **committed** (project canon; clones must read the spec)
- D3. `astro check` lives in the AGENTS.md pre-commit **gate**, not in husky hooks (keeps hooks fast)

**Install devDeps (one batch):**
`@biomejs/biome@^1.9 · husky@^9 · lint-staged@^15 · vitest@^2 · happy-dom@^15 · @commitlint/cli@^19 · @commitlint/config-conventional@^19 · typescript@^5`

**Agent Instructions:**
- `astro.config.mjs` → `base: '/darkfolio' · output: 'static' · server.host: true`
- `tsconfig.json` → extends `astro/tsconfigs/strict`; the 10 path aliases per §"Path Aliases"; `include: [src/**, tests/**]`
- `biome.json` → 5 lint rules (no-console, no-unused-imports, no-unused-variables, no-unused-function-parameters, no-duplicate-imports); formatter LF / single-quote / semicolons-always
- `commitlint.config.js` → extends `@commitlint/config-conventional` with custom `headerPattern` accepting leading gitmoji (`✨ 🐛 ♻️ 📝 🎨 ⚡ ✅ 🔧 🚀` …)
- `lint-staged.config.mjs` → `*.{ts,tsx,js,jsx,mjs,cjs,json}: ['biome check --write']`
- `vitest.config.ts` → `environment: 'happy-dom'`, `include: ['src/**/*.test.ts']`
- `.gitignore` → Node/Astro standard; **gitignore `.opencode/` only** (`.planning/` stays committed)
- `.nvmrc` → `22`
- `README.md` → one-line purpose, command list, link to `.planning/PLAN.md`
- `.opencode/plan/darkfolio-plan.md` → kept as a copy under `.opencode/plan/` (opencode reads planner state from this path); content mirrors the new `.planning/PLAN.md`
- `package.json` → scripts `format`, `format:check`, `lint`, `check:biome`, `astro:check`, `test`, `test:watch`, `commitlint`. Husky init adds `prepare: husky`.

**Husky (after `pnpm exec husky init`):**

| Hook | Command |
|------|---------|
| `.husky/pre-commit` | `pnpm lint-staged` |
| `.husky/pre-push`   | `pnpm test && pnpm build` |
| `.husky/commit-msg` | `pnpm commitlint --edit "$1"` |

**Verify (= AGENTS.md pre-commit gate):**
- `pnpm install` clean
- `pnpm format && pnpm test && pnpm exec astro check && pnpm build` — all four pass
- `git commit --allow-empty -m "✨ chore(deps): verify husky hooks"` — pre-commit fires lint-staged; commit-msg fires commitlint
- (pre-push runs only on real push; covered when first push happens)

**Skipped now, add when:**
- CI / GitHub Actions — none; husky + AGENTS.md gate are the only enforcement
- `.astro` template formatting — biome skips `.astro`; add `prettier-plugin-astro` only if actual formatting debt shows up
- Vitest coverage gate — no `vitest --coverage` script yet; add when a coverage floor is wanted

**Branch:** `chore-toolchain-foundation`

---

### Phase 1: Core Game Loop
**Goal:** Player can walk around a single room with collision and camera.

**Discuss:**
- Living room layout: exact door positions, furniture placement, player spawn
- Player sprite design (or placeholder)
- Camera behavior (lerp vs snap)

**Agent Instructions:**
- Create `src/game/main.ts` — Phaser config and initialization
- Create `src/game/scenes/BootScene.ts` — Preload assets
- Create `src/game/scenes/PreloadScene.ts` — Loading progress
- Create `src/game/scenes/LivingRoomScene.ts` — Single room for testing
- Create `src/game/objects/Player.ts` — Movement, animation, collision
- Create placeholder tileset (colored rectangles)
- Create placeholder player sprite (colored square)
- Implement movement: WASD/arrows, 120px/s
- Implement collision with walls (Arcade Physics)
- Implement camera follow
- Create `src/components/GameCanvas.astro` — Mounts Phaser on landing page
- Update `src/pages/index.astro` to use GameCanvas

**Manual Test:**
- Visit landing page → see game canvas
- Player renders as placeholder sprite
- Move with WASD/arrows — visible movement
- Player cannot walk through walls
- Camera follows player when moving
- No console errors

**Branch:** `feat-core-loop`

---

### Phase 2: Multi-Room
**Goal:** 3 rooms with slide transitions between them.

**Discuss:**
- Door positions: Living Room north→Office, west→Bedroom
- Slide transition: duration, direction
- Spawn points: where player enters each room from each door

**Agent Instructions:**
- Create `src/game/scenes/OfficeScene.ts`
- Create `src/game/scenes/BedroomScene.ts`
- Create tilemaps for all 3 rooms (JSON format)
- Implement door detection (overlap zones)
- Implement slide transition between scenes
- Update Player to support spawn position from previous room

**Manual Test:**
- Walk to door in Living Room north wall → slide to Office
- Walk to door in Living Room west wall → slide to Bedroom
- Walk to door in Office south wall → slide back to Living (correct spawn)
- Walk to door in Bedroom east wall → slide back to Living (correct spawn)
- Collision works in all 3 rooms
- Camera works in all 3 rooms

**Branch:** `feat-multi-room`

---

### Phase 3: Interaction
**Goal:** Interactable objects, dialog box, CRT overlay rendering Astro pages.

**Discuss:**
- Dialog content for each object (first-time + 3-4 revisit variants)
- Object positions: exact tile coordinates
- Interaction radius (how close player needs to be)
- CRT overlay animation: slide speed, easing

**Agent Instructions:**
- Create `src/game/objects/Interactable.ts` — Base class
- Create `src/game/objects/Computer.ts` — Opens Projects overlay
- Create `src/game/objects/Bookshelf.ts` — Opens Skills overlay
- Create `src/game/objects/Phone.ts` — Opens Contact overlay
- Create `src/game/objects/TV.ts` — Flavor dialog
- Create `src/game/objects/Bed.ts` — Flavor dialog
- Create `src/game/objects/Lamp.ts` — Flavor dialog
- Create `src/game/systems/Dialog.ts` — Typewriter dialog box
- Create `src/game/systems/Overlay.ts` — CRT overlay management
- Create `src/game/data/dialogs.ts` — Dialog content
- Update landing page to mount Astro pages in overlay
- Create `src/components/GameOverlay.astro`

**Manual Test:**
- Walk near Computer → "Press E" prompt appears
- Press E → dialog box shows flavor text
- Advance dialog → CRT overlay slides up with Projects page
- Press E or Esc → overlay slides down
- Try Bookshelf → Skills page
- Try Phone → Contact page
- Try TV/Bed/Lamp → flavor dialog only
- Revisit objects → different dialog variant

**Branch:** `feat-interaction`

---

### Phase 4: Lighting
**Goal:** 70% darkness, torch-like player light, flickering light sources.

**Discuss:**
- Light colors: lamp warm yellow, computer cold blue, TV flickering blue
- Light radius per source: player (4 tiles), lamps (3 tiles), computer (2 tiles)
- Flicker: subtle random, frequency
- Darkness level: 70%

**Agent Instructions:**
- Create `src/game/systems/Lighting.ts` — Phaser 4 lighting system
- Add LightsManager to each room scene
- Create `src/game/objects/Light.ts` — Light source helper
- Add player follow light (radius 4 tiles, warm yellow)
- Add lamp lights in each room (radius 3 tiles, warm yellow)
- Add computer light in Office (radius 2 tiles, cold blue)
- Add TV flickering light in Living Room (radius 2 tiles, cold blue)
- Implement random flicker on all lights

**Manual Test:**
- Rooms are 70% dark — room shapes faintly visible
- Player has visible light radius around them
- Walk outside light → area is nearly black
- Lamps are visible light sources
- Lamp toggle (Press E when near) turns light on/off
- Computer light is cold blue
- TV light flickers subtly
- Flicker is subtle, not distracting

**Branch:** `feat-lighting`

---

### Phase 5: Audio
**Goal:** Ambient atmosphere, SFX for interactions, mute toggle.

**Discuss:**
- Audio file sources: free assets from freesound.org, opengameart.org, tabletaopaudio.com
- Volume levels: ambient 30%, SFX 70%
- Footstep trigger: every X pixels walked, not every frame

**Agent Instructions:**
- Source/download audio files (OGG format)
- Create `src/game/systems/Audio.ts` — Audio manager
- Implement ambient loops (house drone, wind)
- Implement SFX (footsteps, door, computer, phone, dialog blip, lamp, TV static)
- Implement mute toggle (corner button + M key)
- Implement footstep sounds based on player movement
- Implement door sound on room transition
- Implement interaction sounds (computer boot, phone ring, lamp toggle)
- Save mute state to localStorage

**Manual Test:**
- Game starts → ambient house drone plays
- Walk around → footsteps play
- Walk on different surfaces → different footstep sounds
- Open door → door sound plays
- Interact with Computer → computer boot sound
- Interact with Phone → phone ring
- Toggle lamp → lamp sound
- TV static plays near TV
- Mute button toggles all audio
- Mute state persists across reloads

**Branch:** `feat-audio`

---

### Phase 6: Content Integration
**Goal:** Projects, Skills, Contact pages fully integrated with game.

**Discuss:**
- Projects data: how many projects, what fields (title, description, tech, image, link)
- Skills data: categories, proficiency levels
- Contact data: email, LinkedIn, GitHub, phone
- Page layout: card grid, list, or table

**Agent Instructions:**
- Create Astro content collection: `src/content/config.ts` with projects schema
- Create Astro content collection: skills schema
- Create Astro content collection: contact schema
- Add sample projects (3-5 markdown files)
- Add sample skills (10-20 markdown files)
- Add contact info (markdown file)
- Build `src/pages/projects.astro` — Lists all projects
- Build `src/pages/skills.astro` — Lists all skills
- Build `src/pages/contact.astro` — Shows contact info
- Update CRT overlay to render these pages
- Test full flow: interact → overlay → close → save state

**Manual Test:**
- Visit `/projects` → see project cards
- Visit `/skills` → see skill list
- Visit `/contact` → see contact info
- In game, walk to Computer → Projects overlay shows same content
- In game, walk to Bookshelf → Skills overlay shows same content
- In game, walk to Phone → Contact overlay shows same info
- Close overlay, revisit object → dialog shows "already seen" variant
- Save state: reload page → visited objects show different dialog

**Branch:** `feat-content-integration`

---

### Phase 7: Custom Assets
**Goal:** Replace placeholder assets with custom pixel art.

**Discuss:**
- Character design: hooded figure, cloak details, face hidden
- Tileset: wall textures, floor patterns, furniture decorations
- Object sprites: detailed computer, phone, lamps, furniture
- UI: dialog box frame, CRT overlay frame, interaction prompt

**Agent Instructions:**
- Open Aseprite
- Create character sprite: 32x32, 16 frames
- Create tileset: 16x16 tiles, layered
- Create furniture sprites: individual PNGs per furniture type
- Create object sprites: computer, phone, lamp, door
- Create UI sprites: dialog frame, prompt, CRT frame
- Optimize PNGs (compress without quality loss)
- Replace placeholder assets in `public/assets/`
- Update asset references in code

**Manual Test:**
- All sprites loaded correctly
- Character animation smooth in all 4 directions
- Tileset renders correctly in all rooms
- Furniture matches room layout
- Objects are visually consistent (same palette, same style)
- UI sprites render correctly
- No visual glitches or missing assets
- Performance still 60fps with custom assets

**Branch:** `feat-custom-assets`

---

### Phase 8: Polish & Deploy
**Goal:** Title screen, loading screen, mobile warning, SEO, GitHub Pages deployment.

**Discuss:**
- Title screen text: game name, "Press any key to start"
- Loading screen: progress bar text/color
- Mobile warning: message, block gameplay
- SEO: meta tags, sitemap, OG image
- GitHub Pages: base path, build output

**Agent Instructions:**
- Create `src/game/scenes/TitleScene.ts` — Press any key to start
- Create `src/components/LoadingScreen.astro` — Progress bar
- Create `src/components/MobileWarning.astro` — Blocking overlay
- Add meta tags to all pages (title, description, OG)
- Create `public/robots.txt`
- Create `public/favicon.ico`
- Create Astro sitemap integration
- Update Astro config for GitHub Pages base path
- Create GitHub Actions workflow for deployment (optional)
- Verify build output in `dist/`
- Test local preview: `pnpm preview`
- Deploy to GitHub Pages

**Manual Test:**
- Visit site on desktop → loading screen → title → game
- Visit site on mobile → blocking warning, cannot play
- All pages have proper meta tags
- robots.txt accessible
- Sitemap generated
- OG image renders when sharing link
- Build runs without errors
- Preview server serves correctly
- Site works on GitHub Pages URL
- All assets load correctly on deployed site
- 60fps on deployed site
- No console errors

**Branch:** `feat-polish-deploy`

---

## Testing Strategy

### Unit Tests (Vitest)
- Dialog system (typewriter, advance, close)
- Lighting system (radius, flicker, color)
- Audio manager (load, play, mute)
- Save system (localStorage, interaction tracking)
- Player movement (speed, direction, collision)
- Overlay system (open, close, ESC, E)

### Manual Testing
Each phase must be manually tested before merging:
1. Clone repo and run `pnpm install`
2. Run `pnpm test` — unit tests pass
3. Run `pnpm dev` — dev server starts
4. Test all features in the phase
5. Run `pnpm build` — build succeeds
6. Run `pnpm preview` — preview works

### Integration Testing
Phase 6 includes full flow test:
- Spawn → walk to object → interact → dialog → overlay → close → save → reload → revisit → different dialog

---

## Git Workflow

### Branch Naming
- `chore-toolchain-foundation`
- `feat-core-loop`
- `feat-multi-room`
- `feat-interaction`
- `feat-lighting`
- `feat-audio`
- `feat-content-integration`
- `feat-custom-assets`
- `feat-polish-deploy`

### Commit Format
```
<emoji> <type>(<scope>): <subject>
```

Example: `✨ feat(game): add player movement`

### Merge to Main
Each phase:
1. Work on phase branch
2. Manual test passes
3. Unit tests pass
4. Create PR or merge directly
5. Archive phase artifacts to `.gsd/archive/`

---

## Parallelization

After Phase 2, these phases can run in parallel:

| Agent | Phase | Dependencies |
|-------|-------|--------------|
| Agent A | Phase 3: Interaction | Phase 2 |
| Agent B | Phase 4: Lighting | Phase 2 |
| Agent C | Phase 5: Audio | Phase 2 |
| Agent D | Phase 7: Assets | Phase 2 (uses Aseprite, no code conflict) |

Then:
- Phase 6 needs Phase 3 done
- Phase 8 needs everything done

---

## Skills Integration

### Ponytail (Code Style)
Add `AGENTS.md` to project root with Ponytail rules:
- Write only what the task needs
- Never cut validation, error handling, security, accessibility
- Lazy about solutions, not about reading code
- Use the ladder: YAGNI → reuse → stdlib → native → dependency → one-liner → minimum

### GSD Core (Workflow)
Use GSD Core phase loop:
1. Discuss → capture decisions
2. Plan → write phase plan
3. Execute → run in parallel waves
4. Verify → walk through what was built
5. Ship → merge branch, archive

---

## Success Criteria

### Functional
- ✅ Game loads on landing page
- ✅ Player can walk through 3 rooms
- ✅ Collision works (walls + furniture)
- ✅ Player can interact with all objects
- ✅ Dialog system works with typewriter effect
- ✅ CRT overlay opens/closes smoothly
- ✅ Projects/Skills/Contact content renders correctly
- ✅ Lighting creates Darkwood atmosphere
- ✅ Audio plays ambient + SFX
- ✅ Save system tracks interactions
- ✅ Mobile users see blocking warning
- ✅ Debug mode works (F3)

### Performance
- ✅ 60fps on desktop
- ✅ <10MB total assets
- ✅ <5s load time
- ✅ No memory leaks

### Quality
- ✅ All unit tests pass
- ✅ Biome linting passes
- ✅ TypeScript strict mode passes
- ✅ Biome formatting passes
- ✅ Pre-commit hooks pass
- ✅ Pre-push tests + build pass
- ✅ Commit messages follow conventional format

### Deployment
- ✅ GitHub Pages URL works
- ✅ All assets load correctly
- ✅ Game playable on deployed site
- ✅ SEO meta tags present
- ✅ Sitemap generated

---

## Out of Scope Reminder

If any agent is tempted to add features not in "In Scope", STOP. The scope is intentionally minimal. Over-engineering is explicitly forbidden.

---

## Contact

This plan was created using:
- **GSD Core** for spec-driven development workflow
- **Ponytail** for code style (minimal, no over-engineering)
- **Spec-driven approach** for agent-friendly decisions

Plan version: 1.0
Last updated: 2026-09-30
