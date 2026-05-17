import { toArray, uniqueBy } from "../_text.js";
import { extractLinkedInPdfText, findLinkedInPdfPath, parseLinkedInPdfText } from "./_pdf.js";

export function loadStoredLinkedInData(config, stored = {}, fallback = {}) {
  return {
    label: "LinkedIn",
    status: stored?.status || "fallback",
    profileUrl: stored?.profileUrl || config?.profile || fallback?.profileUrl || "",
    name: stored?.name || fallback?.name || "",
    headline: stored?.headline || fallback?.headline || "",
    summary: stored?.summary || fallback?.summary || "",
    profileImage: stored?.profileImage || fallback?.profileImage || "",
    skills: uniqueBy(
      [
        ...toArray(stored?.skills),
        ...toArray(stored?.focus),
        ...toArray(fallback?.skills),
        ...toArray(fallback?.focus),
      ],
      (skill) => String(skill).toLowerCase(),
    ),
    focus: toArray(stored?.focus).length ? toArray(stored.focus) : toArray(fallback?.focus),
    connections: stored?.connections || fallback?.connections || "",
    services: toArray(stored?.services).length
      ? toArray(stored.services)
      : toArray(fallback?.services),
    experience: toArray(stored?.experience).length
      ? toArray(stored.experience)
      : toArray(fallback?.experience),
    education: toArray(stored?.education).length
      ? toArray(stored.education)
      : toArray(fallback?.education),
  };
}

export async function loadLinkedInData(config, fallback, options = {}) {
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
    services: toArray(fallback?.services),
    experience: toArray(fallback?.experience),
    education: toArray(fallback?.education),
  };

  if (!config?.enabled) return base;

  try {
    const pdfPath = await findLinkedInPdfPath(config, options);

    if (!pdfPath) {
      return base;
    }

    const text = await extractLinkedInPdfText(pdfPath);
    const parsed = parseLinkedInPdfText(text, fallback, config);

    return {
      ...base,
      ...parsed,
      profileUrl: parsed.profileUrl || base.profileUrl,
      services: parsed.services?.length ? parsed.services : base.services,
      experience: parsed.experience?.length ? parsed.experience : base.experience,
      education: parsed.education?.length ? parsed.education : base.education,
      skills: parsed.skills?.length ? parsed.skills : base.skills,
      profileImage: parsed.profileImage || base.profileImage,
      status: "live",
    };
  } catch (error) {
    console.warn(`LinkedIn PDF sync fallback: ${error?.message || "unknown error"}`);
    return base;
  }
}
