import { DEFAULT_PROFILE_IMAGE } from "../_profile-image.js";

export function buildLinkedInFallback(frontmatter, _githubUsername, derivedFallbacks) {
  return {
    ...frontmatter.fallbacks?.linkedin,
    name: frontmatter.name,
    profileImage: frontmatter.fallbacks?.linkedin?.profileImage || DEFAULT_PROFILE_IMAGE,
    experience: frontmatter.fallbacks?.linkedin?.experience?.length
      ? frontmatter.fallbacks.linkedin.experience
      : derivedFallbacks.linkedin.experience,
    education: frontmatter.fallbacks?.linkedin?.education?.length
      ? frontmatter.fallbacks.linkedin.education
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
