/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      'game': ['Space Grotesk']
    },
    extend: {},
  },
  plugins: [require("tailwind-scrollbar"), require("tailwindcss-animate")],
};
