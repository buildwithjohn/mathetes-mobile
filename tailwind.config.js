/** @type {import('tailwindcss').Config} */
// Mathetes brand tokens for NativeWind. Hex values are canonical.
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#1C1B1A",
        parchment: "#F5F1EB",
        copper: "#B87333",
        oxblood: "#722F37",
        surface1: "#FFFFFF",
        surface2: "#EDE8E0",
        border: "#D9D2C5",
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
        sans: ["Inter_400Regular"],
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        scripture: ["SourceSerif4_400Regular"],
      },
    },
  },
  plugins: [],
};
