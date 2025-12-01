/**
 * Yollr Color System - Solid Pantone 2025/26 Palette
 * Modern muted Gen-Z tones, no gradients
 */

export const colors = {
  // FOUNDATIONAL DARK MODE (Pantone: Techno-Shadow Family)
  'bg-primary': '#0B0D11',    // Blackened Steel Blue
  'bg-secondary': '#11141A',  // Digital Iron
  'bg-card': '#161A22',       // Urban Twilight

  // PRIMARY ACCENTS (Pantone 2025/26 Tech-Minimal Set)
  'accent-mint': '#A6F2D2',   // Soft Neo-Mint
  'accent-lilac': '#C7B8FF',  // Lilac Vapor
  'accent-coral': '#FF9082',  // Faded Living Coral 2025
  'accent-honey': '#F6C75B',  // Honey Dust
  'accent-blue': '#8ECFFF',   // Digital Ice Blue

  // SPORTS MODE SOLIDS
  'sport-blue': '#4D70FF',    // Stadium Blue
  'sport-red': '#FF6464',     // Matchday Red
  'sport-green': '#54D48A',   // Field Turf Green
  'sport-purple': '#A58BFF',  // Arena Purple

  // TEXT COLORS
  text: {
    primary: 'rgba(255,255,255,0.92)',
    secondary: 'rgba(255,255,255,0.65)',
    muted: 'rgba(255,255,255,0.45)',
    disabled: 'rgba(255,255,255,0.25)',
  },

  // ENERGY PALETTE (for high-engagement moments)
  energy: {
    lime: '#D4FF5C',     // Electric Lime
    pink: '#FF4DB8',     // Hyper Pink
    yellow: '#FFE656',   // Digital Yellow
  },

  // SEMANTIC COLORS
  semantic: {
    success: '#54D48A',
    warning: '#F6C75B',
    error: '#FF6464',
    info: '#8ECFFF',
  },
};

export type ColorKey = keyof typeof colors;
