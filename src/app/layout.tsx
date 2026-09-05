import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { fontVariables } from '@/lib/fonts';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { SiteFooter } from '@/components/chrome/SiteFooter';
import { ProgressHairline } from '@/components/chrome/ProgressHairline';
import { SmoothScroll } from '@/components/chrome/SmoothScroll';

export const metadata: Metadata = {
  title: {
    default: 'Casa del Espacio — Architecture & Interior',
    template: '%s · Casa del Espacio',
  },
  description:
    'Casa del Espacio designs spaces that feel like they were always meant to be there. Architecture and interior, grounded in simplicity and guided by light.',
};

export const viewport: Viewport = {
  themeColor: '#14100D',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <SmoothScroll />
        <ProgressHairline />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
