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
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          hover: 'var(--secondary-hover)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
        },
        background: 'var(--background)',
        card: 'var(--card)',
        text: {
          DEFAULT: 'var(--text)',
          secondary: 'var(--text-secondary)',
        },
        border: 'var(--border)',
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
