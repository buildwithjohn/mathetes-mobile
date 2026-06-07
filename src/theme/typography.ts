// Font families map to the @expo-google-fonts named exports loaded in
// app/_layout.tsx. Use these constants in `fontFamily` style props or the
// matching NativeWind classes (font-display, font-sans, font-scripture).
export const fonts = {
  display: "Fraunces_500Medium",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemibold: "Inter_600SemiBold",
  scripture: "SourceSerif4_400Regular",
} as const;

// Bible reading: Source Serif 4 at 18px / 30px line height (per design system).
export const type = {
  scripture: { fontFamily: fonts.scripture, fontSize: 18, lineHeight: 30 },
  display: { fontFamily: fonts.display },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
} as const;
