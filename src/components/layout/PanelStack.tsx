'use client';

import { Children, useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAnimates } from '@/lib/motion/capability';

/**
 * MO.03 — panel-stack.
 *
 * The project index. Panels are sticky; as the next one slides over, the
 * outgoing panel scales to 0.94 and drops to brightness(0.55). Transform
 * and filter only, so it stays on the compositor.
 *
 * This is the most expensive-feeling move on the site and it costs no
 * WebGL. Without JS it degrades to plain stacked full-height sections,
 * which is still a perfectly good project index.
 */
export function PanelStack({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const animates = useAnimates();
  const count = Children.count(children);

  useEffect(() => {
    const wrap = ref.current;
    if (!wrap || !animates || count < 2) return;

    gsap.registerPlugin(ScrollTrigger);
    const panels = Array.from(wrap.querySelectorAll<HTMLElement>('[data-panel]'));

    const ctx = gsap.context(() => {
      panels.forEach((panel, i) => {
        if (i === panels.length - 1) return;
        const next = panels[i + 1];

        gsap.to(panel, {
          scale: 0.94,
          filter: 'brightness(0.55)',
          ease: 'none',
          scrollTrigger: {
            trigger: next,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        });
      });
    }, wrap);

    return () => ctx.revert();
  }, [animates, count]);

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, i) => (
        <div data-panel key={i} className="panel-stack__panel">
          {child}
        </div>
      ))}
    </div>
  );
}
