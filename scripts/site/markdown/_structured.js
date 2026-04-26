import { load } from "cheerio";
import { normalizeWhitespace } from "../_text.js";
import { parseInlineList, looksLikeDateRange, splitTitleAndSubtitle } from "./_sections.js";

export function collectStructuredSectionBlocks(sectionHtml = "") {
  const $ = load(`<div data-root>${sectionHtml}</div>`);
  const entries = [];
  let current = null;

  $("[data-root]")
    .children()
    .each((_, node) => {
      const element = $(node);
      const tag = node.tagName?.toLowerCase() || "";
      const text = normalizeWhitespace(element.text());

      if (tag === "h3") {
        current?.heading && entries.push(current);
        current = { heading: text, paragraphs: [], listItems: [] };
        return;
      }

      if (!current || !text) return;

      tag === "p" && current.paragraphs.push(text);

      if (tag === "ul" || tag === "ol") {
        current.listItems.push(
          ...element
            .find("li")
            .map((__, item) => normalizeWhitespace($(item).text()))
            .get()
            .filter(Boolean),
        );
      }
    });

  current?.heading && entries.push(current);

  return entries;
}

export function getLeadingSectionHtml(sectionHtml = "") {
  const $ = load(`<div data-root>${sectionHtml}</div>`);
  const nodes = [];

  $("[data-root]")
    .children()
    .each((_, node) => {
      if (node.tagName?.toLowerCase() === "h3") return false;

      normalizeWhitespace($(node).text()) && nodes.push($.html(node));

      return undefined;
    });

  return nodes.join("\n");
}

export function parseExperienceEntriesFromHtml(sectionHtml = "") {
  return collectStructuredSectionBlocks(sectionHtml)
    .map((entry) => {
      const { title, subtitle } = splitTitleAndSubtitle(entry.heading);
      const paragraphs = [...entry.paragraphs];
      const dateIndex = paragraphs.findIndex(looksLikeDateRange);
      const stackIndex = paragraphs.findIndex((value) => /^Stack:/i.test(value));
      const dateRange = dateIndex >= 0 ? paragraphs.splice(dateIndex, 1)[0] : "";
      const stackLine = stackIndex >= 0 ? paragraphs.splice(stackIndex, 1)[0] : "";

      return {
        title,
        organization: subtitle,
        dateRange,
        summary: paragraphs.join(" "),
        highlights: entry.listItems,
        skills: parseInlineList(stackLine),
      };
    })
    .filter((entry) => entry.title);
}

export function parseEducationEntriesFromHtml(sectionHtml = "") {
  return collectStructuredSectionBlocks(sectionHtml)
    .map((entry) => {
      const { title, subtitle } = splitTitleAndSubtitle(entry.heading);
      const paragraphs = [...entry.paragraphs];
      const dateIndex = paragraphs.findIndex(looksLikeDateRange);
      const dateRange = dateIndex >= 0 ? paragraphs.splice(dateIndex, 1)[0] : "";

      return {
        title,
        subtitle,
        dateRange,
        summary: paragraphs.join(" "),
        highlights: entry.listItems,
      };
    })
    .filter((entry) => entry.title);
}

export function buildMarkdownDerivedFallbacks(sections) {
  const bySlug = new Map(sections.map((section) => [section.slug, section.bodyHtml]));

  return {
    linkedin: {
      experience: parseExperienceEntriesFromHtml(bySlug.get("experience")),
      education: parseEducationEntriesFromHtml(bySlug.get("education")),
    },
  };
}
