import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta neutra y clara, con un acento verde-esmeralda (cesped/estadio)
        // que funciona bien sobre fondos claros y para estados de "favorito".
        cream: {
          50: "#fdfcfa",
          100: "#f7f5f1",
          200: "#efebe3",
        },
        ink: {
          900: "#1c1b1a",
          700: "#403e3b",
          500: "#6b6864",
          300: "#a39e97",
        },
        accent: {
          50: "#eefcf3",
          100: "#d7f7e3",
          400: "#3ecb7e",
          500: "#22b06a",
          600: "#178b53",
          700: "#116b41",
        },
        favorite: {
          500: "#e0533d",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(28, 27, 26, 0.04), 0 4px 16px rgba(28, 27, 26, 0.06)",
        "card-hover": "0 2px 4px rgba(28, 27, 26, 0.06), 0 8px 24px rgba(28, 27, 26, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
