/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf9f2',
          100: '#f6f1df',
          200: '#eee2bd',
          300: '#e3cb92',
          400: '#d7b065',
          500: '#c8963e',
          600: '#b47c32',
          700: '#915c2a',
          800: '#774a27',
          900: '#633e24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
