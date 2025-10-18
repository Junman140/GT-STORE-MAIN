/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1D4ED8",  // primary
          dark: "#1D4ED8",  // darker accent
          pale: "#EFF6FF"   // subtle backgrounds/sections
        }
      },
      boxShadow: {
        soft: "0 6px 20px rgba(0,0,0,0.06)"
      },
      borderRadius: {
        '2xl': '1.25rem'
      }
    },
  },
  plugins: [],
}
