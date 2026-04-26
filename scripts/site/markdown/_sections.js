import { load } from "cheerio";
import { marked } from "marked";
import { DATE_RANGE_RE } from "../_constants.js";
import { getDisplayLabel } from "../_format.js";
import { normalizeTypography, normalizeWhitespace, slugify, toArray } from "../_text.js";

marked.setOptions({ gfm: true });

export function looksLikeDateRange(value = "") {
  return DATE_RANGE_RE.test(value);
}

export function splitTitleAndSubtitle(value = "") {
  const parts = normalizeWhitespace(value)
    .split(/\s+[-\u2013\u2014]\s+/)
    .map(normalizeWhitespace)
    .filter(Boolean);

  return {
    title: parts[0] || normalizeWhitespace(value),
    subtitle: parts.slice(1).join(" - "),
  };
}

export function parseInlineList(value = "") {
  return normalizeWhitespace(value)
    .replace(/^Stack:\s*/i, "")
    .split(/\s*,\s*/)
    .map(normalizeWhitespace)
    .filter(Boolean);
}

export function buildSections(markdown) {
  const tokens = marked.lexer(normalizeTypography(markdown));
  const sections = [];
  let currentSection = null;

  for (const token of tokens) {
    if (token.type === "heading" && token.depth === 2) {
      currentSection && sections.push(currentSection);

      currentSection = {
        slug: slugify(token.text),
        text: normalizeWhitespace(token.text),
        bodyHtml: "",
      };

      continue;
    }

    if (!currentSection) continue;

    if (token.type === "heading" && token.depth === 3) {
      currentSection.bodyHtml += `<h3 id="${slugify(token.text)}">${marked.parseInline(normalizeTypography(token.text))}</h3>\n`;
      continue;
    }

    currentSection.bodyHtml += normalizeTypography(marked.parser([token]));
  }

  currentSection && sections.push(currentSection);

  return sections;
}

export function withSectionMeta(sections) {
  return toArray(sections).map((section, index) => ({
    ...section,
    label: getDisplayLabel(section),
    titleId: `${section.slug}-title`,
    indexLabel: String(index + 1).padStart(2, "0"),
  }));
}

export function getParagraphsFromHtml(sectionHtml = "") {
  const $ = load(`<div data-root>${sectionHtml}</div>`);

  return $("[data-root]")
    .find("p")
    .map((_, node) => normalizeWhitespace($(node).text()))
    .get()
    .filter(Boolean);
}
