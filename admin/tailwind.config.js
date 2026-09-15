/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        shams: {
          green: '#17382F',
          'green-dark': '#102820',
          'green-light': '#214D41',
          cream: '#F4EEE3',
          'cream-light': '#FAF7F1',
          chai: '#9D542F',
          terracotta: '#C67548',
          gold: '#C89B4B',
          black: '#171815',
          muted: '#65675F',
          line: '#D8CFC2',
          surface: '#FFFFFF',
          card: '#FFFFFF'
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(23, 56, 47, 0.05)',
        'card': '0 8px 30px rgba(23, 56, 47, 0.06)',
        'elevated': '0 20px 40px -10px rgba(23, 56, 47, 0.08)',
      }
    },
  },
  plugins: [],
}
