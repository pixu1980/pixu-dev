import {
  getLeadingSectionHtml,
  parseEducationEntriesFromHtml,
  parseExperienceEntriesFromHtml,
  withSectionMeta,
  collectStructuredSectionBlocks,
} from "../markdown/index.js";

import { getPreferredProfileImage } from "../_profile-image.js";
import { toArray } from "../_text.js";

import {
  buildDateMeta,
  buildHeroMeta,
  buildHeroMetrics,
  buildSourceStatus,
  normalizeLinks,
} from "./_helpers.js";
import { SECTION_BUILDERS } from "./sections/index.js";

function normalizeEntry(entry) {
  return {
    ...entry,
    highlights: toArray(entry.highlights),
    skills: toArray(entry.skills),
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
    navigation: withSectionMeta(sections).map((section) => ({
      slug: section.slug,
      label: section.label,
    })),
    sections: withSectionMeta(sections).map((section) =>
      buildSectionView(section, frontmatter, data),
    ),
  };
}
