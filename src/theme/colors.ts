// Mathetes color tokens. Canonical hex values; never deviate.
export const colors = {
  ink: "#1C1B1A",
  parchment: "#F5F1EB",
  copper: "#B87333",
  oxblood: "#722F37",
  surface1: "#FFFFFF",
  surface2: "#EDE8E0",
  border: "#D9D2C5",
  dark: {
    surface1: "#26241F",
    surface2: "#322F2A",
    border: "#3A3631",
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
