/**
 * W.01 — hero light-fall.
 *
 * Shared GLSL so the Next component and the standalone preview render the
 * identical image. Three things happen here, all from sheet B.02:
 *   1. a slow vertical luminance sweep on a 14s loop — tungsten light
 *      dropping from a high ceiling
 *   2. animated film grain at ~3%
 *   3. pointer-parallax displacement, capped at 6px, damped by the caller
 *
 * When no texture is bound (uHasTex = 0) it renders a procedural warm
 * interior from the brand grounds, so a slot with no photography yet still
 * reads as a lit room rather than an empty box.
 */

export const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const FRAG = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec2  uRes;
uniform vec2  uPointer;   // -1..1, already damped by the caller
uniform float uHasTex;
uniform sampler2D uTex;
uniform float uReveal;    // 0..1, lets the veil drive brightness in

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  // Parallax: 6px maximum, expressed in uv so it is resolution-independent.
  vec2 uv = vUv + uPointer * (6.0 / uRes);

  vec3 col;
  if (uHasTex > 0.5) {
    col = texture2D(uTex, uv).rgb;
  } else {
    // Procedural interior built from the brand grounds (sheet A.01).
    vec3 espresso = vec3(0.078, 0.063, 0.051);
    vec3 coffee   = vec3(0.231, 0.165, 0.129);
    vec3 mahogany = vec3(0.353, 0.204, 0.157);
    // uv.y = 1 is the TOP in GL space, so the lighter tone belongs there.
    col = mix(espresso, coffee, smoothstep(0.0, 1.0, uv.y));
    col = mix(col, mahogany, smoothstep(0.78, 0.12, uv.x) * 0.34);
    // A suggestion of a tall opening on the right.
    col += vec3(0.10, 0.08, 0.06) * smoothstep(0.86, 0.99, uv.x)
                                  * smoothstep(0.05, 0.70, uv.y);
  }

  // Light falling from above: a soft band descending on a 14s loop, plus a
  // standing pool near the top so the source never fully leaves the frame.
  float t    = fract(uTime / 14.0);
  float band = smoothstep(0.34, 0.0, abs(uv.y - (1.28 - t * 1.55)));
  float pool = smoothstep(0.92, 0.0, distance(uv, vec2(0.42, 1.06)));
  vec3  brass = vec3(0.784, 0.604, 0.357);
  col += brass * (band * 0.085 + pool * 0.20) * uReveal;

  // Vignette — keeps the corners in shadow so overlaid text stays legible.
  float vig = smoothstep(1.18, 0.34, distance(uv, vec2(0.5)));
  col *= mix(0.68, 1.0, vig);

  // Grain. Tied to fract(uTime) so it shimmers without strobing.
  float g = hash(gl_FragCoord.xy + fract(uTime) * 137.0);
  col += (g - 0.5) * 0.030;

  gl_FragColor = vec4(col, 1.0);
}
`;
