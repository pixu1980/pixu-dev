import { DEFAULT_PROFILE_IMAGE } from "../_profile-image.js";

export function buildLinkedInFallback(frontmatter, _githubUsername, derivedFallbacks) {
  const storedLinkedIn = frontmatter.generated?.linkedin || frontmatter.fallbacks?.linkedin || {};

  return {
    ...storedLinkedIn,
    name: frontmatter.name,
    profileImage: storedLinkedIn.profileImage || DEFAULT_PROFILE_IMAGE,
    experience: storedLinkedIn.experience?.length
      ? storedLinkedIn.experience
      : derivedFallbacks.linkedin.experience,
    education: storedLinkedIn.education?.length
      ? storedLinkedIn.education
      : derivedFallbacks.linkedin.education,
  };
}

export function buildEffectiveProfile(frontmatter, data) {
  return {
    name: data.linkedin.name || frontmatter.name || "",
    headline: data.linkedin.headline || frontmatter.title || "",
    description: data.linkedin.summary || frontmatter.summary || "",
  };
}
