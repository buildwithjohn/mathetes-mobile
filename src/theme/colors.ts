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
  // Semantic aliases used by the design system (v1 identity). The warm hexes in
  // the design JSX are NOT used; these map to the current YouVersion palette.
  copperDeep: "#9B2C36",
  copperSoft: "#FF6B7A",
  inkSoft: "#3D3935",
  inkMute: "#75706A",
  inkFaint: "#B0A99B",
  rule: "#E8E7E5",
  ruleSoft: "#F0EFEE",
  paper: "#FFFFFF",
  paperRaised: "#F0EFEE",
  success: "#5A7C5A",
  warning: "#C19D3F",
  alert: "#A04141",
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
