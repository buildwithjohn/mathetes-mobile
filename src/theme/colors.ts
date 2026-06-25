// Mathetes color tokens. The `colors` export is theme-reactive: reading any
// property (e.g. `colors.ink`) returns the value for the currently active
// scheme, so icon/prop colors flip with dark mode without touching call sites.
// `className` colors flip separately via CSS variables (see global.css).
//
// Light values are the canonical YouVersion-style palette (the `copper` token
// is the red accent; the name is kept so existing `text-copper` cascades).

type Palette = {
  ink: string;
  parchment: string;
  copper: string;
  oxblood: string;
  surface1: string;
  surface2: string;
  border: string;
  copperDeep: string;
  copperSoft: string;
  inkSoft: string;
  inkMute: string;
  inkFaint: string;
  rule: string;
  ruleSoft: string;
  paper: string;
  paperRaised: string;
  success: string;
  warning: string;
  alert: string;
};

export const lightColors: Palette = {
  ink: "#1A1A1A",
  parchment: "#F7F7F8",
  copper: "#F33A49",
  oxblood: "#9B2C36",
  surface1: "#FFFFFF",
  surface2: "#EFEFF1",
  border: "#E4E4E7",
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
};

export const darkColors: Palette = {
  ink: "#F2F2F3",
  parchment: "#0F0F11",
  copper: "#FF5A66",
  oxblood: "#C56B73",
  surface1: "#1C1C1F",
  surface2: "#27272A",
  border: "#3A3A3E",
  copperDeep: "#FF8A93",
  copperSoft: "#FF6B7A",
  inkSoft: "#D4D2CE",
  inkMute: "#9A958E",
  inkFaint: "#6B675F",
  rule: "#2E2E32",
  ruleSoft: "#232327",
  paper: "#1C1C1F",
  paperRaised: "#27272A",
  success: "#7FA67F",
  warning: "#D8B45A",
  alert: "#D08A8A",
};

let active: Palette = lightColors;

// Called by the theme store whenever the resolved scheme changes.
export function setActivePalette(scheme: "light" | "dark"): void {
  active = scheme === "dark" ? darkColors : lightColors;
}

// Theme-reactive accessor. Property reads resolve against the active palette
// at render time; components re-render on scheme change (NativeWind), so the
// returned colors stay in sync.
export const colors = new Proxy({} as Palette, {
  get: (_t, prop: string) => active[prop as keyof Palette],
}) as Palette;

// Seven house accent colors, used as identity rings on avatars. Theme-invariant.
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

// Verse highlight palette (keys match the backend highlights.color check
// constraint; the hexes are client-side). Vivid so they read on both light and
// dark backgrounds — highlighted verse text is drawn dark on top (see reader).
export const highlightColors = {
  copper: "#FFA552", // orange
  gold: "#FFD54A", // yellow
  sage: "#8BD17C", // green
  oxblood: "#F58FA8", // rose
  blue: "#6FB7E8", // blue
} as const;
