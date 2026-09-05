import Link from 'next/link';

/**
 * The wordmark. There is no drawn logo — the mark IS the typography:
 * Instrument Serif, sentence case, with the period set in brass.
 *
 * The period is doing the work. It turns a name into a statement and gives
 * the mark a single point of colour that ties back to the light falling
 * through every image on the site.
 *
 * Instrument Serif is drawn for display sizes, so it needs positive
 * tracking as it gets smaller and negative tracking as it gets larger —
 * hence the per-size letter-spacing rather than one value.
 */
export function Wordmark({
  size = 'sm',
  as = 'link',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  as?: 'link' | 'text';
  className?: string;
}) {
  const content = (
    <>
      Casa del Espacio<span className="wordmark__stop">.</span>
    </>
  );
  const cls = `wordmark wordmark--${size} ${className ?? ''}`.trim();

  if (as === 'text') return <span className={cls}>{content}</span>;
  return (
    <Link href="/" className={cls} aria-label="Casa del Espacio, home">
      {content}
    </Link>
  );
}
