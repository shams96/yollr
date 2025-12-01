/**
 * Yollr Typography System
 * Inter font family with semantic text styles
 */

import { Inter } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const typography = {
  // Headings
  h1: {
    fontSize: '36px',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '30px',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: 1.5,
  },

  // Body text
  body: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  bodyLarge: {
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  bodySmall: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
  },

  // Metadata
  meta: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0.01em',
  },
  metaSmall: {
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: 1.3,
    letterSpacing: '0.01em',
  },

  // Labels
  label: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0.02em',
    textTransform: 'uppercase' as const,
  },

  // Buttons
  button: {
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '0.01em',
  },
  buttonSmall: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: 1.2,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
