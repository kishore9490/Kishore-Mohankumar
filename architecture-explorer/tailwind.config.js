/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // BID Trust brand.
        //
        // `brand` is sampled from the supplied logo — the blue/silver shield.
        // It carries brand accents: active navigation, focus rings, primary
        // actions, brand messaging.
        //
        // `verify` (green) is NOT a brand colour. It is reserved exclusively
        // for verification state — verified checks, verify-tone nodes,
        // assessment bands. Keeping the two apart is what lets green carry
        // meaning rather than decoration.
        brand: {
          50: '#EEF5FF',
          100: '#D9E8FF',
          300: '#6FC4FF',
          400: '#2E9BF5',
          500: '#1B6FE0',
          600: '#1560D8',
          700: '#0F47A8',
          800: '#0A2E6E',
          900: '#0A2A5E',
          950: '#061A3C',
        },
        silver: {
          100: '#F4F8FC',
          200: '#DCE6F0',
          300: '#C0CEDD',
          400: '#9DB0C4',
        },
        navy: {
          950: '#050F1E',
          900: '#071528',
          850: '#0B1F3A',
          800: '#0E2440',
          700: '#122B4F',
          600: '#1B3A66',
          500: '#26507F',
        },
        verify: {
          DEFAULT: '#1DB954',
          bright: '#48D183',
          deep: '#0E7A34',
        },
        caution: '#F5A623',
        adverse: '#E5484D',
        counsel: '#A99CF0',
        ink: {
          DEFAULT: '#EDF3F9',
          dim: '#A9BCD1',
          faint: '#71879F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      keyframes: {
        pulseFlow: {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        pulseFlow: 'pulseFlow 1s linear infinite',
      },
    },
  },
  plugins: [],
}
