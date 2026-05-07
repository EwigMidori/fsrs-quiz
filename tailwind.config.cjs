/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        editorial: '0 28px 80px rgba(12, 10, 9, 0.08)',
      },
      colors: {
        canvas: 'var(--canvas)',
        ink: 'var(--ink)',
        body: 'var(--body)',
        hairline: 'var(--hairline)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Waldenburg', 'Cormorant Garamond', 'Times New Roman', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
