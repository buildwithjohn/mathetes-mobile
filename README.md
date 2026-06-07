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

Phase 0 foundation: NativeWind v4 + brand tokens, Google Fonts (Fraunces, Inter,
Source Serif 4), typed Supabase client with AsyncStorage, Zustand auth store with
session listener, splash, onboarding welcome placeholder, and the 4-tab shell
(Today, Bible, Community, You). Onboarding flow, daily loop, Bible reader, verse
images, and chat arrive in later phases (see the build plan).

## Notes

- `assets/images/*.png` are solid-parchment placeholders. Replace with real
  icon (1024x1024) and splash artwork before any build.
- `src/lib/database.types.ts` is a typed stub. Regenerate from the backend with
  `../mathetes-backend/scripts/generate-types.sh`.
