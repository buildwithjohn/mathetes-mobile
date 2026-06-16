# Mathetes — Project Status & Context Brief

_Last updated: 2026-06-16. This is the single source of truth for anyone (PM,
engineer, or AI agent) picking up the project. Read it fully before working._

## 1. What we're building
**Mathetes** is a mobile **discipleship platform** for the **Celestial Church of
Christ Federal Students Parish (CCCFSP)** at **Federal University Oye-Ekiti
(FUOYE)**, Nigeria. It delivers a daily Word, devotionals, a Bible reader, verse
images, and a full community layer (house chats, DMs, prayer wall, Ask Pastor,
announcements) with pastoral oversight built in.

- **Pilot:** CCCFSP FUOYE — **one parish, two campuses** (Oye = main, Ikole).
- **Vision:** scale to every CCC student parish nationally (the data model
  already supports network → parish → campus → house).

## 2. Repositories (GitHub owner: `buildwithjohn`)
| Repo | Purpose | Active branch | Stack |
|------|---------|---------------|-------|
| `mathetes-mobile` | The student app | `claude/wonderful-curie-h3ahv` | Expo SDK 54 / Expo Router / TS |
| `mathetes-backend` | Supabase schema (SQL migrations) | `claude/chat-media-storage` | Postgres / Supabase |
| `mathetes-admin` | Pastor/leader content dashboard | (its own branch) | Next.js 15 |

> Work has **not been merged to `main`** on any repo yet — it lives on the
> branches above. Merging to `main` + CI/deploy-from-main is a launch task.

## 3. Infrastructure & config
- **Supabase project:** `jowokfnlfqqjzwhvnmxj.supabase.co` (keys in Supabase →
  Settings → API; anon key is public, service_role is server-only).
- **Schema:** migrations `0001`–`0018` are **deployed to production** (verified).
  Backend deploys are applied by pasting SQL into the Supabase **SQL Editor**
  (idempotent bundles live in `mathetes-backend/scripts/`).
- **Email:** **Resend** (verified domain) wired as Supabase custom SMTP. Branded
  HTML templates set in Supabase → Auth → Email Templates.
- **Domains:** `mathetes.live` (public + the `/confirmed` email-landing page),
  `admin.mathetes.live` (admin dashboard).
- **Supabase Auth URL config:** Site URL = `https://mathetes.live` (bare);
  Redirect allow-list = `https://mathetes.live/confirmed`,
  `https://mathetes.live/**`, `mathetes://**`. Email confirmation is **ON**.
- **App deep-link scheme:** `mathetes://`. Auth flow type: **PKCE**.
- **EAS Build:** project linked (`projectId` committed in `app.json`,
  `79670644-a012-4858-bd02-e1c0214c1a9d`). `eas.json` profiles:
  `preview` (Android **APK** for direct install), `production` (store),
  `development` (dev client). Supabase URL + anon key are set as **EAS
  environment variables** in the `preview` environment (not committed).

## 4. Tech stack & conventions (mobile)
- Expo SDK 54, Expo Router (file-based, `app/`), **TypeScript strict (no `any`)**.
- **NativeWind v4** (Tailwind classes); colors centralized in
  `src/theme/colors.ts` + `tailwind.config.js`.
- **React Query** (server state, hooks in `src/lib/queries/`) + **Zustand**
  (`src/lib/stores/auth.ts`).
- `@supabase/supabase-js` (client in `src/lib/supabase.ts`, AsyncStorage
  session, PKCE).
- Icons: `lucide-react-native`. Motion: `react-native-reanimated`. Vector:
  `react-native-svg`.
- Fonts: **Fraunces** (display), **Inter** (UI), **Source Serif 4** (scripture).
- Tests: **Jest (jest-expo)** in `src/**/*.test.{ts,tsx}` (20 passing). CI:
  `.github/workflows/ci.yml` runs typecheck + tests.

## 5. Design / theme (YouVersion-style)
Clean, modern, near-white with a single red accent. Tokens (the `copper` token
is the accent — name kept so existing `text-copper`/`bg-copper` cascade):
- accent (`copper`) `#F33A49` · background (`parchment`) `#F7F7F8` ·
  `surface1` `#FFFFFF` · `surface2` `#EFEFF1` · `border` `#E4E4E7` ·
  `ink` `#1A1A1A` · `oxblood` `#9B2C36`.
