/** @type {import('tailwindcss').Config} */
// Mathetes brand tokens for NativeWind. Semantic colors resolve from CSS
// variables (see global.css) so they flip with the light/dark scheme. House
// and highlight colors are identity colors and stay fixed in both themes.
const v = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: v("ink"),
        parchment: v("parchment"),
        copper: v("copper"),
        oxblood: v("oxblood"),
        surface1: v("surface1"),
        surface2: v("surface2"),
        border: v("border"),
        "copper-deep": v("copper-deep"),
        "copper-soft": v("copper-soft"),
        "ink-soft": v("ink-soft"),
        "ink-mute": v("ink-mute"),
        "ink-faint": v("ink-faint"),
        rule: v("rule"),
        "rule-soft": v("rule-soft"),
        paper: v("paper"),
        "paper-raised": v("paper-raised"),
        success: v("success"),
        warning: v("warning"),
        alert: v("alert"),
        house: {
          bethel: "#B87333",
          antioch: "#722F37",
          berea: "#A87C3E",
          bethany: "#7A8A6E",
          zion: "#C9A24A",
          hebron: "#A85838",
          salem: "#6B7F8A",
        },
      },
      fontFamily: {
        display: ["Fraunces_500Medium"],
        "display-italic": ["Fraunces_500Medium_Italic"],
        sans: ["Inter_400Regular"],
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        scripture: ["SourceSerif4_400Regular"],
      },
    },
  },
  plugins: [],
};
