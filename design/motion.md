# Casa del Espacio — Motion Grammar
Rev A. Decision: **surgical WebGL** — GSAP/Lenis carries all structure;
shaders appear in exactly two places.

## Principle

The site behaves like a building. You enter through a threshold, move
through rooms, and light falls from above. Sections are *revealed* the way
a space is revealed as you walk into it — they are not slid, bounced, or
flown in. Nothing eases with a spring. Nothing overshoots.

## Curves

| Token | Bezier | Use |
|---|---|---|
| `--e-entrance` | `0.16, 1, 0.30, 1` | Everything arriving. Fast out of the gate, long settle. |
| `--e-transform` | `0.65, 0, 0.35, 1` | Position/scale changes on things already present. |
| `--e-micro` | `0.40, 0, 0.20, 1` | Hover, focus, press. |
| `--e-exit` | `0.55, 0, 1, 0.45` | Leaving. Accelerates away — never mirrors the entrance. |

## Durations

`--d-micro` 180ms · `--d-ui` 320ms · `--d-reveal` 900ms · `--d-cinematic` 1400ms
Stagger `--stagger` 70ms per line/item, capped at 8 items (then batch).

Lenis: `lerp: 0.085`, `wheelMultiplier: 1`, `touchMultiplier: 1.6`,
`syncTouch: false`. Native scroll on touch — smooth-scroll libraries on
mobile are a battery and jank tax for no perceived gain.

## The six primitives

Everything on the site is one of these. If a new interaction can't be
expressed as one of them, it needs a decision, not an improvisation.

1. **`mask-up`** — Text reveal. Each line wrapped in `overflow: hidden`;
   inner span `translateY(110%) → 0`. 900ms, `--e-entrance`, 70ms stagger.
   Used for every display heading and the manifesto.

2. **`image-veil`** — Image reveal. Container `clip-path: inset(0 0 100% 0)
   → inset(0)`; the `<img>` inside simultaneously scales `1.14 → 1`.
   1200ms, `--e-entrance`. The counter-scale is what makes it feel like the
   image was always there and the wall moved.

3. **`panel-stack`** — The project index. Sections are `position: sticky`;
   as the next panel slides over, the outgoing one scales to `0.94` and
   drops to `filter: brightness(0.55)`. Pure transform/filter, GPU-cheap.
   This is the single most expensive-feeling move on the site and it costs
   no WebGL.

4. **`rail`** — Horizontal services/journal rail. Pointer drag + shift-wheel
   + prev/next buttons, with inertia (`--e-exit`, 600ms decay). Snap to card
   start. Keyboard: arrow keys move one card, focus scrolls into view.

5. **`meta-in`** — Mono micro-labels. `letter-spacing: 0.40em → 0.14em`
   with `opacity: 0 → 1`. 700ms, `--e-entrance`. Reads as a label being
   set rather than fading in.

6. **`counter`** — Numeric stats count from 0 on entry, 1200ms,
   `--e-entrance`, `font-variant-numeric: tabular-nums` so the width never
   jitters.

## WebGL scope — exactly two surfaces

**W.01 — Hero light-fall.** A fragment shader over the hero image:
  - slow vertical luminance sweep, ~14s loop, simulating tungsten light
    dropping from a high ceiling
  - film grain, ~3% opacity, animated
  - pointer-parallax displacement, max 6px, heavily damped (lerp 0.04)
  Budget: ogl (~40kb gz). No Three.js.

**W.02 — Project thumbnail distortion.** Pointer-velocity-driven RGB
  displacement on `IM.04` cards on hover. Amplitude scales with cursor
  speed and decays to zero in 500ms. Desktop pointer only.

**Fallback ladder** — drop to the tier below when any condition fails:
  1. Full shader — `pointer: fine`, no `prefers-reduced-motion`,
     `hardwareConcurrency >= 4`, WebGL2 context acquired.
  2. CSS-only — static image with a CSS gradient light-fall and a
     `filter: brightness()` hover.
  3. Static image, no effects.
  The page must be complete and beautiful at tier 3. Shaders are a
  garnish, never a dependency.

## Page transitions

Content cross-fade with a 240ms `--e-exit` out / 480ms `--e-entrance` in,
plus a 2px brass progress hairline at the top of the viewport. **No** full
curtain wipe — it taxes every navigation with ~700ms for a trick the
visitor sees twice and then resents. Revisit only if the client asks.

## Reduced motion

`prefers-reduced-motion: reduce` collapses all durations to 1ms/200ms
(see `tokens.css`), disables Lenis entirely, disables both shaders, and
converts `mask-up` / `image-veil` to a plain 200ms opacity fade.
`panel-stack` becomes plain stacked sections in normal flow.

## Budget

First-load JS ≤ 120kb gz including GSAP + Lenis + ogl. LCP ≤ 2.0s on a
4G throttle. If a motion idea can't fit that, the motion loses.
