/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Shared color system for statuses
        posted: '#9ca3af',      // Tailwind gray-400
        claimed: '#f59e0b',     // Tailwind amber-500
        picked_up: '#3b82f6',   // Tailwind blue-500
        delivered: '#10b981',   // Tailwind green-500
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
