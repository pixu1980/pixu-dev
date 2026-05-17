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

function getTokenRaw(token) {
  return token?.raw || "";
}

function buildParagraphs(tokens = []) {
  return tokens
    .filter((token) => token.type === "paragraph")
    .map((token) => normalizeWhitespace(token.text))
    .filter(Boolean);
}

function collectListItems(items = []) {
  return items.flatMap((item) => {
    const values = [];

    normalizeWhitespace(item?.text) && values.push(normalizeWhitespace(item.text));

    if (Array.isArray(item?.items) && item.items.length) {
      values.push(...collectListItems(item.items));
    }

    return values;
  });
}

function buildListItems(tokens = []) {
  return tokens.flatMap((token) => {
    if (token.type !== "list") return [];
    return collectListItems(token.items || []);
  });
}

function buildStructuredBlocks(bodyMarkdown = "") {
  const tokens = marked.lexer(normalizeTypography(bodyMarkdown));
  const blocks = [];
  const leadTokens = [];
  let currentBlock = null;

  for (const token of tokens) {
    if (token.type === "heading" && token.depth === 3) {
      currentBlock && blocks.push(currentBlock);
      currentBlock = {
        heading: normalizeWhitespace(token.text),
        tokens: [],
      };
      continue;
    }

    if (currentBlock) {
      currentBlock.tokens.push(token);
      continue;
    }

    leadTokens.push(token);
  }

  currentBlock && blocks.push(currentBlock);

  return {
    leadMarkdown: leadTokens.map(getTokenRaw).join("").trim(),
    blocks: blocks.map((block) => {
      const body = block.tokens.map(getTokenRaw).join("").trim();

      return {
        heading: block.heading,
        bodyMarkdown: body,
        bodyHtml: body ? marked.parse(body) : "",
        paragraphs: buildParagraphs(block.tokens),
        listItems: buildListItems(block.tokens),
      };
    }),
  };
}

export function splitMarkdownSections(markdown = "") {
  const tokens = marked.lexer(normalizeTypography(markdown));
  const sections = [];
  let prefaceMarkdown = "";
  let currentSection = null;

  for (const token of tokens) {
    if (token.type === "heading" && token.depth === 2) {
      currentSection && sections.push(currentSection);
      currentSection = {
        slug: slugify(token.text),
        text: normalizeWhitespace(token.text),
        bodyMarkdown: "",
      };
      continue;
    }

    const raw = getTokenRaw(token);

    if (!currentSection) {
      prefaceMarkdown += raw;
      continue;
    }

    currentSection.bodyMarkdown += raw;
  }

  currentSection && sections.push(currentSection);

  return { prefaceMarkdown, sections };
}

export function buildSections(markdown = "") {
  return splitMarkdownSections(markdown).sections.map((section) => {
    const bodyMarkdown = String(section.bodyMarkdown || "").trim();
    const structured = buildStructuredBlocks(bodyMarkdown);

    return {
      ...section,
      bodyMarkdown,
      bodyHtml: bodyMarkdown ? marked.parse(bodyMarkdown) : "",
      leadMarkdown: structured.leadMarkdown,
      leadHtml: structured.leadMarkdown ? marked.parse(structured.leadMarkdown) : "",
      blocks: structured.blocks,
    };
  });
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
