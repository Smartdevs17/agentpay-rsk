import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary":         "#0052FF",
        "primary-light":   "#6366F1",
        "rsk-orange":      "#FF6B00",
        "rsk-orange-light":"#FF8C33",
        "rsk-dark":        "#0D0D0D",
        "rsk-slate":       "#0F172A",
        "rsk-card":        "#161616",
        "rsk-border":      "#2A2A2A",
        "rsk-gray":        "#8A8A8A",
        "rsk-green":       "#22C55E",
        "rsk-red":         "#EF4444",
        "rsk-yellow":      "#EAB308",
        "purple-accent":   "#A855F7",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Sora", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Space Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-premium": "linear-gradient(135deg, #FF6B00 0%, #A855F7 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
