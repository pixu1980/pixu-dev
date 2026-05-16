import { normalizeWhitespace } from "../_text.js";

function stripRepeatedPrefix(value = "", prefix = "") {
  const normalizedPrefix = normalizeWhitespace(prefix);
  let summary = normalizeWhitespace(value);

  if (!normalizedPrefix) return summary;

  const lowerPrefix = normalizedPrefix.toLowerCase();

  while (summary.toLowerCase().startsWith(lowerPrefix)) {
    summary = normalizeWhitespace(summary.slice(normalizedPrefix.length));
  }

  return summary;
}

export function cleanSessionizeSpeakerSummary(value = "", headline = "", fallback = "") {
  return stripRepeatedPrefix(value, headline) || stripRepeatedPrefix(fallback, headline);
}
