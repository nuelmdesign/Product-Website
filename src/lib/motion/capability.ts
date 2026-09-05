'use client';

import { useEffect, useState } from 'react';

/**
 * Sheet B.02 — the fallback ladder.
 *
 *   T1  full shader   pointer:fine, no reduced-motion, >=4 cores, WebGL2 acquired
 *   T2  CSS only      gradient light-fall, brightness hover
 *   T3  static        plain optimised image, no effects
 *
 * The page must be complete and beautiful at T3. Shaders are a garnish,
 * never a dependency — so the SERVER always renders T3 and the client
 * upgrades after mount. A JS failure leaves finished content on screen.
 */
export type Tier = 1 | 2 | 3;

export interface Capability {
  tier: Tier;
  /** Governs every GSAP timeline, not just the shaders. */
  reducedMotion: boolean;
  /** False until the client has measured. Server and first paint are T3. */
  measured: boolean;
}

const STATIC: Capability = { tier: 3, reducedMotion: true, measured: false };

function canWebGL2(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    if (!gl) return false;
    // Release immediately — we only wanted to know it initialises.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function measure(): Capability {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return { tier: 3, reducedMotion: true, measured: true };

  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const cores = navigator.hardwareConcurrency ?? 2;

  if (finePointer && cores >= 4 && canWebGL2()) {
    return { tier: 1, reducedMotion: false, measured: true };
  }
  return { tier: 2, reducedMotion: false, measured: true };
}

export function useCapability(): Capability {
  const [cap, setCap] = useState<Capability>(STATIC);

  useEffect(() => {
    setCap(measure());

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setCap(measure());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return cap;
}

/** Convenience: true when GSAP timelines are permitted to run. */
export function useAnimates(): boolean {
  const { reducedMotion, measured } = useCapability();
  return measured && !reducedMotion;
}
