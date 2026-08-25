/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vault: {
          bg: '#FFFDF8',
          card: '#FFF9EE',
          cardHover: '#FFF4E0',
          border: '#EFE6D5',
          darkBg: '#16181D',
          darkCard: '#1E222B',
          darkCardHover: '#252B37',
          darkBorder: '#2C323F',
        },
        gold: {
          50: '#FDF8E8',
          100: '#FAF1D1',
          200: '#F4E3A3',
          300: '#EED475',
          400: '#E9C647',
          500: '#E9B949', // Primary Muted Gold
          600: '#D4A32D',
          700: '#B0831E',
          800: '#8A6419',
          900: '#694B15',
        },
        sage: {
          50: '#F4F7F5',
          100: '#E4ECE6',
          200: '#C7D9CC',
          300: '#A4C0AC',
          400: '#7FA38A',
          500: '#4F7A5A', // Accent Sage Green
          600: '#3E6147',
          700: '#314C38',
          800: '#253A2B',
          900: '#1C2B20',
        },
        slateText: {
          light: '#2D3748',
          muted: '#718096',
          dark: '#F7FAFC',
          darkMuted: '#A0AEC0',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'card': '18px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 12px -2px rgba(45, 55, 72, 0.04), 0 2px 4px -2px rgba(45, 55, 72, 0.02)',
        'card-hover': '0 8px 24px -4px rgba(45, 55, 72, 0.08), 0 4px 8px -2px rgba(45, 55, 72, 0.03)',
      },
    },
  },
  plugins: [],
}
