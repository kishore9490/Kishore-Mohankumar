import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0F2440', deep: '#0A1B31', mid: '#12325F', soft: '#143257' },
        // Verification green. Reserved for verification state — never decoration.
        verify: { DEFAULT: '#16A34A', bright: '#22C55E', soft: '#E8F5ED' },
        brand: { DEFAULT: '#1560D8', bright: '#2E9BF5' },
        ink: { DEFAULT: '#0F2440', dim: '#5A6E88', faint: '#8296AD' },
        line: '#E5EAF0',
        canvas: '#F4F7FA',
      },
      fontFamily: {
        sans: ['ui-sans-serif', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
