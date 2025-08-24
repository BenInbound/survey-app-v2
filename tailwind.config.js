/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Hot Pink
        primary: {
          50: '#FFF0F6',
          100: '#FFDEE9',
          200: '#FFBDD3',
          300: '#FF9BBC',
          400: '#FF78A6',
          500: '#FF5590',
          600: '#ff0056',
          700: '#E6004D',
          800: '#CC0044',
          900: '#B3003B',
        },
        // Secondary - Warm Amber
        secondary: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // Neutral - Warm-tinted grays
        neutral: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        // Semantic colors
        success: '#059669',
        warning: '#EA580C',
        error: '#DC2626',
        info: '#0891B2',
        // Custom background
        'custom-gray': '#F8F8F4'
      },
      fontFamily: {
        'sans': ['Kumbh Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}