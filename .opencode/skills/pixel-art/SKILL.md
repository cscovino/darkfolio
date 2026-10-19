---
name: pixel-art
description: Darkwood-style 16-bit pixel-art conventions for Darkfolio assets
---

# Pixel art (Darkfolio)

## Palette (Darkwood gritty)

- Browns: `#4A3729`, `#6B4E3D`, `#8B6F5E`
- Grays: `#2A2A2A`, `#3D3D3D`, `#555555`
- Muted greens: `#3A4A3A`, `#4A5A4A`
- Accents: warm yellow `#FFA500`, cold blue (cool accent)

Accents apply to light sources (lamps/computer/TV) and UI, not general scenery.

## Sizes

- Tiles: 16×16
- Characters: 32×32
- Game runs at 60 fps; assets stay small (<10 MB total).

## Sprite sheets & Aseprite

- PNG sprite sheets, Aseprite source files committed alongside exports
- OGG audio
- Assets self-hosted under `public/assets/` (sprites/, tilesets/, audio/, maps/)

Pixel-asset work routes through the `pixel-artist` agent.