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
        sans: ["Inter", '"Helvetica Neue"', "Arial", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
        // Legacy aliases — kept so font-display / font-body classnames still resolve
        display: ["Inter", '"Helvetica Neue"', "Arial", "sans-serif"],
        body: ["Inter", '"Helvetica Neue"', "Arial", "sans-serif"],
      },
      colors: {
        dome: {
          bg: {
            primary: "#FAFAFA",    // page background
            secondary: "#FFFFFF",  // cards, header, modals
            tertiary: "#F5F5F5",   // inputs, metric tiles
            accent: "#E8F3FF",     // accent-tinted surfaces
          },
          text: {
            primary: "#0A0A0A",
            secondary: "#525252",
            muted: "#A3A3A3",
            accent: "#0080FF",
          },
          accent: {
            DEFAULT: "#0080FF",    // electric blue — primary brand accent
            hover: "#40A8FF",
            active: "#0066CC",
            subtle: "#E8F3FF",
            // Legacy aliases — un-migrated classnames still render the correct colour
            cyan: "#0080FF",
            lightblue: "#40A8FF",
          },
          border: {
            DEFAULT: "#E8E8E8",    // dome-border → same as dome-border-DEFAULT
            subtle: "#F0F0F0",
            strong: "#D4D4D4",
            accent: "#99CCFF",
          },
          status: {
            critical: "#DC2626",
            major: "#D97706",
            minor: "#0080FF",
            success: "#16A34A",
          },
        },
      },
      borderRadius: {
        dome: "8px",           // buttons, inputs, small elements
        "dome-card": "12px",   // cards, modals, panels
      },
      letterSpacing: {
        dome: "0.18em",        // eyebrow / overline uppercase labels
        "dome-tight": "-0.025em",
        "dome-tighter": "-0.03em",
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
