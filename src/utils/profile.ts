import type { PhotoVisibility } from "@/lib/database.types";

type Viewable = {
  photo_url: string | null;
  photo_visibility: PhotoVisibility;
  house_id: string | null;
};

// Resolve the photo a viewer is allowed to see, honoring the member's
// visibility choice (pastoral guardrail: conservative default privacy).
//   parish -> everyone in the parish; house -> house-mates only; none -> hidden.
// Returns null when initials should stand in.
export function visiblePhotoUrl(
  profile: Viewable,
  viewerHouseId: string | null
): string | null {
  if (!profile.photo_url) return null;
  switch (profile.photo_visibility) {
    case "parish":
      return profile.photo_url;
    case "house":
      return profile.house_id && profile.house_id === viewerHouseId
        ? profile.photo_url
        : null;
    default:
      return null;
  }
}
