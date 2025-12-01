/**
 * Yollr Design Tokens
 * Spacing, shadows, radii, and other design primitives
 */

export const tokens = {
  // Border radius
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },

  // Shadows
  shadow: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.12)',
    md: '0 4px 16px rgba(0, 0, 0, 0.16)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.24)',
    xl: '0 12px 48px rgba(0, 0, 0, 0.32)',
    glow: {
      mint: '0 0 24px rgba(111, 242, 198, 0.4)',         // Neon Glacier Mint
      lilac: '0 0 24px rgba(200, 163, 255, 0.4)',        // Soft Tech Lilac
      coral: '0 0 24px rgba(255, 127, 110, 0.4)',        // Futura Coral
      honey: '0 0 24px rgba(255, 203, 71, 0.4)',         // Honey Pulse
      sky: '0 0 24px rgba(90, 184, 255, 0.4)',           // Cloudstream Blue
      energyLime: '0 0 24px rgba(200, 255, 78, 0.4)',    // Energy Lime
      energyPink: '0 0 24px rgba(255, 98, 200, 0.4)',    // Energy Pink
      athletics: '0 0 24px rgba(63, 107, 255, 0.4)',     // Sport Blue
    },
  },

  // Spacing scale (matches Tailwind)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
  },

  // Typography scale
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },

  // Font weights
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Animation durations
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },

  // Animation easings
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1200,
    popover: 1300,
    toast: 1400,
    tooltip: 1500,
  },

  // Glass-matte backdrop blur
  blur: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
} as const;

export type DesignToken = keyof typeof tokens;
