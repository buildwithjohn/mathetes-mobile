# Mathetes Mobile

Expo (SDK 51) + Expo Router app for Mathetes.

## Quick start

```bash
npm install
# align native module versions to the installed Expo SDK:
npx expo install
cp .env.example .env   # fill from `supabase start` in ../mathetes-backend
npx expo start
```

Press `i` for iOS simulator or `a` for Android emulator. The splash shows the
Mathetes wordmark; without a session you land on onboarding, otherwise on the
Today tab.

## Status

Through Phase 4: NativeWind v4 + brand tokens, Google Fonts, typed Supabase
client with AsyncStorage, and the 4-tab shell. The auth and onboarding flow
(Phase 1), daily loop of Word and devotionals (Phase 2), KJV Bible reader with
bookmarks and highlights (Phase 3), and now the verse image studio plus the You
tab (profile editing, opt-in photo, on-device streak, library) are in place
(Phase 4). The community layer (house chats, prayer wall, ask-pastor, DMs)
arrives in later phases.

The verse image studio renders a Word or Bible verse onto a branded card and
saves or shares it as a PNG (`react-native-view-shot` + `expo-sharing` /
`expo-media-library`). Profile photos upload to a Supabase Storage bucket named
`avatars`; create that bucket (public read) before testing photo upload.

## Notes

- `assets/images/*.png` are solid-parchment placeholders. Replace with real
  icon (1024x1024) and splash artwork before any build.
- `src/lib/database.types.ts` is a typed stub. Regenerate from the backend with
  `../mathetes-backend/scripts/generate-types.sh`.
