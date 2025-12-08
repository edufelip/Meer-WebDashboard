import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        highlight: "#B55D05",
        background: "#FFFFFF",
        section: "#F3F4F6",
        textDark: "#374151",
        textSubtle: "#6B7280",
        accent: "#EC4899"
      }
    }
  },
  plugins: []
};

export default config;
