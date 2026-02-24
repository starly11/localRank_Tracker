/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#111111',
        'surface-hover': '#1A1A1A',
        accent: '#8B5CF6',
        'accent-hover': '#7C3AED',
        success: '#22C55E',
        danger: '#F43F5E',
        'text-primary': '#FFFFFF',
        'text-secondary': '#71717A',
        border: '#27272A',
      },
    },
  },
  plugins: [],
}
