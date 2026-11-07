import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#06070d", panel: "#0e1020", raised: "#141730", line: "#23284a" },
        neon: { cyan: "#00E5FF", violet: "#7C4DFF", magenta: "#FF2BD6" },
        muted: "#8a8d9b",
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "system-ui", "sans-serif"],
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      backgroundImage: {
        neon: "linear-gradient(120deg,#00E5FF,#7C4DFF 55%,#FF2BD6)",
      },
      keyframes: {
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(255,77,94,.55)" },
          "70%": { boxShadow: "0 0 0 26px rgba(255,77,94,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(255,77,94,0)" },
        },
      },
      animation: { pulseRing: "pulseRing 1.4s infinite" },
    },
  },
  plugins: [],
} satisfies Config;
