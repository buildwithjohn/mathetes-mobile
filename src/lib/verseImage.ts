// Verse image studio: theme palettes and a type scale for the shareable card.
// Pure data + helpers so the studio screen stays declarative.
// Verse cards are brand artifacts shared outside the app, so they always use
// the light brand palette regardless of the viewer's app theme.
import { lightColors as colors } from "@/theme/colors";

export type VerseTheme = {
  key: string;
  name: string;
  bg: string;
  text: string;
  accent: string;
  rule: string;
};

// Brand-faithful palettes. The first is the default (parchment, like the app).
export const verseThemes: VerseTheme[] = [
  {
    key: "parchment",
    name: "Parchment",
    bg: colors.parchment,
    text: colors.ink,
    accent: colors.copper,
    rule: colors.border,
  },
  {
    key: "ink",
    name: "Ink",
    bg: colors.ink,
    text: colors.parchment,
    accent: colors.copper,
    rule: "#3A3631",
  },
  {
    key: "copper",
    name: "Copper",
    bg: colors.copper,
    text: "#F8F3EC",
    accent: colors.ink,
    rule: "#FFFFFF40",
  },
  {
    key: "oxblood",
    name: "Oxblood",
    bg: colors.oxblood,
    text: "#F5F1EB",
    accent: "#C9A24A",
    rule: "#FFFFFF33",
  },
  {
    key: "gold",
    name: "Gold",
    bg: "#E7C45A",
    text: "#2A2410",
    accent: "#7A5B12",
    rule: "#00000022",
  },
  {
    key: "sand",
    name: "Sand",
    bg: "#EDE3D1",
    text: "#3A3324",
    accent: colors.copper,
    rule: "#00000018",
  },
  {
    key: "forest",
    name: "Forest",
    bg: "#2E4034",
    text: "#EAF1E8",
    accent: "#E7C45A",
    rule: "#FFFFFF2A",
  },
  {
    key: "midnight",
    name: "Midnight",
    bg: "#1B2A3A",
    text: "#EAF0F5",
    accent: "#6FB7E8",
    rule: "#FFFFFF2A",
  },
  {
    key: "sky",
    name: "Sky",
    bg: "#CFE6F5",
    text: "#13242F",
    accent: "#2E6E8F",
    rule: "#00000018",
  },
  {
    key: "rose",
    name: "Rose",
    bg: "#E8B7C0",
    text: "#43222B",
    accent: "#9B2C36",
    rule: "#00000018",
  },
];

// Studio themes whose background is light (dark text). Used to map to the
// backend's coarse theme enum.
const LIGHT_THEME_KEYS = new Set(["parchment", "gold", "sand", "sky", "rose"]);

// Build a one-off theme from a house accent color so a member can render the
// Word in their house's color. Parchment text reads well on all seven.
export function houseTheme(name: string, color: string): VerseTheme {
  return { key: `house-${color}`, name, bg: color, text: "#F5F1EB", accent: "#F5F1EB", rule: "#FFFFFF33" };
}

// Verse text is set in Source Serif 4; shrink it as the passage grows so a long
// verse still fits the card without scrolling or clipping.
export function verseTypeScale(length: number): {
  fontSize: number;
  lineHeight: number;
} {
  if (length <= 80) return { fontSize: 30, lineHeight: 42 };
  if (length <= 140) return { fontSize: 26, lineHeight: 38 };
  if (length <= 220) return { fontSize: 22, lineHeight: 33 };
  if (length <= 320) return { fontSize: 19, lineHeight: 29 };
  return { fontSize: 16, lineHeight: 25 };
}

// Map a studio theme key onto the backend verse_images.theme enum
// ('minimal' | 'organic' | 'bold'). Parchment is the light, minimal look;
// house colors read as organic; the dark/strong palettes are bold.
export function galleryTheme(
  themeKey: string
): "minimal" | "organic" | "bold" {
  if (LIGHT_THEME_KEYS.has(themeKey)) return "minimal";
  if (themeKey.startsWith("house-")) return "organic";
  return "bold";
}
