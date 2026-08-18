/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Oswald', 'Arial Narrow', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        timber: {
          bark: '#1a1207',
          ember: '#8a5a2b',
          sap: '#c8925a',
          cream: '#f5ede1',
        },
      },
    },
  },
  plugins: [],
}
