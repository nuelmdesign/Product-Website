import type { ReactNode } from 'react';

/** Sheet A.02 — 11px mono, 0.14em, uppercase. Data only, never decoration. */
export function MetaLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={`meta ${className ?? ''}`.trim()}>{children}</span>;
}

/**
 * The Villa Lumière coordinate stamp. Formats to four decimal places —
 * the precision is the point; it is what makes the page read as
 * architecture rather than a property listing.
 */
export function CoordinateStamp({ lat, lon }: { lat: number; lon: number }) {
  const fmt = (v: number, pos: string, neg: string) =>
    `${Math.abs(v).toFixed(4)}° ${v >= 0 ? pos : neg}`;
  return (
    <span className="meta coords">
      {fmt(lat, 'N', 'S')},<br />
      {fmt(lon, 'E', 'W')}
    </span>
  );
}
