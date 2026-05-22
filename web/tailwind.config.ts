import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#060912",
          surface: "#0f172a",
          raised: "#1a2336",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(245,158,11,0.25), 0 12px 40px -12px rgba(245,158,11,0.45)",
        "glow-indigo": "0 0 0 1px rgba(99,102,241,0.3), 0 12px 40px -12px rgba(99,102,241,0.5)",
      },
    },
  },
  plugins: [],
} satisfies Config;
