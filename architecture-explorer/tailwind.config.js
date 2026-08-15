/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // BID Trust brand — navy ground, green reserved for verification state.
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
