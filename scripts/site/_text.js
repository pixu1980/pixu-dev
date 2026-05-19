import { NON_ENGLISH_TEXT_MARKERS } from "./_constants.js";

export function normalizeTypography(value = "") {
  return String(value)
    .replaceAll("\u2014", " - ")
    .replaceAll("\u2018", "'")
    .replaceAll("\u2019", "'")
    .replaceAll("\u201c", '"')
    .replaceAll("\u201d", '"')
    .replaceAll("\u00ab", '"')
    .replaceAll("\u00bb", '"');
}

export function escapeHtml(value = "") {
  return normalizeTypography(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function escapeAttr(value = "") {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

export function normalizeWhitespace(value = "") {
  return normalizeTypography(value).replace(/\s+/g, " ").trim();
}

export function truncateText(value = "", maxLength = 420) {
  const normalized = normalizeWhitespace(value);

  if (normalized.length <= maxLength) return normalized;

  return `${normalized.slice(0, maxLength).replace(/\s+\S*$/, "")}...`;
}

export function summarizeText(value = "", maxLength = 220) {
  const normalized = normalizeWhitespace(value);

  if (!normalized || normalized.length <= maxLength) {
    return normalized;
  }

  const sentences =
    normalized
      .match(/[^.!?]+(?:[.!?]+|$)/g)
      ?.map((sentence) => normalizeWhitespace(sentence))
      .filter(Boolean) || [];

  if (!sentences.length || sentences[0].length > maxLength) {
    return normalized;
  }

  let summary = "";

  for (const sentence of sentences) {
    const nextValue = summary ? `${summary} ${sentence}` : sentence;

    if (nextValue.length > maxLength) {
      break;
    }

    summary = nextValue;
  }

  return summary || normalized;
}

export function extractExcerptText(value = "", options = {}) {
  const maxLength = options.maxLength ?? 220;
  const maxSentences = options.maxSentences ?? 2;
  const normalized = normalizeWhitespace(value).replace(/([.!?])(?=[A-Z0-9(])/g, "$1 ");

  if (!normalized) {
    return normalized;
  }

  const sentences =
    normalized
      .match(/[^.!?]+(?:[.!?]+|$)/g)
      ?.map((sentence) => normalizeWhitespace(sentence))
      .filter(Boolean) || [];

  if (!sentences.length) {
    return normalized;
  }

  let excerpt = "";
  let sentenceCount = 0;

  for (const sentence of sentences) {
    if (sentenceCount >= maxSentences) {
      break;
    }

    const nextValue = excerpt ? `${excerpt} ${sentence}` : sentence;

    if (nextValue.length > maxLength) {
      break;
    }

    excerpt = nextValue;
    sentenceCount += 1;
  }

  return excerpt || sentences[0] || normalized;
}

export function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function slugify(value = "") {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function splitTextLines(value = "") {
  return String(value).split(/\n+/).map(normalizeWhitespace).filter(Boolean);
}

export function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function toNumber(value, fallback = 0) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

export function uniqueBy(values, getKey) {
  const seen = new Set();

  return values.filter((value) => {
    const key = getKey(value);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function isExternalUrl(url = "") {
  return /^https?:/i.test(url);
}

export function isEnglishText(value = "") {
  const normalized = normalizeWhitespace(value).toLowerCase();

  return normalized
    ? !NON_ENGLISH_TEXT_MARKERS.some((marker) => normalized.includes(marker))
    : false;
}

export function isLikelyEnglish(value = "", options = {}) {
  const normalized = normalizeWhitespace(value);
  const asciiLetters = normalized.match(/[A-Za-z]/g)?.length || 0;
  const allLetters = normalized.match(/\p{L}/gu)?.length || 0;
  const nonAsciiLetters = Math.max(allLetters - asciiLetters, 0);

  if (!normalized || !isEnglishText(normalized)) return false;

  if (allLetters === 0) return Boolean(options.allowShort);

  // Emoji and symbols should not penalize English detection.
  return nonAsciiLetters / Math.max(allLetters, 1) < 0.34;
}

export function englishText(value = "", fallback = "", options = {}) {
  const normalized = normalizeWhitespace(value);

  if (!normalized) return fallback;

  if (normalized.length < 24 && options.allowShort) return normalized;

  return isLikelyEnglish(normalized, options) ? normalized : fallback;
}
