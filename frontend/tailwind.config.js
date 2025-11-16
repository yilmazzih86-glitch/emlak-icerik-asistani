/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        spektrum: {
          purple: "#5A20CB",
          orange: "#ff6b35",
          dark: "#1C1C1C",
        },
      },
    },
  },
  plugins: [],
};
