---
status: diagnosed
trigger: "UAT gap G-03-6 (Phase 03 — Interaction), severity: minor. Expected: Each host opens its matching page; skills scroll internally; chrome never moves; no in-overlay navigation between pages. Actual: browser has scrollbar and scroll a litle bit."
created: 2026-10-23T13:00:00.000Z
updated: 2026-10-23T13:55:00.000Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: "CONFIRMED — the document is 32px taller than the viewport because `.page` uses content-box sizing with `min-height: 100dvh` + `padding: 16px`; the body scrolls that 32px (page scrollbar), and arrow keys scroll the document because the focused overlay panel is not a scroll container."
test: "Measured the built page in headless Firefox (viewport 1280x800): doc.scrollHeight 832 vs doc.clientHeight 800, page rect height 832, box-sizing content-box."
expecting: "maxScrollY === 32 = padding-top(16) + padding-bottom(16); page rect = 100dvh + 32."
next_action: "None — diagnose-only session. Report root cause and stop."

reasoning_checkpoint:
  hypothesis: "The overlay panel's own scroller (.content) is correct; the stray scrollbar belongs to the document because .page's min-height:100dvh is a content-box minimum and its 16px vertical padding is added on top, so the document is always exactly 32px taller than the viewport. Because the document is scrollable, wheel over panel chrome (titlebar/status/footer) chains to it and arrow keys — with focus on the non-scrollable tabindex=-1 panel — scroll the document instead of the skills list."
  confirming_evidence:
    - "Built page measured in headless Firefox at 1280x800: doc.scrollHeight=832, doc.clientHeight=800, maxScrollY=32, .page rect height=832."
    - "Built CSS (dist/index.html): html,body{margin:0} .page{min-height:100dvh;padding:16px;display:grid;overflow:hidden} — no box-sizing, so 100dvh is the content box and padding adds 32px."
    - "No source anywhere handles Arrow keys, wheel, or tabIndex on .content; the only scroll call is content.scrollTop = 0 on open (GameOverlay.astro:85)."
  falsification_test: "If the measured document scrollHeight equalled clientHeight (or the page rect equalled the viewport height), the padding-overflow hypothesis would be wrong. Measured 832 vs 800 — hypothesis holds."
  fix_rationale: "Not applied (diagnose-only). A fix must remove the document's 32px overflow at its source (sizing/overflow of .page / html+body) rather than trying to clip it with .page's own overflow:hidden, which cannot clip the padding of its own box."
  blind_spots: "No graphical browser session was available to actually send real wheel/arrow events; the arrow-key-document-scroll part is inferred from the absence of any keyboard scroll ownership on .content plus focus landing on the tabindex=-1 panel. The 32px document overflow itself is directly measured."
  candidate_causes:
    - "[code/CSS] index.astro .page: min-height:100dvh with content-box padding → document 32px taller than viewport"
    - "[config] no global reset (no *,html,body{box-sizing:border-box} / height:100% / overflow:hidden) to absorb page-level padding"
    - "[code/DOM] overlay panel keyboard focus has no scroll target; .content is not focusable and no arrow-key/wheel containment exists"
  and_gate: "yes for the full reported behavior — the 32px document overflow (layout) is required for the scrollbar/existence of page scroll; the missing scroll ownership (DOM/keyboard) is what lets arrow keys and chrome-wheel actually reach and use that 32px. Both must be addressed for 'skills scroll internally, chrome never moves'."

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: Overlay open shows its own internal scroll for the skills list; document/body chrome never scrolls or shows a page scrollbar.
actual: Browser has a scrollbar and the page scrolls a little bit.
errors: None reported
reproduction: Test 6 in UAT — open Computer/Bookshelf/Phone overlays and scroll the skills list with wheel and arrow keys.
started: Discovered during UAT

## Eliminated
<!-- APPEND only - prevents re-investigating -->

- hypothesis: "The .content skills scroller is mis-sized (flex child refuses to shrink), so the overlay content itself overflows the frame and creates a document scrollbar."
  evidence: "GameOverlay.astro:161-169 .content has flex:1 + overflow-y:auto (automatic minimum size becomes 0 when overflow is not visible), inside .panel with a definite 43.333% height against .frame's definite aspect-ratio height. UAT wheel scrolling of the list works, and the measured 32px document overflow is fully explained by .page padding — not by panel content escaping."
  timestamp: 2026-10-23T13:40:00.000Z
