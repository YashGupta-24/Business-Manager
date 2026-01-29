import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5D5CDE",       // Soft Indigo
        primaryHover: "#4A49B8",
        dark: "#2C3E50",          // Deep Navy
        light: "#F5F7FA",         // Background Gray
        muted: "#95A5A6",         // Text Gray
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [
    tailwindcss(),
  ],
})