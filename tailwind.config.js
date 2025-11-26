/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Yollr Brand Colors
        'electric-peach': {
          DEFAULT: '#FF7A5C',
          glow: 'rgba(255, 122, 92, 0.5)',
        },
        'cosmic-pink': {
          DEFAULT: '#FF5FCC',
          glow: 'rgba(255, 95, 204, 0.5)',
        },
        'cyan-pop': {
          DEFAULT: '#00E9FF',
          glow: 'rgba(0, 233, 255, 0.5)',
        },
        'lime-pop': {
          DEFAULT: '#C8FF3D',
          glow: 'rgba(200, 255, 61, 0.5)',
        },
        midnight: {
          DEFAULT: '#0A0A0C',
          50: '#F6F6F8',
          100: '#E5E5E7',
          200: '#CFCFD3',
          300: '#AFAFB5',
          400: '#8F8F97',
          500: '#6F6F79',
          600: '#4F4F5B',
          700: '#3A3A42',
          800: '#232325',
          900: '#0A0A0C',
        },
        graphite: {
          DEFAULT: '#232325',
          50: '#F8F8F9',
          100: '#E8E8E9',
          200: '#D1D1D3',
          300: '#B3B3B7',
          400: '#95959B',
          500: '#777780',
          600: '#595964',
          700: '#3D3D45',
          800: '#232325',
          900: '#0F0F10',
        },
        cloud: {
          DEFAULT: '#F6F6F8',
          50: '#FFFFFF',
          100: '#FEFEFE',
          200: '#F6F6F8',
          300: '#E8E8EB',
          400: '#DADADE',
          500: '#CCCBD1',
          600: '#BEBEC4',
          700: '#B0B0B7',
          800: '#A2A2AA',
          900: '#94949D',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-down': 'slideDown 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px var(--glow-color)' },
          '100%': { boxShadow: '0 0 20px var(--glow-color)' },
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
};