- hypothesis: "The overlay panel (position:absolute, height 43.333%, translateY(100%) while closed) itself extends the document scroll height."
  evidence: ".frame has overflow:hidden (GameCanvas.astro:17) and is position:relative, so the closed panel is clipped; the built-page measurement showed the document overflow exactly equals .page's 2x16px padding, and the frame sits at top=176 with height 480 inside an 800px content box."
  timestamp: 2026-10-23T13:42:00.000Z

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-10-23T13:30:00.000Z
  checked: "src/pages/index.astro (lines 18-32) and built dist/index.html CSS"
  found: "`.page { min-height: 100dvh; display: grid; place-items: center; overflow: hidden; padding: 16px }` — no box-sizing, so min-height applies to the content box and the 16px top/bottom padding is added outside it. Built CSS confirms: `.page[data-astro-cid-lcdefpme]{place-items:center;min-height:100dvh;padding:16px;display:grid;overflow:hidden}` and `html,body{background:#2a2a2a;margin:0}` (no height/overflow lock on html/body)."
  implication: ".page's border box is 100dvh + 32px; body inherits that height, so the document is always exactly 32px taller than the viewport → page scrollbar + max 32px of page scroll. .page's own overflow:hidden cannot help: the overflow is .page's own padding, outside its content box."

- timestamp: 2026-10-23T13:45:00.000Z
  checked: "Headless Firefox measurement of the actual built page (dist/index.html with a metrics overlay added only in /tmp/opencode/distcheck.html), window 1280x800"
  found: "DIST innerHeight=800; doc.scrollHeight=832; doc.clientHeight=800; maxScrollY=32; body.scrollHeight=832; .page rect height=832. A CSS-only harness with the same .page/.frame rules gave page boxSizing=content-box, page padding=16px, page rect height=832, frame top=176/height=480."
  implication: "Direct confirmation: the document scrolls exactly the 32px of .page vertical padding, at any viewport size (the frame always fits, min-height dominates). This is the scrollbar the user sees and the 'scroll a little bit'."

- timestamp: 2026-10-23T13:48:00.000Z
  checked: "src/components/GameOverlay.astro entire file; grep for Arrow/wheel/scrollTop/tabindex across src"
  found: "Panel is `<div id="game-overlay" class="panel" tabindex="-1">` (line 5) and gets `panel.focus({preventScroll:true})` on open (line 88). Only keydown handling is E/Esc (lines 48-55). .content (161-169) has overflow-y:auto but no tabindex. Only scroll code in src is `content.scrollTop = 0` on open (line 85). No Arrow/wheel handlers exist anywhere."
  implication: "Arrow keys never target the skills list: focus sits on the non-scrollable panel, so the browser's default arrow-key scrolling scrolls the document — which is scrollable because of the 32px overflow above. Wheel over the panel chrome (titlebar/status/footer/padding) likewise chains to the document, moving the frame ('chrome never moves' violated)."

- timestamp: 2026-10-23T13:50:00.000Z
  checked: "src/components/GameCanvas.astro frame sizing vs .page content width"
  found: "`.frame width: min(640px, calc(100vw - 40px), calc((100dvh - 40px) * 4 / 3))`; the aspect-ratio 4/3 height formula assumes the 16px page padding is already inside the viewport budget (it reserves 40px total), which only works if .page is border-box."
  implication: "Same missing box-sizing is the root of the sizing contract: the frame math intentionally reserves the page padding, but .page adds it on top. (Minor adjacent effect, not reported: when the `100vw - 40px` branch wins and a classic vertical scrollbar is present, the frame is ~7px wider than the page content box and gets clipped by .page overflow:hidden.)"

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: "`src/pages/index.astro:25-31` — `.page` is content-box sized with `min-height: 100dvh` AND `padding: 16px`, so its border box is always 32px taller than the viewport (100dvh + 2x16px). `html`/`body` have only `margin:0` (no `height:100%` / `overflow:hidden`), so the document keeps a vertical scrollbar and scrolls up to exactly 32px; `.page { overflow: hidden }` cannot prevent it because the overhang is the page's own padding, not descendant overflow. Contributing: the overlay gives keyboard focus to the non-scrollable `#game-overlay` panel (`tabindex=-1`, GameOverlay.astro:5/88) and `.content` has no tabindex or arrow-key handling (GameOverlay.astro:161-169), so arrow keys scroll that document instead of the skills list, and wheel over panel chrome (titlebar/status/footer) chains to the document."
fix: "Not applied — diagnose-only session."
verification: "Measured directly in headless Firefox on the built page: doc.scrollHeight 832 vs clientHeight 800 (maxScrollY 32) at 1280x800; .page computed boxSizing=content-box, padding 16px, rect height 832."
files_changed: []
