/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        red: {
          team: '#dc2626',
        },
        blue: {
          team: '#2563eb',
        },
        neutral: '#6b7280',
        assassin: '#1f2937',
      },
    },
  },
  plugins: [],
}