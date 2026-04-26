import { isPlaceholderProfileImage } from "./linkedin/_parse.js";

export function getPreferredProfileImage(data) {
  const candidates = [
    data.linkedin.profileImage,
    data.sessionize.speaker.image,
    data.github.profile.avatarUrl,
  ].filter(Boolean);

  return (
    candidates.find((candidate) => !isPlaceholderProfileImage(candidate)) || candidates[0] || ""
  );
}
