const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Map pink and purple heavily used in UI to red to change the whole theme instantly
        pink: colors.red,
        purple: colors.red,
        
        primary: {
          500: '#3b82f6',
          600: '#2563eb',
        },
        dark: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        },
        brand: {
          magenta: '#c1272d', // Changed to red per user request
          red: '#c1272d',
          yellow: '#ffc107',
          blue: '#1a237e',
          teal: '#00acc1',
          bgLight: '#f8f9fa',
          sidebarBg: '#ffffff',
          cardBg: '#ffffff',
        }
      }
    },
  },
  plugins: [],
}
