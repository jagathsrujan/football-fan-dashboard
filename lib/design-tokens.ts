export const colors = {
  bg: { base: '#0D1512', surface: '#141F1A', raised: '#1B2620' },       // dark mode
  bgLight: { base: '#F7F5EF', surface: '#FFFFFF', raised: '#FCFAF4' },  // light mode
  border: { hairline: '#26332C' },
  text: { primary: '#F3F1EA', secondary: '#9CA6A0', muted: '#6B756F' },
  accent: { primary: '#F5B942', secondary: '#4E9873', info: '#5B8DBE' }, // floodlight / turf / dusk
  status: { win: '#4E9873', draw: '#C9A24B', loss: '#C4554F', live: '#E8483F' },
  card: { yellow: '#FFD166', red: '#E14B4B' },
} as const;

export const motion = {
  duration: { instant: 0.1, fast: 0.18, base: 0.28, slow: 0.45 },
  ease: {
    out: [0.16, 1, 0.3, 1],
    inOut: [0.65, 0, 0.35, 1],
    flip: [0.3, 0, 0.2, 1],
  },
} as const;
