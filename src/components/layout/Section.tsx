import type { ReactNode } from 'react';

/**
 * Sheet A.03 — vertical rhythm and the tone inversion.
 *
 * tone="light" flips the section onto linen and re-points the text tokens
 * (see [data-tone="light"] in globals.css). There is no separate type
 * system for light sections — only the ground and the text tokens change.
 */
export function Section({
  children,
  tone = 'dark',
  id,
  className,
  bleed = false,
  flush = false,
}: {
  children: ReactNode;
  tone?: 'dark' | 'light';
  id?: string;
  className?: string;
  /** Skip the gutter — for full-bleed media. */
  bleed?: boolean;
  /** Drop the leading rhythm — for a hero that opens the page. */
  flush?: boolean;
}) {
  return (
    <section
      id={id}
      data-tone={tone}
      className={`section ${bleed ? 'section--bleed' : ''} ${flush ? 'section--flush' : ''} ${className ?? ''}`.trim()}
    >
      {children}
    </section>
  );
}
