/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF5EC",
        "cream-dark": "#F0E8D8",
        forest: "#1E4D35",
        "forest-light": "#2A6347",
        coral: "#E8603A",
        "coral-dark": "#D4522F",
        brand: "#1C1C1C",
      },
      fontFamily: {
        heading: ["Montserrat", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
