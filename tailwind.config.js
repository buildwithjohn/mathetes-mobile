/** @type {import('tailwindcss').Config} */
// Mathetes brand tokens for NativeWind. Hex values are canonical.
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#1A1A1A",
        parchment: "#F7F7F8",
        copper: "#F33A49",
        oxblood: "#9B2C36",
        surface1: "#FFFFFF",
        surface2: "#EFEFF1",
        border: "#E4E4E7",
        "copper-deep": "#9B2C36",
        "copper-soft": "#FF6B7A",
        "ink-soft": "#3D3935",
        "ink-mute": "#75706A",
        "ink-faint": "#B0A99B",
        rule: "#E8E7E5",
        "rule-soft": "#F0EFEE",
        paper: "#FFFFFF",
        "paper-raised": "#F0EFEE",
        success: "#5A7C5A",
        warning: "#C19D3F",
        alert: "#A04141",
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
