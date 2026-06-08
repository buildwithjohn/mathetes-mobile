import { visiblePhotoUrl } from "@/utils/profile";
import type { PhotoVisibility } from "@/lib/database.types";

const make = (
  photo_url: string | null,
  photo_visibility: PhotoVisibility,
  house_id: string | null
) => ({ photo_url, photo_visibility, house_id });

describe("visiblePhotoUrl", () => {
  it("returns null when there is no photo", () => {
    expect(visiblePhotoUrl(make(null, "parish", "h1"), "h1")).toBeNull();
  });

  it("shows parish-visible photos to everyone", () => {
    expect(visiblePhotoUrl(make("u", "parish", "h1"), "h2")).toBe("u");
    expect(visiblePhotoUrl(make("u", "parish", "h1"), null)).toBe("u");
  });

  it("shows house-visible photos only to house-mates", () => {
    expect(visiblePhotoUrl(make("u", "house", "h1"), "h1")).toBe("u");
    expect(visiblePhotoUrl(make("u", "house", "h1"), "h2")).toBeNull();
    expect(visiblePhotoUrl(make("u", "house", null), null)).toBeNull();
  });

  it("hides photos when visibility is none", () => {
    expect(visiblePhotoUrl(make("u", "none", "h1"), "h1")).toBeNull();
  });
});
