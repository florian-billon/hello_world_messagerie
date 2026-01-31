import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyberCyan: "#4fdfff",
        cyberMint: "#5df2c6",
        cyberRed: "#a00000",
        cyberRedHover: "#c00000",
      },
    },
  },
  plugins: [],
};

export default config;

