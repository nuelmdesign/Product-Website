import Link from 'next/link';
import { MetaLabel } from '@/components/type/MetaLabel';

const COLUMNS = [
  { title: 'Site', links: [
    { href: '/work', label: 'Work' },
    { href: '/studio', label: 'Studio' },
    { href: '/services', label: 'Services' },
    { href: '/journal', label: 'Journal' },
    { href: '/contact', label: 'Contact' },
  ]},
];

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <Link href="/" className="footer__mark">
          Casa del Espacio<span className="header__stop">.</span>
        </Link>

        {COLUMNS.map((col) => (
          <div className="footer__col" key={col.title}>
            <MetaLabel>{col.title}</MetaLabel>
            <ul>
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="footer__link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="footer__col">
          <MetaLabel>Studio</MetaLabel>
          {/* Placeholder — real details pending, see design/asset-brief.md */}
          <p className="footer__note">Contact details to follow.</p>
        </div>
      </div>

      <div className="footer__base">
        <MetaLabel>&copy; {new Date().getFullYear()} Casa del Espacio</MetaLabel>
        <MetaLabel>Architecture &amp; Interior</MetaLabel>
      </div>
    </footer>
  );
}
