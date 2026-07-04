/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        police: {
          dark: '#030712',      // Deep space black
          navy: '#0b1329',      // Dark slate navy
          blue: '#1c2541',      // Police navy blue
          accent: '#3a506b',    // Slate blue
          cyan: '#00f5d4',      // Neon cyan accent
          teal: '#00bbf9',      // Tech blue accent
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 245, 212, 0.4)',
        'glow-blue': '0 0 15px rgba(0, 187, 249, 0.4)',
      }
    },
  },
  plugins: [],
}
