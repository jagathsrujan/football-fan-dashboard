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
        base: colors.bg.base,
        surface: colors.bg.surface,
        "surface-raised": colors.bg.raised,
        "base-light": colors.bgLight.base,
        "surface-light": colors.bgLight.surface,
        "surface-raised-light": colors.bgLight.raised,
        hairline: colors.border.hairline,
        primary: colors.text.primary,
        secondary: colors.text.secondary,
        muted: colors.text.muted,
        floodlight: colors.accent.primary,
        turf: colors.accent.secondary,
        dusk: colors.accent.info,
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
    },
  },
  plugins: [],
};

export default config;
