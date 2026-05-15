function utilSlug(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureRootAbsolute(url) {
  if (url === undefined || url === null) return "";
  const s = String(url).trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/")) return s;
  if (s.startsWith("./")) return s.slice(1);
  return `/${s.replace(/^\.?\/*/, "")}`;
}

const TAG_UPPERCASE_MAP = new Map([
  ["css", "CSS"],
  ["html", "HTML"],
]);

function applyTagDisplayCase(label) {
  const key = String(label).toLowerCase().trim();
  return TAG_UPPERCASE_MAP.get(key) || label;
}

function getTagHref(tag) {
  if (!tag) return "/tags/";
  if (typeof tag === "object") {
    if (tag.url) return ensureRootAbsolute(tag.url);
    const keyOrName = tag.key || tag.name || tag.label || String(tag);
    return `/tags/${utilSlug(keyOrName)}.html`;
  }
  return `/tags/${utilSlug(tag)}.html`;
}

function getTagLabel(tag) {
  if (!tag) return "";
  const raw = typeof tag === "object" ? tag.label || tag.name || String(tag) : String(tag);
  return applyTagDisplayCase(raw);
}

export { ensureRootAbsolute, getTagHref, getTagLabel, utilSlug };
