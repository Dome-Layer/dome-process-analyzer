import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', '"Helvetica Neue"', "sans-serif"],
        body: ["Outfit", '"Helvetica Neue"', "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      colors: {
        dome: {
          bg: {
            primary: "#FAFAF9",
            secondary: "#FFFFFF",
            tertiary: "#F0F0EE",
          },
          text: {
            primary: "#0C0C0E",
            secondary: "#2A2A2E",
            muted: "#8A8A8F",
          },
          accent: {
            cyan: "#5B9CB5",
            purple: "#9A00FF",
            blue: "#006BDF",
            lightblue: "#7BB8CF",
          },
          border: "#E2E2E0",
          status: {
            critical: "#B85C5C",
            major: "#C4A35A",
            minor: "#5B9CB5",
            success: "#6B9E78",
          },
        },
      },
      borderRadius: {
        dome: "4px",
      },
      letterSpacing: {
        dome: "1.4px",
        "dome-tight": "-1.28px",
        "dome-tighter": "-1.92px",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        blink: {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease forwards",
        shimmer: "shimmer 1.4s linear infinite",
        blink: "blink 1s step-end infinite",
        spin: "spin 0.8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
