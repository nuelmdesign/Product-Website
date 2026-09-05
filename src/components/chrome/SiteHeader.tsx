'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Wordmark } from '@/components/type/Wordmark';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Work' },
  { href: '/studio', label: 'Studio' },
  { href: '/services', label: 'Services' },
  { href: '/journal', label: 'Journal' },
];

/**
 * The CasaNueve header: wordmark with a period, a parenthetical descriptor,
 * nav as a comma-separated LIST rather than spaced links, and a text CTA
 * with a simple underline. The comma is what makes it read as a masthead
 * instead of a navbar.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on route change, and lock the page behind the open menu.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    return () => document.documentElement.classList.remove('menu-open');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="header">
      <Wordmark size="sm" className="header__mark" />

      <span className="header__descriptor">(Architecture &amp; Interior)</span>

      <nav className="header__nav" aria-label="Primary">
        {NAV.map((item, i) => (
          <span key={item.href}>
            <Link
              href={item.href}
              className="header__link"
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              {item.label}
            </Link>
            {i < NAV.length - 1 && <span aria-hidden="true">, </span>}
          </span>
        ))}
      </nav>

      <Link href="/contact" className="header__cta">
        <span>Start a project</span>
      </Link>

      <button
        type="button"
        className="header__toggle"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Close' : 'Menu'}
      </button>

      <div id="mobile-menu" className="menu" hidden={!open}>
        <nav aria-label="Primary, mobile">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="menu__link">
              {item.label}
            </Link>
          ))}
          <Link href="/contact" className="menu__link menu__link--cta">
            Start a project
          </Link>
        </nav>
      </div>
    </header>
  );
}
