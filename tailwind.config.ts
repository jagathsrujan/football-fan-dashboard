import type { Config } from "tailwindcss";
import { colors } from "./lib/design-tokens";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--color-base)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        "base-light": colors.bgLight.base,
        "surface-light": colors.bgLight.surface,
        "surface-raised-light": colors.bgLight.raised,
        hairline: "var(--color-hairline)",
        primary: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        muted: "var(--color-text-muted)",
        floodlight: "var(--color-floodlight)",
        turf: "var(--color-turf)",
        dusk: "var(--color-dusk)",
        win: colors.status.win,
        draw: colors.status.draw,
        loss: colors.status.loss,
        live: colors.status.live,
        "card-yellow": colors.card.yellow,
        "card-red": colors.card.red,
      },
      fontFamily: {
        display: ["var(--font-oswald)"],
        body: ["var(--font-inter)"],
        data: ["var(--font-plex-mono)"],
      },
      borderRadius: {
        DEFAULT: "4px",
        md: "6px",
      },
      spacing: {
        sidebar: "240px",
        "sidebar-collapsed": "64px",
        "bottom-nav": "56px",
      },
      minWidth: {
        standings: "720px",
      },
      maxHeight: {
        sheet: "80vh",
      },
      keyframes: {
        "skeleton-shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
        "live-pulse": {
          "0%, 100%": { opacity: "0.65", transform: "scale(1)" },
          "50%": { opacity: "0", transform: "scale(1.4)" },
        },
      },
      animation: {
        "skeleton-shimmer": "skeleton-shimmer 1.4s infinite",
        "live-pulse": "live-pulse 1.6s infinite",
      },
      transitionTimingFunction: {
        scoreboard: "cubic-bezier(0.3, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
