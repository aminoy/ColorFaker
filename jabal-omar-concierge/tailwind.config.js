/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Jabal Omar Primary Brand Color (replaces gold throughout) ──
        // text-gold-*, bg-gold-*, fill-gold-* → Emerald Green
        gold: {
          50:  '#f0faf5',
          100: '#d4f2e6',
          200: '#a8e4ce',
          300: '#72cfae',
          400: '#4ab893',   // Emerald Green (main)
          500: '#3da07e',
          600: '#2e8066',
          700: '#226051',
          800: '#1a4a3d',
          900: '#12352b',
        },
        // ── Full Jabal Omar Brand Palette ──
        jo: {
          midnight:  '#354d62',   // Midnight Blue
          emerald:   '#4ab893',   // Emerald Green
          violet:    '#6b4877',   // Violet Dawn
          redclay:   '#df6a51',   // Red Clay
          herbal:    '#8c9d6a',   // Herbal Green
          parchment: '#e6e9e4',   // Parchment
        },
        // ── Background palette (replaces haram) ──
        haram: {
          dark:  '#1c2d3a',   // Deep Midnight Blue
          mid:   '#243847',
          light: '#354d62',   // Midnight Blue
        },
      },
      fontFamily: {
        arabic: ['Noto Naskh Arabic', 'serif'],
      },
    },
  },
  plugins: [],
}
