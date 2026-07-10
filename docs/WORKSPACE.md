# Mathetes — Workspace & Master Context

> **Read this first.** This is the single source of truth for an agent or
> teammate working across all three Mathetes repos in one session. It captures
> what's built, every cross-repo decision we've agreed, what's still pending on
> each side, and how to work in the combined workspace.
>
> _Owner: John (buildwithjohn). Pilot: CCCFSP FUOYE._

---

## 0. The combined workspace

Clone all three repos side-by-side into one parent folder and open a single
Claude Code session on the parent so one agent can edit all three:

```
~/Documents/Mathetes/
  ├─ mathetes-mobile/    # Expo SDK 54 / Expo Router / TypeScript (the student app)
  ├─ mathetes-backend/   # Supabase: SQL migrations + Deno edge functions
  └─ mathetes-admin/     # Next.js 15 (pastor/admin dashboard)
```

Working rule: **a change usually spans repos** — e.g. a new feature = backend
table + RLS + RPC → regenerate `types/database.types.ts` → mirror types in
mobile → build the mobile screen → add the admin authoring UI. Do all of it in
the one session instead of pasting briefs between chats.

There is **no separate API server**. The "API" is Supabase: Postgres + auto
REST (PostgREST) + RPCs (Postgres functions) + Auth + Realtime + Storage +
Edge Functions (Paystack only). Mobile talks to it directly via
`@supabase/supabase-js` with the anon key; **RLS is the security boundary**.

---

## 1. Repos, branches, hosting

| Repo | Stack | Branches | Hosting |
|------|-------|----------|---------|
| `mathetes-mobile` | Expo SDK 54, Expo Router, TS strict, NativeWind v4, React Query + Zustand | `dev` (default) → `stage` → `main` | EAS Build (Android APK via `preview`, AAB via `production`) |
| `mathetes-backend` | Supabase (Postgres SQL migrations + Deno edge functions) | `main` (default) | Supabase cloud + edge functions |
| `mathetes-admin` | Next.js 15 | (its own) | Vercel (`admin.mathetes.live`) |

- **Mobile branch flow:** develop on `dev`; promote `dev → stage` (QA) → `main`
  (prod) by fast-forward only. Never commit straight to `main`.
- **Supabase project:** `jowokfnlfqqjzwhvnmxj.supabase.co`. Migrations applied via
  the SQL editor (idempotent bundles) / `supabase`. Currently at **0027** in code;
  John applies to prod.
- **Domains:** `mathetes.live` (public + `/confirmed` email landing), `admin.mathetes.live`.
- **Email:** Resend (custom SMTP in Supabase). **Auth:** Supabase Auth, PKCE,
  email confirmation ON, deep-link scheme `mathetes://`.
- **Env (mobile):** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  in a local `.env` (gitignored) AND in the EAS preview/production environments.
- **Push/OAuth/deep links** need an EAS build, not Expo Go.

---

## 2. Conventions (mobile)

- TypeScript strict, no `any`. Functional components. NativeWind classes (no
  inline styles except dynamic values).
- Colors: `src/theme/colors.ts` (+ `tailwind.config.js`). **Dark mode** via CSS
  variables in `global.css`; the JS `colors` export is a theme-reactive proxy so
  icon/prop colors flip too. Don't reintroduce a "warm" palette — the YouVersion
  red accent (`copper` = `#F33A49`) on near-white parchment is canonical.
- Fonts: Fraunces (display) + Fraunces italic, Inter (UI), Source Serif 4
  (scripture). Use `font-display-italic`, NOT `font-display italic` (faux italic
  fails on Android).
- Data: React Query hooks in `src/lib/queries/*`. Auth/UI in Zustand
  (`src/lib/stores/*`). Server fields like `role`/`status`/`campus_id` are
  **read-only on the client** — set via RPCs, never direct writes.
- Markdown bodies (devotional, reading-plan day, Word reflection/prayer) render
  via `src/components/Markdown.tsx`. Admin editors must emit **real markdown**.
- Surface mutation errors (no silent failures). Optimistic where it helps (chat).

---

## 3. What's BUILT on mobile (on `dev`/`stage`)

**Daily loop:** Today, Word of the Day (expanded, reflection + prompt + **Pray**
prayer-guide section), devotional reader (markdown), reading streak.

