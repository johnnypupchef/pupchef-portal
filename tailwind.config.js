/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Forest */
        forest: {
          DEFAULT: "#173B33",
          light: "#1E4D42",
          deep: "#0F2A24",
        },
        /* Orange (CTA) */
        orange: {
          DEFAULT: "#F2674B",
          dark: "#E0553A",
        },
        coral: "#F2674B",
        "coral-dark": "#E0553A",
        /* Cream surfaces */
        cream: {
          DEFAULT: "#FFF3E1",
          light: "#FCF7F1",
          warm: "#F5EBDB",
          edge: "#EDE2CE",
          dark: "#EDE2CE",
        },
        /* Ink (text) */
        ink: {
          DEFAULT: "#1A1A17",
          soft: "#3F3F3F",
          muted: "#6B6359",
          faint: "#9C8B7E",
        },
        /* Lines */
        line: {
          DEFAULT: "#EAE2D2",
          soft: "#F2EAD9",
        },
        /* Accents */
        plum: "#6B4A6E",
        sage: "#8FA68A",
        amber: "#D4925A",
        terracotta: "#C8543A",
        /* Legacy */
        brand: "#1A1A17",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        ui: ["Manrope", "system-ui", "sans-serif"],
        body: ["Manrope", "system-ui", "sans-serif"],
        heading: ["Fraunces", "Georgia", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "10px",
        md: "14px",
        lg: "20px",
        xl: "28px",
        pill: "999px",
      },
      boxShadow: {
        "sh-1": "0 1px 0 rgba(23,59,51,0.04), 0 1px 2px rgba(23,59,51,0.04)",
        "sh-2": "0 1px 0 rgba(23,59,51,0.04), 0 4px 12px rgba(23,59,51,0.06)",
        "sh-3": "0 8px 24px rgba(23,59,51,0.10)",
        "sh-hero": "0 12px 32px rgba(23,59,51,0.18)",
      },
      letterSpacing: {
        tightish: "-0.025em",
        eyebrow: "0.14em",
      },
    },
  },
  plugins: [],
};
