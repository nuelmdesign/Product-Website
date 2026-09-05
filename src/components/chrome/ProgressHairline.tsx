'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Sheet B.01 — page transitions.
 *
 * A 2px brass hairline instead of a full curtain wipe. The wipe taxes every
 * navigation with ~700ms for a trick the visitor enjoys twice and resents
 * thereafter; this costs nothing and still signals that something happened.
 */
export function ProgressHairline() {
  const pathname = usePathname();
  const [state, setState] = useState<'idle' | 'running' | 'done'>('idle');
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setState('running');
    const done = window.setTimeout(() => setState('done'), 240);
    const clear = window.setTimeout(() => setState('idle'), 720);
    return () => {
      window.clearTimeout(done);
      window.clearTimeout(clear);
    };
  }, [pathname]);

  return <div className="hairline" data-state={state} aria-hidden="true" />;
}
