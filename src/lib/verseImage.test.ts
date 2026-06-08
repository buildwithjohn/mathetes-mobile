import { verseTypeScale, houseTheme, verseThemes } from "@/lib/verseImage";

describe("verseTypeScale", () => {
  it("shrinks the type as the verse grows", () => {
    const sizes = [40, 100, 180, 280, 400].map((n) =>
      verseTypeScale(n).fontSize
    );
    // Strictly decreasing across the length buckets.
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeLessThan(sizes[i - 1]);
    }
  });

  it("keeps line height above font size for readability", () => {
    for (const len of [10, 90, 150, 250, 500]) {
      const s = verseTypeScale(len);
      expect(s.lineHeight).toBeGreaterThan(s.fontSize);
    }
  });
});

describe("houseTheme", () => {
  it("builds a themed card from a house color", () => {
    const t = houseTheme("Bethel", "#B87333");
    expect(t.bg).toBe("#B87333");
    expect(t.name).toBe("Bethel");
    expect(t.key).toContain("#B87333");
  });
});

describe("verseThemes", () => {
  it("defaults to parchment first", () => {
    expect(verseThemes[0].key).toBe("parchment");
    expect(verseThemes.length).toBeGreaterThanOrEqual(4);
  });
});
