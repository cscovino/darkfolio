# Requirements: Darkfolio

**Defined:** 2026-10-15
**Core Value:** The portfolio is the experience — observable behavior IS the deliverable.

## v1 Requirements

### Landing & shell

- [ ] **LAND-01**: Visitor sees a game canvas on the landing page (no scroll-first portfolio)
- [ ] **LAND-02**: Game loads within 5 seconds on a desktop browser
- [ ] **LAND-03**: Mobile visitors see a blocking "play on desktop" overlay

### Game core

- [x] **GAME-01**: Player can move (WASD / arrow keys) at 120 px/s
- [x] **GAME-02**: Player collides with walls and furniture
- [x] **GAME-03**: Camera follows the player (lerp, not snap)
- [x] **GAME-04**: Three rooms (Living Room, Office, Bedroom), each 20x15 tiles

### Rooms & transitions

- [x] **ROOM-01**: Doors trigger slide transitions between rooms
- [x] **ROOM-02**: Player spawns at the correct tile on entry

### Interaction

- [ ] **INTR-01**: Player can press E near an interactable to trigger dialog
- [ ] **INTR-02**: Dialog renders in a typewriter box at the bottom of the screen
- [ ] **INTR-03**: Computer opens the Projects overlay; Bookshelf opens Skills; Phone opens Contact
- [ ] **INTR-04**: Pressing E or Esc closes the CRT overlay
- [ ] **INTR-05**: Revisiting an object after first interaction shows a different dialog variant

### Lighting & atmosphere

- [ ] **LITE-01**: Rooms render 70% dark; player has a 4-tile radius warm-yellow light
- [ ] **LITE-02**: Lamp / computer / TV lights render with their respective colors
- [ ] **LITE-03**: Lamps flicker subtly

### Audio

- [ ] **AUD-01**: Ambient loops (house drone, wind) play from boot
- [ ] **AUD-02**: Footsteps, door, computer-boot, phone-ring, lamp toggle, TV-static play on trigger
- [ ] **AUD-03**: Mute toggle (corner button + M key) silences all audio and persists across reloads

### Content

- [ ] **CONT-01**: Projects page lists 3+ projects as Markdown content-collection entries
- [ ] **CONT-02**: Skills page lists 10+ skills as Markdown entries
- [ ] **CONT-03**: Contact page shows email, GitHub, LinkedIn

### Deployment

- [ ] **DEPL-01**: Build produces a static bundle deployed to GitHub Pages at `/darkfolio/`
- [ ] **DEPL-02**: All assets served from the repo (no CDN, no Google Fonts)
- [ ] **DEPL-03**: SEO meta tags present on all pages; sitemap generated

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Persistence & accounts

- **PERS-01**: Save state in localStorage persists across reloads (interaction tracking, mute, dialog variants)
- **PERS-02**: Multiple save slots per visitor (local)

### Visual polish

- **POLISH-01**: Custom Aseprite character sprites replace placeholders
- **POLISH-02**: Custom Aseprite tilesets replace placeholders
- **POLISH-03**: Transition fade-in animation on first load

### Accessibility

- **A11Y-01**: Keyboard-only navigation works without mouse input
- **A11Y-02**: Color-blind palette mode toggle

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend / API routes / database | Site is static; user content lives in Markdown collections |
| Authentication / user accounts | Personal portfolio; not a multi-user app |
| Inventory / quest / combat / NPCs | Single-room narrative, not a game in the RPG-canon sense |
| Day / night / weather / minimap | Scope-limited; fits the 3-room narrative |
| Pause menu / settings page | Game is short; ambient controls cover needs |
| Mobile touch controls | Desktop-targeted per spec; mobile gets blocking overlay |
| Service worker / PWA / offline | Static served from GitHub Pages; not a PWA |
| Social-media links / blog / newsletter | Portfolio surface limited to projects/skills/contact |
| VR / AR / AI / blockchain / crypto | Brief is small indie portfolio, not a tech demo |
| Multi-language (i18n) | English-only target |
| Resume download / email-list signup | Out of project surface |

## Traceability

Roadmap-confirmed mapping. Every v1 requirement below maps to exactly one phase; phases with no listed requirements are foundation or pure asset-replacement phases by design.

| Requirement | Phase              | Status |
|-------------|--------------------|--------|
| GAME-01     | Phase 1 — Core Game Loop      | Complete |
| GAME-02     | Phase 1 — Core Game Loop      | Complete |
| GAME-03     | Phase 1 — Core Game Loop      | Complete |
| GAME-04     | Phase 2 — Multi-Room          | Complete |
| ROOM-01     | Phase 2 — Multi-Room          | Complete |
| ROOM-02     | Phase 2 — Multi-Room          | Complete |
| INTR-01     | Phase 3 — Interaction         | Pending |
| INTR-02     | Phase 3 — Interaction         | Pending |
| INTR-03     | Phase 3 — Interaction         | Pending |
| INTR-04     | Phase 3 — Interaction         | Pending |
| INTR-05     | Phase 3 — Interaction         | Pending |
| LITE-01     | Phase 4 — Lighting            | Pending |
| LITE-02     | Phase 4 — Lighting            | Pending |
| LITE-03     | Phase 4 — Lighting            | Pending |
| AUD-01      | Phase 5 — Audio               | Pending |
| AUD-02      | Phase 5 — Audio               | Pending |
| AUD-03      | Phase 5 — Audio               | Pending |
| CONT-01     | Phase 6 — Content Integration | Pending |
| CONT-02     | Phase 6 — Content Integration | Pending |
| CONT-03     | Phase 6 — Content Integration | Pending |
| LAND-01     | Phase 8 — Polish & Deploy     | Pending |
| LAND-02     | Phase 8 — Polish & Deploy     | Pending |
| LAND-03     | Phase 8 — Polish & Deploy     | Pending |
| DEPL-01     | Phase 8 — Polish & Deploy     | Pending |
| DEPL-02     | Phase 8 — Polish & Deploy     | Pending |
| DEPL-03     | Phase 8 — Polish & Deploy     | Pending |

**Coverage:**
- v1 requirements: 27 total
- Mapped to phases: 27 ✓
- Unmapped: 0
- Phase 0 (Setup) — no v1 reqs (foundation; enables every other phase)
- Phase 7 (Custom Assets) — no v1 reqs (internal visual-quality phase; replaces placeholders)

---
*Requirements defined: 2026-10-15*
*Last updated: 2026-10-15 after initial GSD init*
