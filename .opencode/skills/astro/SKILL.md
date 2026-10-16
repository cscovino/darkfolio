---
name: astro
description: Astro 7.3 static-site conventions for Darkfolio — pages host the Phaser canvas and CRT-overlay content
---

# Astro (Darkfolio)

Astro 7.3.5, static output only (`output: 'static'`). No SSR, no API routes —
REQUIREMENTS.md Out of Scope forbids backend; mirror, don't re-decide.

## Base path

`base: '/darkfolio/'` (GitHub Pages). Every absolute asset URL must carry the
base or it 404s in production. Use Astro's `import.meta.env.BASE_URL` or the
configured `base` when building asset paths; never hard-code `/`.

## Commands (run via pnpm)

- `pnpm dev` — dev server
- `pnpm build` — production static bundle
- `pnpm preview` — preview built bundle
- `pnpm format` — Biome format
- `pnpm test` — Vitest
- `pnpm astro:check` — `astro check` typecheck

## Content collections

Markdown entries live under `src/content/` for projects, skills, and contact
data. Layouts in `src/layouts/`, pages in `src/pages/`, components in
`src/components/`.

## CRT dual-rendering

Astro pages render standalone (browsed directly) and slide up inside the Phaser
canvas as CRT-overlay screens triggered by interactable objects. Keep pages
self-contained and base-path-safe so both render paths work.