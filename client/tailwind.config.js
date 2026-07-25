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
        // Shared color system for statuses
        posted: '#9ca3af',      // Tailwind gray-400
        claimed: '#f59e0b',     // Tailwind amber-500
        picked_up: '#3b82f6',   // Tailwind blue-500
        delivered: '#10b981',   // Tailwind green-500
        primary: '#1E4D3D',
        secondary: '#4E6E58',
        accent: '#D97706',
        surface: '#F5F6F8',
        card: '#FFFFFF',
        text: '#222222',
        border: '#DADFE5',
        'bg-dark': '#111924',
        'surface-dark': '#17212A',
        'text-dark': '#F8FAFC',
        'border-dark': '#2F3B4A',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
