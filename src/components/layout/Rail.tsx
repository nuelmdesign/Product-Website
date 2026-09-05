'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * MO.04 — rail.
 *
 * Horizontal services / journal rail. Pointer drag, shift-wheel, prev/next
 * buttons, snap to card start. Arrow keys move one card and focus scrolls
 * into view, so it is operable without a mouse.
 *
 * Built on native overflow scrolling rather than a transform, so the
 * scrollbar, keyboard, and screen readers all behave without special-casing.
 */
export function Rail({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 2);
  }, []);

  const step = useCallback((dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-rail-item]');
    const gap = parseFloat(getComputedStyle(el).columnGap || '0') || 0;
    const amount = card ? card.offsetWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: amount * dir, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    sync();

    // Pointer drag. Ignored for coarse pointers, which already pan natively.
    let down = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      down = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) {
        moved = true;
        el.setPointerCapture(e.pointerId);
        el.style.cursor = 'grabbing';
        el.style.scrollSnapType = 'none';
      }
      el.scrollLeft = startScroll - dx;
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      down = false;
      el.style.cursor = '';
      el.style.scrollSnapType = '';
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    // A drag must not also fire the link inside the card it started on.
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };

    // Shift-wheel is the conventional horizontal gesture; honour it explicitly
    // so Lenis does not swallow the event on desktop.
    const onWheel = (e: WheelEvent) => {
      if (!e.shiftKey) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('click', onClick, true);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', sync, { passive: true });

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('click', onClick, true);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', sync);
    };
  }, [sync]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  };

  return (
    <div className={className}>
      <div
        ref={ref}
        className="rail"
        role="group"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>

      <div className="rail__nav">
        <button type="button" className="rail__btn" onClick={() => step(-1)} disabled={atStart} aria-label="Previous">
          <span aria-hidden="true">&larr;</span>
        </button>
        <button type="button" className="rail__btn" onClick={() => step(1)} disabled={atEnd} aria-label="Next">
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
}
