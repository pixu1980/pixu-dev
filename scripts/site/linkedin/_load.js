import { fetchText } from "../_fetch.js";
import { toArray, uniqueBy } from "../_text.js";
import { isPlaceholderProfileImage, parseLinkedInProfile } from "./_parse.js";

async function fetchLinkedInProfileHtml(config) {
  const cookieEnv = config.cookieEnv || "LINKEDIN_COOKIE_LI_AT";
  const cookieValue = process.env[cookieEnv];

  const attempts = cookieValue
    ? [{ Cookie: cookieValue.includes("li_at=") ? cookieValue : `li_at=${cookieValue}` }, {}]
    : [{}];

  let lastError;

  for (const headers of attempts) {
    try {
      return await fetchText(config.profile, headers);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export async function loadLinkedInData(config, fallback) {
  const base = {
    label: "LinkedIn",
    status: "fallback",
    profileUrl: config?.profile || "",
    name: fallback?.name || "",
    headline: fallback?.headline || "",
    summary: fallback?.summary || "",
    profileImage: fallback?.profileImage || "",
    skills: uniqueBy([...toArray(fallback?.skills), ...toArray(fallback?.focus)], (skill) =>
      String(skill).toLowerCase(),
    ),
    focus: toArray(fallback?.focus),
    connections: fallback?.connections || "",
    experience: toArray(fallback?.experience),
    education: toArray(fallback?.education),
  };

  if (!config?.enabled || !config?.profile) return base;

  try {
    const response = await fetchLinkedInProfileHtml(config);
    const parsed = parseLinkedInProfile(response, fallback);

    return {
      ...base,
      ...parsed,
      experience: parsed.experience?.length ? parsed.experience : base.experience,
      education: parsed.education?.length ? parsed.education : base.education,
      skills: parsed.skills?.length ? parsed.skills : base.skills,
      profileImage: isPlaceholderProfileImage(parsed.profileImage)
        ? base.profileImage
        : parsed.profileImage,
      status: "live",
    };
  } catch (error) {
    console.warn(`LinkedIn sync fallback: ${error?.message || "unknown error"}`);
    return base;
  }
}
