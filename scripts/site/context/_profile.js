import { DEFAULT_PROFILE_IMAGE } from "../_profile-image.js";
import { applyYearsOfExperiencePlaceholders } from "./_helpers.js";

export function buildLinkedInFallback(frontmatter, _githubUsername, derivedFallbacks) {
  const storedLinkedIn = frontmatter.generated?.linkedin || frontmatter.fallbacks?.linkedin || {};
  const experience = storedLinkedIn.experience?.length
    ? storedLinkedIn.experience
    : derivedFallbacks.linkedin.experience;
  const education = storedLinkedIn.education?.length
    ? storedLinkedIn.education
    : derivedFallbacks.linkedin.education;

  const yearsAwareLinkedIn = applyYearsOfExperiencePlaceholders(
    {
      ...storedLinkedIn,
      experience,
      education,
    },
    frontmatter,
    {
      linkedin: {
        experience,
      },
    },
  );

  return {
    ...yearsAwareLinkedIn,
    name: frontmatter.name,
    profileImage: storedLinkedIn.profileImage || DEFAULT_PROFILE_IMAGE,
    experience: yearsAwareLinkedIn.experience,
    education: yearsAwareLinkedIn.education,
  };
}

export function buildEffectiveProfile(frontmatter, data) {
  return {
    name: data.linkedin.name || frontmatter.name || "",
    headline: data.linkedin.headline || frontmatter.title || "",
    description: data.linkedin.summary || frontmatter.summary || "",
  };
}
