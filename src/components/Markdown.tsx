import { Fragment } from "react";
import { View, Text } from "react-native";

// Lightweight markdown renderer for devotional/reading-plan bodies authored in
// the admin (TipTap -> markdown). Handles the cases that actually appear:
// paragraphs, ## / ### headings, > blockquotes, - / 1. lists, and inline
// **bold** and *italic* / _italic_. Not a full CommonMark parser by design.

type InlineToken = { text: string; bold?: boolean; italic?: boolean };

function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  // Match **bold** first, then *italic* or _italic_.
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) tokens.push({ text: text.slice(last, m.index) });
    if (m[1] !== undefined) tokens.push({ text: m[1], bold: true });
    else tokens.push({ text: (m[2] ?? m[3]) as string, italic: true });
    last = re.lastIndex;
  }
  if (last < text.length) tokens.push({ text: text.slice(last) });
  return tokens.length ? tokens : [{ text }];
}

function Inline({ text }: { text: string }) {
  return (
    <>
      {tokenizeInline(text).map((t, i) =>
        t.bold ? (
          <Text key={i} className="font-sans-semibold text-ink">
            {t.text}
          </Text>
        ) : t.italic ? (
          <Text key={i} className="font-display-italic">
            {t.text}
          </Text>
        ) : (
          <Fragment key={i}>{t.text}</Fragment>
        )
      )}
    </>
  );
}

// Devotional bodies authored in TipTap serialize hard line breaks as a trailing
// backslash, so sections (CONFESSION / PRAYER / MEMORY VERSE) arrive as one run
// of "\ LABEL \ text" with no blank-line breaks and render inline with stray
// backslashes. When the body carries these markers, rebuild it into real blocks:
// split on backslash runs, promote known section labels to headings, and
// separate blocks with blank lines. Guarded, so clean markdown is left untouched.
const SECTION_LABELS =
  /^(confession|prayer|prayer point(s)?|memory verse|declaration|reflection|scripture|key verse|application|meditation|affirmation)$/i;

function preprocessSections(body: string): string {
  if (!body.includes("\\")) return body;
  return body
    .split(/\s*\\+\s*/g)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) =>
      SECTION_LABELS.test(s)
        ? `## ${s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())}`
        : s
    )
    .join("\n\n");
}

export function Markdown({ body }: { body: string }) {
  const blocks = preprocessSections(body)
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <View>
      {blocks.map((block, i) => {
        // Heading
        const heading = block.match(/^(#{1,3})\s+(.*)$/);
        if (heading) {
          return (
            <Text
              key={i}
              className="mb-2 mt-7 font-display text-[21px] leading-7 text-copper-deep"
            >
              <Inline text={heading[2]} />
            </Text>
          );
        }

        const lines = block.split("\n").map((l) => l.trim());

        // Blockquote
        if (lines.every((l) => l.startsWith(">"))) {
          const text = lines.map((l) => l.replace(/^>\s?/, "")).join(" ");
          return (
            <Text
              key={i}
              className="my-4 border-l-2 border-l-copper pl-[18px] font-display-italic text-[20px] leading-7 text-ink"
            >
              <Inline text={text} />
            </Text>
          );
        }

        // Unordered / ordered list
        const isUl = lines.every((l) => /^[-*]\s+/.test(l));
        const isOl = lines.every((l) => /^\d+\.\s+/.test(l));
        if ((isUl || isOl) && lines.length > 0) {
          return (
            <View key={i} className="mb-4 mt-1 gap-1.5">
              {lines.map((l, j) => {
                const text = l.replace(/^([-*]|\d+\.)\s+/, "");
                return (
                  <View key={j} className="flex-row gap-2.5">
                    <Text className="font-scripture text-[18px] leading-[30px] text-ink-mute">
                      {isOl ? `${j + 1}.` : "•"}
                    </Text>
                    <Text className="flex-1 font-scripture text-[18px] leading-[30px] text-ink">
                      <Inline text={text} />
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        }

        // Paragraph (single line breaks become spaces)
        return (
          <Text
            key={i}
            className="mb-4 font-scripture text-[18px] leading-[30px] text-ink"
          >
            <Inline text={lines.join(" ")} />
          </Text>
        );
      })}
    </View>
  );
}
