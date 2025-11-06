/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'accent-violet': 'var(--accent-violet)',
        'accent-blue': 'var(--accent-blue)',
        'accent-rose': 'var(--accent-rose)',
        'accent-red': 'var(--accent-red)',
        'text-primary': 'var(--text-primary)',
        'text-gray': 'var(--text-gray)',
      },
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}