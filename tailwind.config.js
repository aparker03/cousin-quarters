/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/layout/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeInDown: {
          '0%': { opacity: 0, transform: 'translateY(-20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-down': 'fadeInDown 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};
