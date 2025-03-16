/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // Indigo
        secondary: '#F59E0B', // Amber
        darkBg: '#1F2937', // Dark background
        darkText: '#F3F4F6', // Light text on dark background
        lightBg: '#F9FAFB', // Light background
        lightText: '#1F2937', // Dark text on light background
      },
    },
  },
  plugins: [],
}