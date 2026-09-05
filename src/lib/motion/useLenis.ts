'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCapability } from './capability';

/**
 * Sheet B.01 — Lenis on desktop only.
 *
 * Smooth-scroll libraries on touch devices are a battery and jank tax for
 * no perceived gain: the platform already does this well. So we gate on
 * pointer:fine and let phones scroll natively.
 *
 * Lenis and ScrollTrigger must share one RAF loop, or they fight over
 * scroll position and triggers fire against stale values.
 */
export function useLenis(): void {
  const { reducedMotion, measured } = useCapability();

  useEffect(() => {
    if (!measured || reducedMotion) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      syncTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [measured, reducedMotion]);
}
