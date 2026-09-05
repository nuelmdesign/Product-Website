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
    let cancelled = false;

    // Splitting before the webfont lands breaks lines at the wrong words.
    document.fonts.ready.then(() => {
      if (cancelled || !ref.current) return;

      split = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'line-mask' });

      gsap.fromTo(
        split.lines,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.9,
          ease: ENTRANCE,
          immediateRender: false,
          stagger: { each: 0.07, amount: Math.min(split.lines.length * 0.07, 0.56) },
          delay,
          scrollTrigger: { trigger: el, start: START, once: true },
        },
      );
    });

    return () => {
      cancelled = true;
      ScrollTrigger.getAll().forEach((t) => { if (t.trigger === el) t.kill(); });
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
      delay,
      defaults: { duration: 1.2, ease: ENTRANCE, immediateRender: false },
      scrollTrigger: { trigger: el, start: START, once: true },
    });
    tl.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }, 0);
    if (inner) tl.fromTo(inner, { scale: 1.14 }, { scale: 1 }, 0);

    return () => {
      tl.scrollTrigger?.kill();
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
    const tween = gsap.fromTo(
      el,
      { letterSpacing: '0.40em', opacity: 0 },
      {
        letterSpacing: '0.14em',
        opacity: 1,
        duration: 0.7,
        ease: ENTRANCE,
        immediateRender: false,
        delay,
        scrollTrigger: { trigger: el, start: START, once: true },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
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
