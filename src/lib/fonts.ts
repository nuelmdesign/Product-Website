import { Instrument_Serif, Instrument_Sans, IBM_Plex_Mono } from 'next/font/google';

/**
 * Sheet A.02. Three voices, each with one job.
 * Self-hosted by next/font — no external stylesheet, no layout shift.
 */

export const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display-loaded',
  fallback: ['Iowan Old Style', 'Georgia', 'serif'],
});

export const sans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans-loaded',
  fallback: ['Helvetica Neue', 'Arial', 'sans-serif'],
});

export const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono-loaded',
  fallback: ['ui-monospace', 'SF Mono', 'monospace'],
});

export const fontVariables = [display.variable, sans.variable, mono.variable].join(' ');