**Bible:** flowing reader, centered chapter header, **translation switcher**
(reads `bible_versions`, persisted), **vivid highlights** (dark text on bright
fill, YouVersion-style), bookmarks/highlights, **search follows the selected
translation**, verse-image **studio** (many color themes + 7 house colors) + gallery.

**Community:** inbox (filter chips, pinned, sections), parish/house/discipler
chats + DMs with **optimistic send** + media (image/voice) + reactions +
oversight banners + block/report/mute, prayer wall, Ask Pastor (submit + public
Q&A), members directory, announcements, realtime notifications.

**Onboarding & gating:** welcome → signup (school-email messaging) → confirm →
signin → **AuthGate** routes by `status`: pending → **Pending screen**; active +
no campus → campus picker (`set_my_campus` RPC) → house → About-you → notify → home.

**Leader Oversight tab** (role-gated): owner/admin = approvals + flags + answer;
pastor = answer only; discipler/house-leader = view-only. Owner badge via `is_owner`.

**Reading plans (V2.0):** browse / plan detail (subscribe, pause, day path with
sequence-lock) / day reader (scripture, markdown, **private** reflection + opt-in
discipler share, mark complete). RPCs: `subscribe_to_plan`, `complete_plan_day`,
`toggle_plan_pause`.

**Giving (V2.1):** give screen (amount/fund/recurring/anonymous) → `paystack-initialize`
→ WebView `authorization_url` → realtime-watch the donation row; recurring manage;
history. **The Give button is gated behind `GIVING_ENABLED=false`** until Paystack
is deployed (`app/(auth)/giving.tsx`).

**Library/media hub:** `/resources` + `/resource/[id]` — books, monthly manuals,
audio sermons, videos; reads `library_items` (empty until backend ships it).

**Platform:** dark mode toggle (Settings → Appearance), push registration,
pull-to-refresh, animations, tests + CI (20 Jest tests, typecheck clean).

---

## 4. Agreed cross-repo CONTRACTS & DECISIONS

### 4.1 Student gating (membership) — backend 0025/0026 (LIVE)
- `user_profiles.status`: `pending | active | rejected | suspended`. Backfill
  existing → `active`.
- `campuses.allowed_email_domains text[]` (lowercase, no `@`). **Must be seeded
  with the real FUOYE student domain** or no one auto-activates.
- Signup: school-email domain match → `active` (FUOYE both campuses share the
  domain, so `campus_id = null` → user picks Oye/Ikole). Non-match → `pending`,
  no parish, walled off by RLS (only the Pending screen).
- Campus is set via **`set_my_campus(p_campus)`** (direct `campus_id` writes are
  rejected). House via normal update. Self-escalation locked: client can never
  set `role/status/parish_id/campus_id`.

### 4.2 Roles (final contract)
- Enum: `member | house_leader | discipler | pastor | admin`. **Owner = `is_owner`
  boolean flag** (badge only — labels: Student, House Leader, Discipler, Pastor,
  Admin, Owner).
- **Oversight action gating** (RLS is the real ceiling):
  - approve members / resolve flags → **owner/admin**
  - answer Ask-Pastor → **owner/admin/pastor**
  - discipler / house-leader → Oversight **view-only**.
- RPCs: `list_pending_members`, `approve_member(p_user,p_campus)`,
  `reject_member(p_user)`, `resolve_report(p_report,p_status)`, `answer_question`.
- **DM oversight (RESOLVED, 0029):** house-leader passive DM read is removed
  entirely — DMs are private to their two participants; a reported message
  surfaces to admin/pastor for that one message only. Reports have no `house_id`,
  so the flags inbox stays admin-only.
- **Directory (0033):** students see active parish-mates; **parish admins
  (owner/pastor/admin) see the whole parish** (any status) plus null-parish
  `pending` signups (0027). `photo_visibility` honoured app-side.
