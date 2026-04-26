import { formatDate, formatNumber, getBuildDateParts, getStatusLabel } from "../_format.js";
import { isExternalUrl, normalizeWhitespace, toArray, truncateText } from "../_text.js";

export function normalizeLinks(links, kind = "link") {
  return toArray(links)
    .filter((link) => link?.url && link?.label)
    .map((link) => ({
      href: link.url,
      label: link.label,
      kind,
      isExternal: isExternalUrl(link.url),
    }));
}

export function buildHeroMetrics(data) {
  return [
    {
      label: "GitHub repositories",
      value: formatNumber(data.github.stats.publicRepos || data.github.stats.importedRepos),
      note: `${formatNumber(data.github.stats.totalStars)} stars, ${formatNumber(data.github.stats.totalForks)} forks`,
    },
    {
      label: "Sessionize talks",
      value: formatNumber(data.sessionize.talks.length),
      note: `${formatNumber(data.sessionize.events.length)} event appearances`,
    },
    {
      label: "LinkedIn network",
      value: data.linkedin.connections || formatNumber(data.linkedin.experience.length),
      note: data.linkedin.connections
        ? `${formatNumber(data.linkedin.experience.length)} experience entries`
        : `${formatNumber(data.linkedin.education.length)} education entries`,
    },
  ];
}

export function buildHeroMeta(frontmatter, data) {
  return [
    frontmatter.location,
    `${formatNumber(data.github.stats.importedRepos)} public repos`,
    `${formatNumber(data.sessionize.talks.length)} talks`,
    `${formatNumber(data.github.stats.totalStars)} stars`,
  ].filter(Boolean);
}

export function buildSourceStatus(sources) {
  return sources.map((source) => ({
    label: source.label,
    status: source.status,
    statusLabel: getStatusLabel(source.status),
  }));
}

export function buildContactMethods(frontmatter) {
  return [frontmatter.email, frontmatter.phone, frontmatter.location]
    .map((value) => normalizeWhitespace(value))
    .filter(Boolean);
}

export function buildRepoView(repo) {
  const updated = formatDate(repo.updatedAt);

  return {
    ...repo,
    descriptionText: repo.description || "Public repository imported from GitHub during build.",
    starsLabel: `${formatNumber(repo.stars)} stars`,
    updatedLabel: updated ? `Updated ${updated}` : repo.fork ? "Fork" : "Public",
    tagsPreview: repo.tags.slice(0, 5),
    repoLink: { href: repo.url, label: "Repo", kind: "link", isExternal: true },
    siteLink: repo.homepage
      ? { href: repo.homepage, label: "Site", kind: "link", isExternal: true }
      : null,
  };
}

export function buildTalkView(talk) {
  return {
    ...talk,
    abstractText: truncateText(
      talk.abstract || "Talk abstract imported from Sessionize or local fallback data.",
      360,
    ),
    sessionizeLink: { href: talk.url, label: "See on Sessionize", kind: "link", isExternal: true },
    githubLink: talk.relatedRepos?.[0]
      ? {
          href: talk.relatedRepos[0].url,
          label: "See on GitHub",
          kind: "related-repo",
          isExternal: true,
        }
      : null,
  };
}

export function buildEventView(event) {
  return {
    ...event,
    summary: [event.when, event.where, event.note].filter(Boolean).join(" / "),
  };
}

export function buildDateMeta() {
  return getBuildDateParts();
}
