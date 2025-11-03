/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
        },
        surface: '#f9fafb',
        'tutor-message': '#f0f4ff',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '4xl': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }],
        'base': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'xs': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
}

