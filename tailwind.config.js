/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF5EC",
        "cream-dark": "#F0E8D8",
        /** Align with pupchef.ae marketing tokens */
        forest: "#173B33",
        "forest-light": "#1E4D42",
        coral: "#F2674B",
        "coral-dark": "#E0553A",
        brand: "#1C1C1C",
        /** Farmer's Dog–style login primary button */
        "login-grey": "#6d6e71",
        "login-muted": "#6d6e71",
      },
      fontFamily: {
        heading: ["Montserrat", "var(--font-montserrat)", "sans-serif"],
        body: ["Montserrat", "Inter", "sans-serif"],
        display: ["Alike", "var(--font-alike)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