- **DMs are FULLY OPEN (0034, John's decision):** any **active** member may DM
  any other active member in the **same parish**. The cross-house (B1) and
  cross-gender-approval (B2) gates are **removed** — 0033's role-aware reach is
  superseded because everyone now has full reach. Kept: same parish + active
  target. This is **initiation** only; DM oversight is unchanged (0029: private
  to participants). Same RPC signature, so mobile copy/types are unaffected (the
  old "cross-house"/"cross-gender" error strings just never fire now).
  ⚠️ Safeguarding note: this removed the cross-gender approval safeguard for
  students; revisit if the parish wants it back.

### 4.3 Reading plans (V2.0) — backend 0022 (LIVE)
Tables `reading_plans / _days / _subscriptions / _progress`. Guardrails:
reflections private; discipler-share opt-in; no leaderboards. `day.scripture_reference`
is a single string; `day.devotional_id` optionally deep-links a devotional.

### 4.4 Giving (V2.1) — backend 0023/0024 (schema LIVE; Paystack NOT deployed)
Tables `giving_funds / donations / giving_recurring / paystack_events` (amounts in
**kobo**). Edge functions `paystack-initialize` (returns `authorization_url` +
`access_code` + `reference`), `paystack-webhook` (flips status; no client verify),
`paystack-manage-recurring`. Realtime on `donations` + `giving_recurring`.
**Open decision:** `donations_select_admin` currently lets pastor+admin read
individual gifts — decide finance-only vs keep. Mobile member view is own-only.

---

## 5. OUTSTANDING cross-repo work

| Item | Backend | Admin | Mobile |
|------|---------|-------|--------|
| **Giving go-live** | deploy 3 edge fns, set `PAYSTACK_SECRET_KEY`, point Paystack webhook; apply 0023/0024 to prod | giving funds CRUD + analytics; decide pastor visibility | flip `GIVING_ENABLED=true` (1 line) |
| **Library/media hub** | `library_items` table + RLS + reuse `content-media` bucket; regen types | **Library** section (books/manuals PDF, audio, video URL/mp4; publish) | ✅ built (lights up when table ships) |
| **Word prayer guide** | add `word_of_day.prayer_md text` (nullable, markdown); regen types | "Prayer guide" field in WotD composer | ✅ renders when field exists |
| **More translations** | import **WEB/BSB** (public domain) into `bible_versions/books/chapters/verses`; **NKJV/NLT need a license** | — | ✅ switcher ready |
| **Houses management** | trigger to auto-create `chats(kind='house_group')` on house create | Houses CRUD per campus (name/slug/color/verse/leader) + create chat | ✅ reads houses live |
| **Reading-plan authoring** | (schema live) | Plans + Days editor (markdown reflection_body) | ✅ built |
| **House-leader DM oversight** | 0028 decision (existence-only vs content) | — | hold view until decided |
| **Markdown in editors** | — | ensure TipTap emits real `**markdown**`, not literal asterisks (devotional bug was this) | ✅ renderer handles it |
| **Approvals/answer dual-surface** | (RPCs live) | ensure portal uses the same RPCs + refreshes so mobile/portal stay consistent | ✅ |

---

## 6. Launch checklist (Play Store, Android first)

1. **Google Play Developer account** — $25 one-time. Personal vs **organisation**
   (org avoids the new-account 20-tester / 14-day closed-test requirement → faster).
2. **Privacy policy** at `mathetes.live/privacy` (required — app handles email/auth/giving).
3. Store listing: icon ✅, **feature graphic 1024×500**, phone screenshots, short +
   full description; **data safety** form; content rating.
4. **Production build**: `eas build --platform android --profile production` (AAB).
   Ensure Supabase env vars set in the EAS **production** env.
5. Backend live for what's launching (giving stays gated → fine to launch without it).
6. **Seed day-one content** via admin: Word + devotional + a published reading plan +
   announcement; confirm `allowed_email_domains` seeded so students auto-activate.
7. Merge `dev → stage → main` after device QA.

(iOS later: Apple Developer $99/yr + Apple sign-in; needs a Mac/EAS.)

---

## 7. Brand / design quick ref
- Accent `copper` `#F33A49` · `parchment` `#F7F7F8` · `ink` `#1A1A1A` · `oxblood`
  `#9B2C36`. Seven house identity colors + vivid highlight palette.
- Design references live in `mathetes-mobile/design/` (layout/composition only —
  the warm palette in those files is NOT used).
- Pastoral guardrails are non-negotiable: oversight ≠ surveillance; conservative
  default privacy; Ask-Pastor is a 48h queue; no pressure badges; term-end archive;
  opt-in photos; one-tap block/report/mute.

---

_Keep this file current as the contract evolves — it's what a fresh combined
session reads first._
