import type { ReactNode } from 'react';

/** Sheet A.03 — the 12 / 6 / 4 column field, capped at --content-max. */
export function Field({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`field ${className ?? ''}`.trim()}>{children}</div>;
}
