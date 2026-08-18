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
        brand: {
          primary: 'var(--brand-primary, #0f172a)',
          secondary: 'var(--brand-secondary, #2563eb)',
        }
      }
    },
  },
  plugins: [],
}
