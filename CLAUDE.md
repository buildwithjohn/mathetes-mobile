# Mathetes Mobile

Expo React Native app for Mathetes, a campus discipleship companion built for
CCCFSP (Celestial Church of Christ Federal Students Parish) at Federal
University Oye-Ekiti (FUOYE), Nigeria.

## Project Overview

Mathetes delivers a daily Word of the Day, devotionals from the parish pastor, a
Bible reader, verse image generation, and a community layer (house chats, parish
announcements, ask-pastor, discipler chat, DMs, prayer wall, member directory).

Pilot: one fellowship, CCCFSP FUOYE, with 7 house fellowships (Bethel, Antioch,
Berea, Bethany, Zion, Hebron, Salem).

## Tech Stack

- **Framework:** Expo SDK 51 with Expo Router (file-based routing)
- **Language:** TypeScript strict mode (always; no `any`)
- **Styling:** NativeWind v4 (Tailwind for React Native)
- **Icons:** lucide-react-native (custom flame for streak only)
- **State:** React Query (server) + Zustand (UI/auth)
- **Backend:** @supabase/supabase-js (AsyncStorage session persistence)
- **Fonts:** Fraunces (display), Inter (body), Source Serif 4 (Bible reading)
- **Forms:** React Hook Form + Zod
- **Dates:** date-fns

## Design System

Colors (canonical hex in src/theme/colors.ts; mirrored in tailwind.config.js):
- Ink #1C1B1A, Parchment #F5F1EB, Copper #B87333, Oxblood #722F37
- Surface1 #FFFFFF / Surface2 #EDE8E0, Border #D9D2C5
- Seven house accent colors (avatar identity rings)

Typography: Fraunces 500 (display), Inter 400/500/600 (body), Source Serif 4
(Bible reading, 18px / 30px). Spacing scale (4px base): 4 8 12 16 24 32 48 64.

## Conventions

- TypeScript strict always. Functional components only.
- NativeWind classes for styling; no inline style objects except dynamic values
  Tailwind can't express.
- lucide-react-native icons.
- Async data via React Query hooks in src/lib/queries.
- Auth/UI state via Zustand stores in src/lib/stores.
- File-based routing in /app. Shared UI primitives in src/components.
- Never use em-dashes in copy. Real KJV scripture and real Nigerian names in
  sample content.

## Structure

```
app/
  (onboarding)/        welcome (+ signin, signup, house, notify in Phase 1)
  (auth)/(tabs)/       today, bible, community, you
  _layout.tsx          fonts, React Query, auth listener, splash
  index.tsx            splash + router decision
src/
  components/  lib/ (supabase, queries, stores, database.types)  hooks/  theme/  utils/
assets/fonts  assets/images
```

## Pastoral Guardrails (non-negotiable)

1. All messaging has pastoral oversight (leaders see DM activity; pastor sees
   discipler conversations).
2. Conservative default privacy (photos default to parish; DMs to house-mates;
   cross-gender DMs require approval).
3. Ask Pastor is a queue with a 48-hour window, not free chat.
4. No notification badges that pressure the pastor.
5. Term-end archive resets are automatic.
6. Profile photo upload is opt-in (default initials).
7. Block, report, mute are one tap from any chat surface.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill from `supabase start`.
3. Copy types: `cd ../mathetes-backend && ./scripts/generate-types.sh`.
4. `npx expo start` (run `npx expo install` once to align native versions).

## Reference

- ../mathetes-backend for schema and generated types
