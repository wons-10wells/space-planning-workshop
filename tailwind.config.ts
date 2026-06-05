import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211c",
        moss: "#5a6f4f",
        coral: "#d96c4c",
        linen: "#f6f1e8",
        fog: "#e8ece6",
        graphite: "#2d3130"
      },
      boxShadow: {
        panel: "0 12px 30px rgba(23, 33, 28, 0.08)"
      }
    },
  },
  plugins: [],
};

export default config;
