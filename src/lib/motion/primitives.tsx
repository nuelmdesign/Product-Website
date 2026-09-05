'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useAnimates } from './capability';

let registered = false;
function register() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  registered = true;
}

const ENTRANCE = 'expo.out';        // matches --e-entrance
const START = 'top 82%';

/* ==================================================================
   MO.01 — mask-up
   Lines in overflow:hidden, translateY(110%) -> 0. 900ms, 70ms stagger.
   Every display heading and the manifesto.
   ================================================================== */
export function MaskUp({
  as: Tag = 'p',
  children,
  className,
  delay = 0,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const animates = useAnimates();

  useEffect(() => {
    const el = ref.current;
    if (!el || !animates) return;

    register();
    let split: SplitText | null = null;
    let st: ScrollTrigger | null = null;
    let cancelled = false;

    // Splitting before the webfont lands breaks lines at the wrong words.
    document.fonts.ready.then(() => {
      if (cancelled || !ref.current) return;

      split = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'line-mask' });

      const tween = gsap.from(split.lines, {
        yPercent: 110,
        duration: 0.9,
        ease: ENTRANCE,
        stagger: { each: 0.07, amount: Math.min(split.lines.length * 0.07, 0.56) },
        delay,
        paused: true,
      });

      st = ScrollTrigger.create({ trigger: el, start: START, once: true, onEnter: () => tween.play() });
    });

    return () => {
      cancelled = true;
      st?.kill();
      split?.revert();
    };
  }, [animates, delay]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/* ==================================================================
   MO.02 — image-veil
   clip-path inset(0 0 100% 0) -> inset(0) while the inner image scales
   1.14 -> 1. The counter-scale is what sells it: the image was always
   there, the wall moved.
   ================================================================== */
export function Veil({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const animates = useAnimates();

  useEffect(() => {
    const el = ref.current;
    if (!el || !animates) return;

    register();
    const inner = el.querySelector('img, video, [data-veil-inner]');

    const tl = gsap.timeline({
      paused: true,
      defaults: { duration: 1.2, ease: ENTRANCE },
    });
    tl.from(el, { clipPath: 'inset(0 0 100% 0)' }, 0);
    if (inner) tl.from(inner, { scale: 1.14 }, 0);

    const st = ScrollTrigger.create({
      trigger: el,
      start: START,
      once: true,
      onEnter: () => tl.delay(delay).play(),
    });

    return () => {
      st.kill();
      tl.kill();
    };
  }, [animates, delay]);

  return (
    <div ref={ref} className={`veil ${className ?? ''}`.trim()}>
      {children}
    </div>
  );
}

/* ==================================================================
   MO.05 — meta-in
   letter-spacing 0.40em -> 0.14em with opacity. Reads as a label being
   SET rather than fading in. Mono micro-labels only.
   ================================================================== */
export function MetaIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const animates = useAnimates();

  useEffect(() => {
    const el = ref.current;
    if (!el || !animates) return;

    register();
    const tween = gsap.from(el, {
      letterSpacing: '0.40em',
      opacity: 0,
      duration: 0.7,
      ease: ENTRANCE,
      delay,
      paused: true,
    });

    const st = ScrollTrigger.create({ trigger: el, start: START, once: true, onEnter: () => tween.play() });

    return () => {
      st.kill();
      tween.kill();
    };
  }, [animates, delay]);

  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}

/* ==================================================================
   MO.06 — counter
   Counts from zero on entry, 1200ms. tabular-nums in the caller's CSS
   keeps the width from jittering mid-count.
   ================================================================== */
export function Counter({
  value,
  className,
  suffix = '',
  prefix = '',
}: {
  value: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const animates = useAnimates();

  useEffect(() => {
    const el = ref.current;
    if (!el || !animates) return;

    register();
    const box = { n: 0 };
    const tween = gsap.to(box, {
      n: value,
      duration: 1.2,
      ease: ENTRANCE,
      paused: true,
      onUpdate: () => {
        el.textContent = `${prefix}${Math.round(box.n).toLocaleString()}${suffix}`;
      },
    });

    const st = ScrollTrigger.create({ trigger: el, start: START, once: true, onEnter: () => tween.play() });

    return () => {
      st.kill();
      tween.kill();
      // Restore the resting value so a re-render never leaves a partial count.
      el.textContent = `${prefix}${value.toLocaleString()}${suffix}`;
    };
  }, [animates, value, prefix, suffix]);

  // SSR and the no-motion path both render the final value.
  return (
    <span ref={ref} className={className}>
      {`${prefix}${value.toLocaleString()}${suffix}`}
    </span>
  );
}
