# Mathetes × YouVersion product audit — July 2026

## North star

Adopt YouVersion's **daily rhythm, reading focus, editorial visual quality, and
low-friction sharing**. Do not copy its generic social graph. Mathetes should
feel like the spiritual home for a student within a real parish, campus, house,
and discipleship relationship.

## What Mathetes already does better for this audience

- Real campus → house membership, rather than anonymous follows.
- A parish-focused daily Word, scheduled devotionals, Ask Pastor, prayer wall,
  DMs, house chats, safety tools, and pastoral roles.
- Private reading-plan reflection with explicit discipler sharing, not public
  spiritual performance.
- Verse-image studio, multiple public-domain Bible versions, highlights,
  bookmarks, reading plans, and content scheduling.

## Gaps worth closing

| Priority | Experience gap | Mobile | Backend + admin requirement |
|---|---|---|---|
| P0 | Editorial content covers | Content is mostly text/gradients | Add `cover_image_url` to devotional + WOTD; pastor uploads/selects cover; mobile has fallback artwork. |
| P0 | Bible action sheet | Highlight/bookmark works, but verse interaction needs a calmer share/copy/note/compare flow | Notes UI, share attribution, analytics events. |
| P0 | Daily habit loop | Streak exists but no gentle catch-up/reminder/calendar story | Personal reminder preferences, notification schedule, private weekly recap. |
| P1 | Plan together | Plans are individual | Invite a house/discipleship circle; optional discussion prompt; no public ranking. |
| P1 | Bible listening + compare | Translation switch exists; no audio or side-by-side compare | Licensed/public-domain audio source, download strategy, compare reader. |
| P1 | Prayer journey | Prayer wall is strong but lacks private answer/remember flow | Answered-prayer state, private prayer list, prayer reminders. |
| P1 | Content discovery | Archive/library exist but lack visual browse/filtering | Series cover, topic, author, campus event metadata, featured collections. |
| P2 | Campus events | Announcements are not an event surface | Events table, RSVP/attendance privacy, admin composer, reminder notifications. |
| P2 | Content intelligence | Admin sees operational tools, not content resonance | Aggregate completion/read/share metrics; never expose private messages/reflections. |

## UI direction

1. **Today becomes an editorial feed.** One large daily Word, one visual
   devotional card, then a quiet continuation card (Bible/plan). Use real
   content art, generous crop, clear hierarchy, restrained motion.
2. **Bible becomes the calmest screen.** Full-width reading, one selected-verse
   liner, bottom action tray, tactile highlighter swatches, short labels. No
   clutter over Scripture.
3. **Community feels like an inbox, not a social feed.** Keep house-first chats,
   but introduce an optional weekly house prompt and a compact upcoming-meetup
   card. Avoid follower counts, public streaks, or engagement pressure.
4. **Use original campus imagery.** The included `devotional-fallback-v1.png`
   is original Mathetes artwork. Real pastoral content should use uploaded
   covers; avoid generic stock photos and avoid copying YouVersion assets.

## First build sequence

1. Add dynamic cover images end to end: database/RLS/types → admin uploader →
   mobile cards/reader with fallback artwork.
2. Finish the Bible selection tray: copy, share image, note, compare, bookmark,
   highlight and remove—each with clear feedback.
3. Build private reminders + a gentle weekly recap.
4. Build house plan circles and event cards only after the reading habit is
   reliably delightful.

## Guardrails

- No follower graph, public accountability score, leaderboard, or visible
  spiritual-performance metric.
- House membership and discipleship permissions remain the RLS boundary.
- Personal notes, reflections, DMs, and private prayers stay private.
- Analytics are aggregate content signals only.
