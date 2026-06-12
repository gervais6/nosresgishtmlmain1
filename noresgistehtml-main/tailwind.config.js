/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': 'var(--primary)',
        'surface': 'var(--surface)',
        'surface-dim': 'var(--surface-dim)',
        'surface-container': 'var(--surface-container)',
        'on-surface': 'var(--on-surface)',
        'on-surface-variant': 'var(--on-surface-variant)',
      },
      fontFamily: { sans: ['Hanken Grotesk', 'sans-serif'] },
      maxWidth: { 'container-max': '1280px' },
      padding: { 'margin-desktop': '5%' },
      gap: { 'gutter': '24px' }
    },
  },
  plugins: [],
}
