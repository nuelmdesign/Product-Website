# Casa del Espacio — Design System, Rev A

Working specification for the website build. Nothing is scaffolded yet; this
folder is the system the build will be derived from.

| File | What it is |
|---|---|
| `tokens.css` | Source of truth. Colour, type, space, grid, motion. Consumed by the Tailwind config and component CSS once the app is scaffolded. |
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

## Stack (assumed, not yet committed to code)

Next.js App Router · TypeScript · Tailwind bound to `tokens.css` ·
GSAP + ScrollTrigger · Lenis · ogl. Budget: ≤120kb gz first-load JS,
LCP ≤2.0s on a 4G throttle.

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

## Blocked on

1. Photography (`asset-brief.md`, sheet C.01)
2. Per-project data (`asset-brief.md`, sheet C.02)
3. Services list
4. Manifesto — four lines, raw thoughts are enough
