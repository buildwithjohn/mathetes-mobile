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

// Break a long paragraph into sentence-aligned chunks that each fit the budget,
// so no single card becomes an unreadable wall of text.
function splitSentences(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) ?? [text];
  return sentences.map((s) => s.trim()).filter(Boolean);
}

export function buildDevotionCards(body: string): DevotionCard[] {
  const segments = (
    body.includes("\\") ? body.split(/\s*\\+\s*/g) : body.split(/\n{2,}/)
  )
    .map((s) => s.trim())
    .filter(Boolean);

  type Raw = { heading: string | null; paragraphs: string[] };
  const cards: Raw[] = [];
  let current: Raw = { heading: null, paragraphs: [] };
  let budget = 0;
  const MAX = 420; // characters per card before starting a new one

  const flush = () => {
    if (current.heading || current.paragraphs.length) {
      cards.push(current);
      current = { heading: null, paragraphs: [] };
      budget = 0;
    }
  };

  // Add one paragraph-sized chunk, starting a fresh card when the running card
  // is already full (but never orphaning a chunk onto its own heading-only page).
  const addChunk = (chunk: string) => {
    if (budget + chunk.length > MAX && current.paragraphs.length) flush();
    current.paragraphs.push(chunk);
    budget += chunk.length;
  };

  for (const seg of segments) {
    if (SECTION_LABELS.test(seg)) {
      flush();
      current.heading = titleCase(seg);
      continue;
    }
    // A single long teaching paragraph is paginated across several cards at
    // sentence boundaries; short ones are packed as before.
    if (seg.length > MAX) {
      let buf = "";
      for (const sentence of splitSentences(seg)) {
        if (buf && buf.length + 1 + sentence.length > MAX) {
          addChunk(buf);
          buf = "";
        }
        buf = buf ? `${buf} ${sentence}` : sentence;
      }
      if (buf) addChunk(buf);
    } else {
      addChunk(seg);
    }
  }
  flush();

  // Never ship a blank card (a stray separator can otherwise leave an empty page).
  const kept = cards.filter(
    (c) => c.heading || c.paragraphs.some((p) => p.trim().length > 0)
  );

  const total = kept.length;
  return kept.map((c, i) => ({ ...c, index: i + 1, total }));
}
