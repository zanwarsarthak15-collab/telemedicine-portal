/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#1A73E8',
          'blue-hover': '#1557B0',
          'blue-light': '#E8F0FE',
          green: '#34A853',
          'green-light': '#CEEAD6',
          'green-hover': '#1E8E3E',
          yellow: '#FBBC04',
          'yellow-light': '#FEF7E0',
          red: '#EA4335',
          'red-light': '#FCE8E6',
          canvas: '#F8F9FA',
          surface: '#F1F3F4',
          border: '#DADCE0',
          dark: '#202124',
          gray: '#5F6368',
          'gray-light': '#80868B',
        }
      },
      fontFamily: {
        sans: ['"Google Sans"', 'Roboto', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'google-1': '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
        'google-2': '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
        'google-3': '0 2px 6px 2px rgba(60,64,67,0.15), 0 8px 12px 6px rgba(60,64,67,0.15)',
        'google-card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      }
    },
  },
  plugins: [],
}
