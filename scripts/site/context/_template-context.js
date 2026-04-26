import { buildLanguageStats } from "../github/index.js";
import {
  collectStructuredSectionBlocks,
  getLeadingSectionHtml,
  getParagraphsFromHtml,
  parseEducationEntriesFromHtml,
  parseExperienceEntriesFromHtml,
  withSectionMeta,
} from "../markdown/index.js";

import { formatDate, formatNumber } from "../_format.js";
import { getPreferredProfileImage } from "../_profile-image.js";
import { normalizeWhitespace, toArray } from "../_text.js";

import {
  buildContactMethods,
  buildDateMeta,
  buildEventView,
  buildHeroMeta,
  buildHeroMetrics,
  buildRepoView,
  buildSourceStatus,
  buildTalkView,
  normalizeLinks,
} from "./_helpers.js";

function normalizeEntry(entry) {
  return {
    ...entry,
    highlights: toArray(entry.highlights),
    skills: toArray(entry.skills),
  };
}

function buildSectionView(section, frontmatter, data) {
  const leadHtml = getLeadingSectionHtml(section.bodyHtml);

  if (section.slug === "about") {
    return {
      ...section,
      leadHtml,
      insightBlocks: collectStructuredSectionBlocks(section.bodyHtml),
      linkedin: {
        ...data.linkedin,
        displaySkills: data.linkedin.skills?.length ? data.linkedin.skills : data.linkedin.focus,
      },
      contact: {
        headline: frontmatter.availability?.headline || "Available for design engineering work",
        summary:
          frontmatter.availability?.summary ||
          getParagraphsFromHtml(section.contactHtml).join(" ") ||
          normalizeWhitespace(section.contactHtml || ""),
        methods: buildContactMethods(frontmatter),
        links: normalizeLinks(toArray(frontmatter.links).slice(0, 5), "link"),
      },
    };
  }

  if (section.slug === "experience") {
    const entries = toArray(data.linkedin.experience).length
      ? data.linkedin.experience
      : parseExperienceEntriesFromHtml(section.bodyHtml);
    return { ...section, leadHtml, entries: entries.map(normalizeEntry) };
  }

  if (section.slug === "skills") {
    return { ...section, leadHtml, blocks: collectStructuredSectionBlocks(section.bodyHtml) };
  }

  if (section.slug === "projects") {
    const repos = data.github.portfolioRepos?.length
      ? data.github.portfolioRepos
      : data.github.repos;

    const languages = data.github.portfolioLanguages?.length
      ? data.github.portfolioLanguages
      : buildLanguageStats(repos);

    const topics = data.github.portfolioTopics?.length
      ? data.github.portfolioTopics
      : data.github.topics;

    const stats = data.github.portfolioStats || data.github.stats;

    return {
      ...section,
      leadHtml,
      repos: repos.map(buildRepoView),
      languages,
      languageBars: languages.slice(0, 8),
      topics,
      topicLabels: topics.map((topic) => `${topic.name} x${topic.count}`),
      stats: {
        publicRepos: formatNumber(stats.publicRepos || stats.importedRepos),
        ownRepos: formatNumber(stats.ownRepos),
        totalStars: formatNumber(stats.totalStars),
        totalForks: formatNumber(stats.totalForks),
        languages: formatNumber(languages.length),
        latestUpdate: formatDate(stats.lastUpdatedAt) || "Recent",
        username: data.github.profile.username,
      },
    };
  }
  if (section.slug === "talks-speaking") {
    return {
      ...section,
      speaker: data.sessionize.speaker,
      profileLink: {
        href: data.sessionize.profileUrl,
        label: "Sessionize profile",
        kind: "link",
        isExternal: true,
      },
      talks: data.sessionize.talks.map(buildTalkView),
      events: data.sessionize.events.slice(0, 16).map(buildEventView),
    };
  }

  if (section.slug === "education") {
    const entries = toArray(data.linkedin.education).length
      ? data.linkedin.education
      : parseEducationEntriesFromHtml(section.bodyHtml);

    return { ...section, leadHtml, entries: entries.map(normalizeEntry) };
  }

  return { ...section, leadHtml, bodyHtml: section.bodyHtml };
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
      heroMetrics: buildHeroMetrics(data),
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