- Seven house identity colors and the highlight palette are unchanged.
- Fonts stay free (Inter ≈ Aktiv Grotesk, Source Serif ≈ Untitled Serif; the
  real YouVersion fonts are commercial and can't be bundled).

## 6. Backend schema (migrations 0001–0018)
identity/houses/profiles + `handle_new_user` trigger (0001) · content
(devotionals, word_of_day, series, `today` views) (0002) · KJV Bible + search
(0003) · personal library (notes/bookmarks/highlights/reading_position) (0004) ·
streaks + `record_check_in` (0005) · **chat** (chats, members, messages,
reactions, pinned, `create_dm`, oversight RLS) (0006) · prayer wall (0007) ·
Ask Pastor + `public_qa` view (0008) · safety (blocks/reports/moderation) (0009)
· notifications + triggers (0010) · verse_images (0011) · search tuning (0012) ·
storage buckets (0013) · announcements content table (0014) · `chat-media`
bucket + avatars made public (0015) · **campuses** + `user_profiles.campus_id`
(Oye+Ikole) (0016) · `parish_group` chat kind (0017) · **per-campus houses** +
`user_profiles.date_of_birth/phone` (0018).

Pastoral guardrails are enforced in RLS (oversight is read-only; DMs overseen by
the house leader of the pair, discipler chats by the pastor; no blanket admin
read of private chats).

## 7. Mobile — what's built
**Auth & onboarding:** email/password, email confirmation (branded Resend +
`/confirmed` landing), **Google** OAuth (works Android+iOS), **Apple** sign-in
(iOS, native button), **password reset** (deep link → set-new-password),
show/hide password toggle. Flow: welcome → sign up → "check your email" → confirm
→ sign in → **campus → campus-scoped house → "About you" (DOB, gender, phone,
level, dept)** → notifications priming → app. `AuthGate` routes incomplete
profiles back into onboarding.

**Daily/content:** Today (Word of the Day, devotional, streak via
`record_check_in`, Explore), devotional reader with **audio player**, devotional
**series** browser, **Word archive**.

**Bible:** KJV reader (comfortable line height), search, bookmarks, highlights,
personal library.

**Verse images:** studio (brand/house themes, save & share PNG) + saved
**gallery** (verse_images table + bucket).

**Community:** hub, **Parish Community** chat, **house** chats (auto-join on house
pick), **DMs** (`create_dm`), **discipler** chat, **prayer wall** (post/pray),
**Ask Pastor** (submit + anonymized public Q&A), **members** directory →
start DM, **announcements** feed, in-app **notification bell** (realtime), **chat
media** (image + voice notes), **block/report/mute** + oversight banners.

**Settings/profile:** notification preferences (push + in-app per type), privacy
(who can DM you, cross-gender DM approval, mentions), profile editor, opt-in
**photo upload** (visibility-aware), library, gallery, sign out.

**Platform:** push registration (`expo-notifications`, activates in a build),
pull-to-refresh, animated empty states, YouVersion theme, tests + CI.

## 8. Admin app (`mathetes-admin`)
Next.js 15 dashboard, sign-in gated to `pastor`/`admin`. Built: **Devotionals**
(TipTap editor, series, schedule/publish), **Word of the Day** (calendar
composer), **Announcements**, **Ask-Pastor** answering queue, **Members**,
**Analytics**, server-side **verse-image generation**, OpenAI **moderation**.
In progress: YouVersion theme revamp; a public **`/confirmed`** email-landing
page; deploy to Vercel (`admin.mathetes.live` + `mathetes.live`). To author
content, create a Supabase user and `update user_profiles set role='pastor'`,
then sign in.

## 9. Status — done vs outstanding
**Code:** typecheck clean, 20 tests green, ~35 screens, 13 query modules.

**Launch checklist (remaining):**
1. **Verify the latest build end-to-end on a device** (signup→confirm→onboard→
   community→content; OAuth; reset; push; realtime). _Not yet done._
2. Finish **Google OAuth** provider setup (Google Cloud Web client → Supabase
   Google provider; redirect URI `…supabase.co/auth/v1/callback`).
3. **Seed real content** via admin (Word + devotional + announcement) so day-one
   isn't empty.
4. **Real app icon + splash** (currently placeholder parchment art).
5. Verify **push notifications** on a build.
6. **iOS** build + Apple provider (needs Apple Developer account).
7. **Merge branches to `main`**; deploy admin; run CI from main.
8. **Privacy policy / store listings** if publishing to Play Store / App Store.

## 10. Future roadmap (toward a *full* discipleship platform — not yet built)
Reading plans / Bible-in-a-year · discipleship pathways (new-believer → growth
tracks) · events + attendance check-in · **giving via Paystack** · audio/video
content authoring + mobile video player · broadcast push · deeper analytics ·
network/multi-parish provisioning · birthdays (DOB is now captured).
Recommended order: **reading plans → giving → events/attendance → pathways.**

## 11. Key decisions made
- **One parish + campus field** (not separate parishes per campus); houses are
  **scoped per campus**.
- **Email confirmation ON** with Resend; rich profile collected **after** confirm
  (session-based, no metadata hacks).
- **Stay on Supabase Auth** (evaluated Keycloak — rejected: heavy ops, deep RLS
  coupling, no feature gain).
- **Public storage buckets** (avatars, chat-media) with unguessable paths — a
  pragmatic pilot choice; tighten to signed URLs later if needed.
- Backend deployed via **SQL Editor paste** of idempotent bundles.

## 12. Gotchas / notes
- Native features (OAuth, Apple, push, deep links) **require an EAS build**, not
  Expo Go — use Expo Go only for quick UI iteration.
- `git pull` can conflict on `app.json`/`eas.json` if `eas` CLI rewrote them; the
  `projectId` is now committed so this should stop. If stuck: stop any running
  `eas build`, `git fetch && git reset --hard origin/<branch>`, `npm install`.
- Commits are signed by the environment signer; a local stop-hook may report them
  "unverified" (no local allowed-signers file) — GitHub shows them **verified**.
