// Split a devotional body into a small set of shareable "cards" (one image
// each). Known sections (Confession / Prayer / Memory Verse ...) each become
// their own card; the teaching before them is packed into cards by length so
// nothing is cut mid-sentence. Mirrors the section handling in Markdown.tsx.

export type DevotionCard = {
  heading: string | null;
  paragraphs: string[];
  index: number;
  total: number;
};

const SECTION_LABELS =
  /^(confession|prayer|prayer point(s)?|memory verse|declaration|reflection|scripture|key verse|application|meditation|affirmation)$/i;

function titleCase(s: string): string {
  return s.replace(
    /\w\S*/g,
    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  );
}

export function buildDevotionCards(body: string): DevotionCard[] {
  const segments = (
    body.includes("\\") ? body.split(/\s*\\+\s*/g) : body.split(/\n{2,}/)
  )
    .map((s) => s.trim())
    .filter(Boolean);

  const cards: { heading: string | null; paragraphs: string[] }[] = [];
  let current: { heading: string | null; paragraphs: string[] } = {
    heading: null,
    paragraphs: [],
  };
  let budget = 0;
  const MAX = 460; // characters per card before starting a new one

  const flush = () => {
    if (current.heading || current.paragraphs.length) {
      cards.push(current);
      current = { heading: null, paragraphs: [] };
      budget = 0;
    }
  };

  for (const seg of segments) {
    if (SECTION_LABELS.test(seg)) {
      flush();
      current.heading = titleCase(seg);
      continue;
    }
    if (budget + seg.length > MAX && current.paragraphs.length) flush();
    current.paragraphs.push(seg);
    budget += seg.length;
  }
  flush();

  const total = cards.length;
  return cards.map((c, i) => ({ ...c, index: i + 1, total }));
}
