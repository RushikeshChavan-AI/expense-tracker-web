/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B1220",
        "bg-soft": "#0F1A2E",
        surface: "rgba(255,255,255,0.05)",
        border: "rgba(255,255,255,0.09)",
        ink: "#E7EAF2",
        muted: "#8B93A7",
        emerald: {
          DEFAULT: "#34D399",
          soft: "rgba(52,211,153,0.15)",
        },
        coral: {
          DEFAULT: "#FB7185",
          soft: "rgba(251,113,133,0.15)",
        },
        gold: {
          DEFAULT: "#F5C451",
          soft: "rgba(245,196,81,0.15)",
        },
        violet: {
          DEFAULT: "#818CF8",
          soft: "rgba(129,140,248,0.15)",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.35)",
        glow: "0 0 40px rgba(245,196,81,0.25)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: 0, transform: "scale(0.96)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: 0.6 },
          "50%": { opacity: 1 },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "scale-in": "scale-in 0.25s ease-out both",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "spin-slow": "spin-slow 12s linear infinite",
      },
    },
  },
  plugins: [],
};
