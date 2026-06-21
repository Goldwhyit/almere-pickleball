/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Almere Pickleball brand colors - FROM LOGO
        primary: {
          50: '#e8f3fc',
          100: '#d0e7f9',
          200: '#a1cef3',
          300: '#72b6ed',
          400: '#439de7',
          500: '#1485d8', // Main blue from logo
          600: '#106ab0',
          700: '#0c5088',
          800: '#083560',
          900: '#041b38',
        },
        accent: {
          50: '#fee2e2',
          100: '#fecaca',
          200: '#fca5a5',
          300: '#f87171',
          400: '#ef4444',
          500: '#e31c24', // Main red from logo
          600: '#b91c1c',
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#450a0a',
        },
        // Pickleball yellow (from ball in logo)
        ball: {
          400: '#facc15',
          500: '#eab308',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
