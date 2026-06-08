import { greeting, paragraphs, sentences, initials } from "@/utils/text";

describe("greeting", () => {
  const at = (h: number) => greeting(new Date(2026, 0, 1, h, 0, 0));
  it("greets by time of day", () => {
    expect(at(6)).toBe("Good morning");
    expect(at(11)).toBe("Good morning");
    expect(at(12)).toBe("Good afternoon");
    expect(at(16)).toBe("Good afternoon");
    expect(at(17)).toBe("Good evening");
    expect(at(23)).toBe("Good evening");
  });
});

describe("paragraphs", () => {
  it("splits on blank lines and trims", () => {
    expect(paragraphs("One.\n\nTwo.\n\n\n  Three.  ")).toEqual([
      "One.",
      "Two.",
      "Three.",
    ]);
  });
  it("drops empty input", () => {
    expect(paragraphs("\n\n   \n\n")).toEqual([]);
  });
});

describe("sentences", () => {
  it("splits a paragraph into sentences", () => {
    expect(sentences("Trust the Lord. Lean not. Be still!")).toEqual([
      "Trust the Lord.",
      "Lean not.",
      "Be still!",
    ]);
  });
  it("returns the whole string when there is no terminator", () => {
    expect(sentences("no terminator here")).toEqual(["no terminator here"]);
  });
});

describe("initials", () => {
  it("takes up to two initials, uppercased", () => {
    expect(initials("ada lovelace")).toBe("AL");
    expect(initials("Grace Brewster Hopper")).toBe("GB");
    expect(initials("Madonna")).toBe("M");
  });
  it("handles extra whitespace", () => {
    expect(initials("  john   doe  ")).toBe("JD");
  });
});
