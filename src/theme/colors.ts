// Mathetes color tokens. The `copper` token is the app accent (now YouVersion
// red); the name is kept so existing `text-copper` / `bg-copper` usages cascade.
// Surfaces are clean cool neutrals for a modern, YouVersion-style read.
export const colors = {
  ink: "#1A1A1A",
  parchment: "#F7F7F8",
  copper: "#F33A49",
  oxblood: "#9B2C36",
  surface1: "#FFFFFF",
  surface2: "#EFEFF1",
  border: "#E4E4E7",
  dark: {
    surface1: "#1C1C1F",
    surface2: "#27272A",
    border: "#3A3A3E",
  },
} as const;

// Seven house accent colors, used as identity rings on avatars.
export const houseColors = {
  bethel: "#B87333",
  antioch: "#722F37",
  berea: "#A87C3E",
  bethany: "#7A8A6E",
  zion: "#C9A24A",
  hebron: "#A85838",
  salem: "#6B7F8A",
} as const;

export type HouseSlug = keyof typeof houseColors;

// Verse highlight palette (matches backend highlights.color check constraint).
export const highlightColors = {
  copper: "#B87333",
  gold: "#C9A24A",
  sage: "#7A8A6E",
  oxblood: "#722F37",
  blue: "#6B7F8A",
} as const;
