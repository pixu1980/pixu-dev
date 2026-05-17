import matter from "gray-matter";

import { buildSections, splitMarkdownSections } from "./markdown/index.js";
import { normalizeWhitespace, slugify, toArray, uniqueBy } from "./_text.js";

const DEFAULT_LINKEDIN_IMPORT_SECTIONS = [
  "headline",
  "summary",
  "skills",
  "experience",
  "education",
];

function normalizeImportSection(value = "") {
  return normalizeWhitespace(value).toLowerCase();
}

function normalizeSectionBodyMarkdown(value = "") {
  return String(value)
    .trim()
    .replace(/\n{3,}/g, "\n\n");
}

function buildMarkdownFromSections(prefaceMarkdown = "", sections = []) {
  const parts = [];
  const normalizedPreface = String(prefaceMarkdown).trim();

  normalizedPreface && parts.push(normalizedPreface);

  sections.forEach((section) => {
    parts.push(`## ${section.text}`);

    const bodyMarkdown = normalizeSectionBodyMarkdown(section.bodyMarkdown);
    bodyMarkdown && parts.push(bodyMarkdown);
  });

  return `${parts.filter(Boolean).join("\n\n").trim()}\n`;
}

export function getGeneratedSources(frontmatter = {}) {
  return structuredClone(frontmatter.generated || frontmatter.fallbacks || {});
}

export function getLinkedInImportSections(frontmatter = {}) {
  const configured = uniqueBy(
    toArray(frontmatter.sourceConfig?.linkedin?.importSections)
      .map(normalizeImportSection)
      .filter(Boolean),
    (value) => value,
  );

  return configured.length ? configured : [...DEFAULT_LINKEDIN_IMPORT_SECTIONS];
}

export function normalizeResumeFrontmatter(frontmatter = {}) {
  const nextFrontmatter = structuredClone(frontmatter);

  nextFrontmatter.generated = getGeneratedSources(nextFrontmatter);
  nextFrontmatter.sourceConfig ??= {};
  nextFrontmatter.sourceConfig.linkedin ??= {};
  nextFrontmatter.sourceConfig.linkedin.importSections = getLinkedInImportSections(nextFrontmatter);

  delete nextFrontmatter.fallbacks;

  return nextFrontmatter;
}

export function parseResumeDocument(markdown = "") {
  const parsed = matter(markdown);
  const content = String(parsed.content || "").replace(/^\s+/, "");

  return {
    frontmatter: normalizeResumeFrontmatter(parsed.data || {}),
    content,
    sections: buildSections(content),
  };
}

export function stringifyResumeDocument(frontmatter = {}, content = "") {
  return matter.stringify(String(content || "").replace(/^\s+/, ""), frontmatter);
}

export function upsertMarkdownSection(content = "", title = "", bodyMarkdown = "") {
  const normalizedTitle = normalizeWhitespace(title);
  const targetSlug = slugify(normalizedTitle);
  const { prefaceMarkdown, sections } = splitMarkdownSections(content);
  let matched = false;

  const nextSections = sections.map((section) => {
    if (
      section.slug !== targetSlug &&
      section.text.toLowerCase() !== normalizedTitle.toLowerCase()
    ) {
      return section;
    }

    matched = true;

    return {
      ...section,
      slug: targetSlug,
      text: normalizedTitle,
      bodyMarkdown: normalizeSectionBodyMarkdown(bodyMarkdown),
    };
  });

  if (!matched) {
    nextSections.push({
      slug: targetSlug,
      text: normalizedTitle,
      bodyMarkdown: normalizeSectionBodyMarkdown(bodyMarkdown),
    });
  }

  return buildMarkdownFromSections(prefaceMarkdown, nextSections);
}
