import { isPlaceholderProfileImage } from "./linkedin/_pdf.js";

export const DEFAULT_PROFILE_IMAGE = "assets/images/profile.png";

export function getPreferredProfileImage(data) {
  const candidates = [
    data.linkedin?.profileImage,
    data.sessionize?.speaker?.image,
    DEFAULT_PROFILE_IMAGE,
    data.github?.profile?.avatarUrl,
  ].filter(Boolean);

  return (
    candidates.find((candidate) => !isPlaceholderProfileImage(candidate)) || DEFAULT_PROFILE_IMAGE
  );
}
