'use client';

import { useLenis } from '@/lib/motion/useLenis';

/** Mounts the shared Lenis + GSAP ticker. Renders nothing. */
export function SmoothScroll() {
  useLenis();
  return null;
}
