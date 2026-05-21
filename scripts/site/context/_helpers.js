import { formatDate, formatNumber, getBuildDateParts, getStatusLabel } from "../_format.js";
import {
  extractExcerptText,
  isExternalUrl,
  normalizeWhitespace,
  slugify,
  toArray,
} from "../_text.js";

function collectExperienceStartYears(frontmatter, data) {
  const years = [];

  for (const experience of toArray(data.linkedin?.experience)) {
    const match = String(experience?.dateRange || "").match(/\b(19|20)\d{2}\b/);
    if (match) years.push(Number(match[0]));
  }

  for (const metric of toArray(frontmatter.metrics)) {
    const match = String(metric?.note || "").match(/\b(19|20)\d{2}\b/);
    if (match) years.push(Number(match[0]));
  }

  const explicitYear = Number(frontmatter.careerStartYear);
  if (Number.isFinite(explicitYear)) years.push(explicitYear);

  return years.filter((year) => Number.isFinite(year) && year > 1900);
}

export function buildYearsOfExperience(frontmatter, data) {
  const years = collectExperienceStartYears(frontmatter, data);
  const startYear = years.length ? Math.min(...years) : new Date().getFullYear();
  const currentYear = new Date().getFullYear();

  return `~${Math.max(currentYear - startYear, 0)}`;
}

function replaceYearsPlaceholder(value, yearsOfExperience) {
  if (typeof value !== "string") return value;

  return value.replaceAll("{{ yearsOfExperience }}", yearsOfExperience);
}

function mapYearsPlaceholders(value, yearsOfExperience) {
  if (Array.isArray(value)) {
    return value.map((item) => mapYearsPlaceholders(item, yearsOfExperience));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        mapYearsPlaceholders(item, yearsOfExperience),
      ]),
    );
  }

  return replaceYearsPlaceholder(value, yearsOfExperience);
}

export function applyYearsOfExperiencePlaceholders(value, frontmatter, data) {
  return mapYearsPlaceholders(value, buildYearsOfExperience(frontmatter, data));
}

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

export function buildHeroMetrics(frontmatter, data) {
  const yearsOfExperience = buildYearsOfExperience(frontmatter, data);

  return [
    ...toArray(frontmatter.metrics).map((metric) => ({
      label: metric.label,
      value:
        metric.label === "shipping software" &&
        replaceYearsPlaceholder(metric.value, yearsOfExperience) === metric.value
          ? yearsOfExperience
          : replaceYearsPlaceholder(metric.value, yearsOfExperience),
      note: metric.note,
    })),
    {
      label: "GitHub repositories",
      value: `${formatNumber(data.github.stats.publicRepos || data.github.stats.importedRepos)} repo`,
      note: `${formatNumber(data.github.stats.totalStars)} stars, ${formatNumber(data.github.stats.totalForks)} forks`,
    },
    {
      label: "Sessionize talks",
      value: `${formatNumber(data.sessionize.talks.length)} talks`,
      note: `${formatNumber(data.sessionize.events.length)} event appearances`,
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
  const email = normalizeWhitespace(frontmatter.email || "");
  const phoneLabel = normalizeWhitespace(frontmatter.phone || "");
  const phoneHref = phoneLabel.replace(/[^\d+]/g, "");
  const location = normalizeWhitespace(frontmatter.location || "");

  return [
    email
      ? {
          href: `mailto:${email}`,
          label: "Email",
          value: email,
          description: "Start a project conversation or ask about availability.",
          kind: "email",
          isExternal: false,
        }
      : null,
    phoneLabel
      ? {
          href: `tel:${phoneHref}`,
          label: "Phone",
          value: phoneLabel,
          description: "Use this for direct coordination when async is too slow.",
          kind: "phone",
          isExternal: false,
        }
      : null,
    location
      ? {
          href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`,
          label: "Location",
          value: location,
          description: "Based in Rome, available for remote and selected onsite work.",
          kind: "location",
          isExternal: true,
        }
      : null,
  ].filter(Boolean);
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

export function buildDetailId(prefix, parts = []) {
  const seed = toArray(parts)
    .map((part) => normalizeWhitespace(String(part || "")))
    .filter(Boolean)
    .join("-");

  return `${prefix}-${slugify(seed || "item")}`;
}

function buildCompactSummary(value = "", fallback = "") {
  return extractExcerptText(value || fallback, { maxLength: 120, maxSentences: 1 });
}

export function buildTalkView(talk) {
  const sessionizeLink = talk.talkLinks?.sessionize || {
    href: talk.url,
    label: "Sessionize",
    kind: "link",
    isExternal: true,
  };
  const githubLink =
    talk.talkLinks?.github ||
    (talk.relatedRepos?.[0]
      ? {
          href: talk.relatedRepos[0].url,
          label: "GitHub",
          kind: "related-repo",
          isExternal: true,
        }
      : null);
  const slidesLink = talk.talkLinks?.slides || null;

  return {
    ...talk,
    detailId: buildDetailId("talk", [talk.title]),
    teaserText: buildCompactSummary(
      talk.abstract,
      "Talk abstract imported from Sessionize or local fallback data.",
    ),
    abstractText: normalizeWhitespace(
      talk.abstract || "Talk abstract imported from Sessionize or local fallback data.",
    ),
    sessionizeLink,
    githubLink,
    slidesLink,
  };
}

export function buildEventView(event) {
  return {
    ...event,
    detailId: buildDetailId("event", [event.name, event.when, event.where]),
    teaserText: [event.when, event.where].filter(Boolean).join(" / "),
    summary: [event.when, event.where, event.note].filter(Boolean).join(" / "),
  };
}

export function buildDateMeta() {
  return getBuildDateParts();
}
