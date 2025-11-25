/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Design tokens from the brief
        background: "#0B0F19",
        card: "#0F172A",
        text: "#E2E8F0",
        muted: "#94A3B8",
        accent: {
          violet: "#8B5CF6",
          cyan: "#22D3EE",
          mint: "#34D399",
          warn: "#F59E0B",
          error: "#F43F5E"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"]
      },
      borderRadius: {
        xl: "1.25rem",
        full: "9999px"
      },
      boxShadow: {
        "glow-violet": "0 0 30px rgba(139, 92, 246, 0.45)",
        "glow-cyan": "0 0 30px rgba(34, 211, 238, 0.4)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
