import { SECTION_LABELS } from "./_constants.js";
import { normalizeWhitespace, toNumber } from "./_text.js";

export function getStatusLabel(status) {
  if (status === "live") return "Live";

  return "Fallback";
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
  }).format(toNumber(value));
}

export function formatDate(value = "") {
  if (/^Updated\s+/i.test(value)) {
    return normalizeWhitespace(value).replace(/^Updated\s+/i, "");
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date);
}

export function getDisplayLabel(section) {
  return SECTION_LABELS.get(section.slug) || section.text;
}

export function getBuildDateParts() {
  const now = new Date();

  return {
    buildDate: now.toISOString().slice(0, 10),
    year: String(now.getFullYear()),
    lastUpdated: new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(now),
  };
}
