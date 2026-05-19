import { collectStructuredSectionBlocks } from "../../markdown/index.js";
import { normalizeWhitespace, slugify, toArray } from "../../_text.js";

const TAG_PREFIX_RE = /^(tags?|keywords?):\s*/i;

const CLUSTERS = [
  {
    slug: "ai-product-and-engineering",
    title: "AI Product and Engineering",
    keywords: ["ai", "agent", "workflow", "prompt", "product", "evaluation"],
  },
  {
    slug: "frontend-architecture",
    title: "Frontend Architecture",
    keywords: ["frontend", "html", "css", "javascript", "typescript", "progressive"],
  },
  {
    slug: "design-engineering-systems",
    title: "Design Engineering Systems",
    keywords: ["design", "system", "typography", "motion", "token", "ui"],
  },
  {
    slug: "accessibility-and-quality",
    title: "Accessibility and Quality",
    keywords: ["accessibility", "a11y", "wcag", "quality", "testing", "performance", "browser"],
  },
  {
    slug: "mentoring-and-enablement",
    title: "Mentoring and Enablement",
    keywords: ["mentoring", "documentation", "pairing", "enablement", "teaching", "review"],
  },
  {
    slug: "speaking-and-community",
    title: "Speaking and Community",
    keywords: ["speaking", "community", "talk", "workshop", "open source", "conference"],
  },
];

function uniqueItems(values = []) {
  const seen = new Set();
  const result = [];

  values.forEach((value) => {
    const normalized = normalizeWhitespace(String(value || ""));

    if (!normalized) return;

    const key = normalized.toLowerCase();
    if (seen.has(key)) return;

    seen.add(key);
    result.push(normalized);
  });

  return result;
}

function splitInlineValues(value = "") {
  return normalizeWhitespace(value)
    .replace(TAG_PREFIX_RE, "")
    .split(/,|\u2022|\//)
    .map((item) =>
      normalizeWhitespace(item)
        .replace(/^and\s+/i, "")
        .replace(/\.$/, ""),
    )
    .filter(Boolean);
}

function collectBlockSignals(section) {
  return collectStructuredSectionBlocks(section || { bodyHtml: "" }).map((block) => ({
    heading: normalizeWhitespace(block.heading || ""),
    items: uniqueItems([
      ...toArray(block.paragraphs).flatMap(splitInlineValues),
      ...toArray(block.listItems).flatMap(splitInlineValues),
    ]),
  }));
}

function collectSkillBlockSignals(section) {
  return collectStructuredSectionBlocks(section || { bodyHtml: "" }).map((block) => {
    const heading = normalizeWhitespace(block.heading || "");
    const paragraphs = toArray(block.paragraphs)
      .map((value) => normalizeWhitespace(value))
      .filter(Boolean);
    const tagParagraphs = paragraphs.filter((value) => TAG_PREFIX_RE.test(value));
    const listItems = toArray(block.listItems).flatMap(splitInlineValues);

    if (tagParagraphs.length > 0 || listItems.length > 0) {
      return {
        heading,
        summary: paragraphs.filter((value) => !TAG_PREFIX_RE.test(value)).join(" "),
        items: uniqueItems([...tagParagraphs.flatMap(splitInlineValues), ...listItems]),
      };
    }

    if (paragraphs.length <= 1) {
      return {
        heading,
        summary: "",
        items: uniqueItems(paragraphs.flatMap(splitInlineValues)),
      };
    }

    return {
      heading,
      summary: paragraphs[0],
      items: uniqueItems(paragraphs.slice(1).flatMap(splitInlineValues)),
    };
  });
}

function tokenize(value = "") {
  return new Set(
    normalizeWhitespace(value)
      .toLowerCase()
      .match(/[a-z0-9]+/g) || [],
  );
}

function containsKeyword(text = "", keyword = "") {
  const normalizedText = normalizeWhitespace(text).toLowerCase();
  const normalizedKeyword = normalizeWhitespace(keyword).toLowerCase();

  if (!normalizedKeyword) {
    return false;
  }

  if (normalizedKeyword.includes(" ")) {
    return normalizedText.includes(normalizedKeyword);
  }

  return tokenize(normalizedText).has(normalizedKeyword);
}

function matchCluster(text = "") {
  const normalized = normalizeWhitespace(text).toLowerCase();

  if (!normalized) {
    return "frontend-architecture";
  }

  const direct = CLUSTERS.find((cluster) => cluster.slug === slugify(normalized));
  if (direct) {
    return direct.slug;
  }

  const scored = CLUSTERS.map((cluster) => ({
    slug: cluster.slug,
    score: cluster.keywords.reduce(
      (total, keyword) => total + Number(containsKeyword(normalized, keyword)),
      0,
    ),
  })).sort((left, right) => right.score - left.score);

  return scored[0]?.score > 0 ? scored[0].slug : "frontend-architecture";
}

export function buildSkillClusters({ aboutSection, linkedin, skillsSection }) {
  const buckets = new Map(
    CLUSTERS.map((cluster) => [cluster.slug, { ...cluster, summary: "", items: [] }]),
  );

  collectSkillBlockSignals(skillsSection).forEach((signal) => {
    const slug = matchCluster(`${signal.heading} ${signal.summary} ${signal.items.join(" ")}`);
    const bucket = buckets.get(slug);

    bucket.summary = signal.summary || bucket.summary;
    bucket.items = uniqueItems([...bucket.items, ...signal.items]);
  });

  collectBlockSignals(aboutSection).forEach((signal) => {
    const slug = matchCluster(`${signal.heading} ${signal.items.join(" ")}`);
    const bucket = buckets.get(slug);

    bucket.items = uniqueItems([...bucket.items, signal.heading, ...signal.items]);
  });

  toArray(linkedin?.skills).forEach((item) => {
    const bucket = buckets.get(matchCluster(item));
    bucket.items = uniqueItems([...bucket.items, item]);
  });

  toArray(linkedin?.focus).forEach((item) => {
    const bucket = buckets.get(matchCluster(item));
    bucket.items = uniqueItems([...bucket.items, item]);
  });

  return CLUSTERS.map((cluster) => ({
    slug: cluster.slug,
    title: cluster.title,
    summary: buckets.get(cluster.slug).summary,
    items: buckets.get(cluster.slug).items.slice(0, 8),
  }));
}
