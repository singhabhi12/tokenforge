/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#9AA5FA',
        accent: '#C0C6FC',
        soft: '#E0E4FC',
        text: '#1F1F1F'
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif']
      }
    }
  },
  plugins: []
}