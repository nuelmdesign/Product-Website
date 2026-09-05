# Casa del Espacio — Design System, Rev A

Working specification for the website build. Nothing is scaffolded yet; this
folder is the system the build will be derived from.

| File | What it is |
|---|---|
| `../src/styles/tokens.css` | Source of truth. Colour, type, space, grid, motion. Bridged into Tailwind utilities by `src/styles/globals.css`. |
| `motion.md` | Motion grammar — four curves, four durations, six primitives, WebGL scope, fallback ladder, reduced-motion behaviour. |
| `asset-brief.md` | Image schedule and per-project data required from the client. Currently the blocking dependency. |

Readable version of all of the above, laid out as a spec sheet:
<https://claude.ai/code/artifact/ba21343d-a4ab-4e5e-9f34-386e5564d9e0>

## Decisions locked

- **Wordmark** — Casa del Espacio, set as `Casa del Espacio.` with the
  parenthetical descriptor `(Architecture & Interior)`.
- **Motion** — surgical WebGL. GSAP + Lenis carry all structure; shaders
  appear on exactly two surfaces (hero light-fall, thumbnail distortion).
- **Typographic voice** — Instrument Serif (display) / Instrument Sans
  (body, UI) / IBM Plex Mono (data and micro-labels).
- **Photography** — supplied by the client. See `asset-brief.md`.

## Stack (scaffolded)

Next.js 16 App Router · TypeScript · Tailwind 4 bridged to `tokens.css` ·
GSAP + ScrollTrigger + SplitText · Lenis · ogl. Budget: ≤120kb gz
first-load JS, LCP ≤2.0s on a 4G throttle.

`/` currently renders a **foundations gallery** — every motion primitive and
layout component, exercised without photography. It is replaced by the real
home page once imagery lands. The other five routes are placeholders so
navigation resolves.

## Direction

Five references informed the system: Villa Lumière (project-index metadata
and stacked panels), Volzhsky Bereg (numbered rails, single warm accent on
dark, dark/light inversion), CasaNueve (homepage architecture, nav pattern,
scrim-blur hero), TerraForma (spec tables, terracotta chip, horizontal
service rail), and The Puli Shanghai (voice, letterspaced serif caps,
motion-blur photography).

The through-line: **the site behaves like a building.** You enter through a
threshold, move through rooms, and light falls from above. That is the
scroll logic, not a metaphor applied afterwards.

## Built

- Token layer wired to `next/font` (Instrument Serif / Sans, IBM Plex Mono,
  all self-hosted).
- Capability ladder (`src/lib/motion/capability.ts`) — T1 shader, T2 CSS,
  T3 static. The server always renders T3 and the client upgrades after
  mount, so a JS failure leaves finished content on screen.
- Lenis on a shared GSAP ticker, desktop-only.
- Motion primitives MO.01 mask-up, MO.02 image-veil, MO.05 meta-in,
  MO.06 counter; MO.03 panel-stack and MO.04 rail as layout components.
- Chrome: header with the comma-nav and mobile menu, footer, progress
  hairline, spec table, coordinate stamp.

Two contrast defects were found and fixed during the build: `--c-text-meta`
had to be overridden on linen (3.33:1 inherited, now 4.73:1), and the
`--lh-display: 0.92` line box clips descenders inside SplitText's mask
wrapper, which now carries 0.18em of padding.

## Still to build

W.01 hero light-fall shader, W.02 thumbnail distortion, MDX content
adapter, the five real routes.

## Blocked on

1. Photography (`asset-brief.md`, sheet C.01)
2. Per-project data (`asset-brief.md`, sheet C.02)
3. Services list
4. Manifesto — four lines, raw thoughts are enough
