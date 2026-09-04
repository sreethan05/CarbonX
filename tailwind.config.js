/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F1F8F3',
          100: '#E2F0E5',
          200: '#C5E2CB',
          300: '#99CEAC',
          400: '#64B27F',
          500: '#2E7D32', // Earth Green
          600: '#236326',
          700: '#1B5E20', // Deep Forest Green
          800: '#144618',
          900: '#0E3111',
        },
        earth: {
          light: '#81C784',
          DEFAULT: '#2E7D32',
          dark: '#1B5E20',
        },
        soil: {
          light: '#8D6E63',
          DEFAULT: '#6D4C41',
          dark: '#4E342E',
        },
        sky: {
          light: '#E1F5FE',
          DEFAULT: '#4FC3F7',
          dark: '#0288D1',
        },
        carbon: {
          50: '#ECEFF1',
          500: '#546E7A',
          800: '#263238',
          900: '#1A2327',
        },
        warm: {
          white: '#FAFAF5',
          cream: '#F5F5E9',
        },
        profit: '#2E7D32',
        alert: '#F57C00',
        error: '#D32F2F',
        verifBlue: '#1976D2',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 4px 20px -2px rgba(27, 94, 32, 0.08), 0 2px 8px -1px rgba(0, 0, 0, 0.04)',
        card: '0 8px 30px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
