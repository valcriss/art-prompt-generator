import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        ink: '#07111f',
        mist: '#c6d3e6',
        glow: '#8bd3ff',
        peach: '#f7a072',
        aurora: '#83f5c9',
        panel: 'rgba(10, 18, 33, 0.78)',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        haze: '0 20px 60px rgba(3, 10, 25, 0.45)',
      },
      backgroundImage: {
        mesh:
          'radial-gradient(circle at top left, rgba(139, 211, 255, 0.2), transparent 32%), radial-gradient(circle at 80% 0%, rgba(247, 160, 114, 0.18), transparent 30%), linear-gradient(180deg, rgba(7, 17, 31, 0.95), rgba(3, 8, 17, 1))',
      },
    },
  },
  plugins: [],
} satisfies Config
