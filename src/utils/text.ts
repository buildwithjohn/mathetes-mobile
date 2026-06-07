// Greeting by time of day. Mathetes leans pastoral and warm.
export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// Split lightweight markdown body into paragraphs on blank lines.
export function paragraphs(md: string): string[] {
  return md
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// Split a paragraph into sentences for the staggered Word reveal.
export function sentences(text: string): string[] {
  const matched = text.match(/[^.!?]+[.!?]*\s*/g);
  return (matched ?? [text]).map((s) => s.trim()).filter(Boolean);
}
