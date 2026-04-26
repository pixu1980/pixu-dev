import { normalizeWhitespace, toArray } from "../_text.js";

export function getSessionLanguageInfo(url) {
  const parts = url.split("/").filter(Boolean);
  const last = parts.at(-1) || "";
  const penultimate = parts.at(-2) || "";
  return {
    id: parts.find((part) => /^\d+$/.test(part)) || `${penultimate}-${last}`.toLowerCase(),
    languageCode: `${penultimate}-${last}`.toLowerCase(),
  };
}

export function buildLanguagesFromText(text = "") {
  return /\b(en|english)\b/.test(normalizeWhitespace(text).toLowerCase()) ? ["EN"] : [];
}

export function getLanguageScore(languageCode, preferredLanguage) {
  if (!languageCode) return 0;
  const code = languageCode.toLowerCase();
  const hasPreferred = code.includes(preferredLanguage);
  const hasEnglish = code.includes("en");
  if (preferredLanguage === "en" && hasEnglish) return 4;
  if (hasPreferred && hasEnglish) return 3;
  if (hasPreferred) return 2;
  return 1;
}

export function getSessionizeApiLanguages(item, preferredLanguage) {
  const text = normalizeWhitespace(
    [
      item?.language,
      item?.languageCode,
      item?.locale,
      item?.track,
      item?.trackName,
      item?.category,
      item?.categoryName,
      item?.room,
      item?.roomName,
      ...toArray(item?.categories).map((category) => category?.name || category),
      ...toArray(item?.questionAnswers).map((answer) => answer?.answer || answer?.value || ""),
    ].join(" "),
  );
  if (/\b(en|english)\b/.test(text.toLowerCase())) return ["EN"];
  if (preferredLanguage === "en" && /\b(it|italian|italiano)\b/.test(text.toLowerCase())) return [];
  return [];
}

export function getSessionizeApiCollection(payload, keys) {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

export function isEnglishTalk(talk) {
  return toArray(talk.languages).some((language) => String(language).toUpperCase() === "EN");
}
