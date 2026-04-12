/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf9ec',
          100: '#faf0cc',
          200: '#f5de8a',
          300: '#f0cb4e',
          400: '#ecba28',
          500: '#d4a017',
          600: '#b07c10',
          700: '#8a5c0f',
          800: '#724912',
          900: '#623d14',
        },
        haram: {
          dark:  '#1a1208',
          mid:   '#2d1f0a',
          light: '#3d2b0f',
        },
      },
      fontFamily: {
        arabic: ['Noto Naskh Arabic', 'serif'],
      },
    },
  },
  plugins: [],
}
