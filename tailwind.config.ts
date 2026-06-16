import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        burgundy: "#7A3E3A",
        forest: "#2F5D3A",
        stone: "#D8C3A5",
        cream: "#F7F3EA",
        ink: "#333333"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(51, 51, 51, 0.12)"
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Arial", "sans-serif"]
      }
    }
  },
  plugins: [forms]
};

export default config;
