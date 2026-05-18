import {
  getLeadingSectionHtml,
  parseEducationEntriesFromHtml,
  parseExperienceEntriesFromHtml,
  withSectionMeta,
  collectStructuredSectionBlocks,
} from "../markdown/index.js";

import { getPreferredProfileImage } from "../_profile-image.js";
import { normalizeWhitespace, slugify, toArray } from "../_text.js";

import {
  buildDateMeta,
  buildHeroMeta,
  buildHeroMetrics,
  buildSourceStatus,
  normalizeLinks,
} from "./_helpers.js";
import { SECTION_BUILDERS } from "./sections/index.js";

const MONTH_SHORT = new Map([
  ["january", "Jan"],
  ["february", "Feb"],
  ["march", "Mar"],
  ["april", "Apr"],
  ["may", "May"],
  ["june", "Jun"],
  ["july", "Jul"],
  ["august", "Aug"],
  ["september", "Sep"],
  ["october", "Oct"],
  ["november", "Nov"],
  ["december", "Dec"],
]);

function formatRangeDatePart(value = "") {
  const normalized = normalizeWhitespace(value);

  if (!normalized) return "";
  if (/^\d{4}$/.test(normalized)) return normalized;
  if (/^present$/i.test(normalized)) return "Present";

  const match = normalized.match(/^([A-Za-z]+)\s+(\d{4})$/);

  if (!match) return normalized;

  const [, month, year] = match;
  const shortMonth = MONTH_SHORT.get(month.toLowerCase()) || month;

  return `${shortMonth} ${year}`;
}

function buildDateRangeDisplay(dateRange = "") {
  const normalized = normalizeWhitespace(dateRange);

  if (!normalized) return { label: "", duration: "" };

  const durationMatch = normalized.match(/\(([^)]+)\)\s*$/);
  const duration = durationMatch ? normalizeWhitespace(durationMatch[1]) : "";
  const rangeOnly = durationMatch
    ? normalizeWhitespace(normalized.slice(0, durationMatch.index))
    : normalized;

  const parts = rangeOnly
    .split(/\s+-\s+/)
    .map(normalizeWhitespace)
    .filter(Boolean);

  if (parts.length !== 2) {
    return { label: normalized, duration: "" };
  }

  const [start, end] = parts;

  return {
    label: `${formatRangeDatePart(start)} - ${formatRangeDatePart(end)}`,
    duration,
  };
}

function orderSections(sections = [], frontmatter = {}) {
  const desiredOrder = toArray(frontmatter.sectionsConfig?.order)
    .map((item) => slugify(String(item || "")))
    .filter(Boolean);

  if (!desiredOrder.length) {
    return toArray(sections);
  }

  const orderIndex = new Map(desiredOrder.map((slug, index) => [slug, index]));

  return toArray(sections)
    .map((section, index) => ({ section, index }))
    .sort((a, b) => {
      const aOrder = orderIndex.has(a.section.slug)
        ? orderIndex.get(a.section.slug)
        : Number.MAX_SAFE_INTEGER;
      const bOrder = orderIndex.has(b.section.slug)
        ? orderIndex.get(b.section.slug)
        : Number.MAX_SAFE_INTEGER;

      if (aOrder !== bOrder) return aOrder - bOrder;

      return a.index - b.index;
    })
    .map((item) => item.section);
}

function normalizeEntry(entry) {
  const dateRangeDisplay = buildDateRangeDisplay(entry?.dateRange);

  return {
    ...entry,
    highlights: toArray(entry.highlights),
    skills: toArray(entry.skills),
    dateRangeLabel: dateRangeDisplay.label,
    dateRangeDuration: dateRangeDisplay.duration,
  };
}

function buildDefaultSection(section, leadHtml) {
  return { ...section, leadHtml, bodyHtml: section.bodyHtml };
}

function buildExperienceSection(section, data, leadHtml) {
  const entries = toArray(data.linkedin.experience).length
    ? data.linkedin.experience
    : parseExperienceEntriesFromHtml(section);

  return { ...section, leadHtml, entries: entries.map(normalizeEntry) };
}

function buildSkillsSection(section, leadHtml) {
  return { ...section, leadHtml, blocks: collectStructuredSectionBlocks(section) };
}

function buildEducationSection(section, data, leadHtml) {
  const entries = toArray(data.linkedin.education).length
    ? data.linkedin.education
    : parseEducationEntriesFromHtml(section);

  return { ...section, leadHtml, entries: entries.map(normalizeEntry) };
}

function buildSectionView(section, frontmatter, data) {
  const leadHtml = getLeadingSectionHtml(section);
  const builder = SECTION_BUILDERS[section.slug];

  if (builder) {
    return builder(section, frontmatter, data, leadHtml);
  }

  if (section.slug === "experience") {
    return buildExperienceSection(section, data, leadHtml);
  }

  if (section.slug === "skills") {
    return buildSkillsSection(section, leadHtml);
  }

  if (section.slug === "education") {
    return buildEducationSection(section, data, leadHtml);
  }

  return buildDefaultSection(section, leadHtml);
}

export function buildTemplateContext({ frontmatter, data, profileImage, sections, profile }) {
  const dateMeta = buildDateMeta();
  const orderedSections = orderSections(sections, frontmatter);
  const sectionsWithMeta = withSectionMeta(orderedSections);

  return {
    site: {
      name: profile.name,
      title: profile.headline,
      summary: profile.description,
      description: profile.description,
      location: frontmatter.location || "",
      motto: frontmatter.motto || "",
      profileImage,
      profileImageAlt: `${profile.name} profile portrait`,
      headerLinks: normalizeLinks(toArray(frontmatter.links), "action"),
      footerLinks: normalizeLinks(toArray(frontmatter.links), "link"),
      heroMeta: buildHeroMeta(frontmatter, data),
      heroMetrics: buildHeroMetrics(frontmatter, data),
      sourceStatus: buildSourceStatus([data.github, data.sessionize, data.linkedin]),
      activeProfileImage: getPreferredProfileImage(data),
      ...dateMeta,
    },
    navigation: sectionsWithMeta.map((section) => ({
      slug: section.slug,
      label: section.label,
    })),
    sections: sectionsWithMeta.map((section) => buildSectionView(section, frontmatter, data)),
  };
}
