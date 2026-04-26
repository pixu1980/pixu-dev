import { STOP_WORDS } from "../_constants.js";

import {
  englishText,
  isExternalUrl,
  normalizeWhitespace,
  slugify,
  toArray,
  toNumber,
} from "../_text.js";

export function getGitHubUsername(config = {}) {
  const candidates = [config.profile, config.api].filter(Boolean);

  for (const candidate of candidates) {
    const profileMatch = String(candidate).match(/github\.com\/([^/?#]+)/i);
    const apiMatch = String(candidate).match(/api\.github\.com\/users\/([^/?#]+)/i);

    if (profileMatch?.[1]) {
      return profileMatch[1];
    }

    if (apiMatch?.[1]) {
      return apiMatch[1];
    }
  }

  return "";
}

export function mapGitHubRepo(repo) {
  return {
    name: repo.name,
    description: repo.description || "",
    url: repo.html_url || repo.url || "",
    homepage: repo.homepage || "",
    language: repo.language || "Mixed",
    stars: toNumber(repo.stargazers_count, toNumber(repo.stars)),
    watchers: toNumber(repo.watchers_count),
    forksCount: toNumber(repo.forks_count),
    openIssues: toNumber(repo.open_issues_count),
    archived: Boolean(repo.archived),
    fork: Boolean(repo.fork),
    private: Boolean(repo.private),
    tags: toArray(repo.topics || repo.tags),
    updatedAt: repo.updated_at || repo.updatedAt || "",
    createdAt: repo.created_at || repo.createdAt || "",
  };
}

export function tokenize(value = "") {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9#+.]+/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

export function sortGitHubRepos(repos, preferredNames) {
  const preferredOrder = new Map(
    toArray(preferredNames).map((name, index) => [String(name).toLowerCase(), index]),
  );

  return [...repos].sort((left, right) => {
    const leftPreferred = preferredOrder.get(left.name.toLowerCase()) ?? Number.POSITIVE_INFINITY;
    const rightPreferred = preferredOrder.get(right.name.toLowerCase()) ?? Number.POSITIVE_INFINITY;

    return (
      leftPreferred - rightPreferred ||
      right.stars - left.stars ||
      (Date.parse(right.updatedAt) || 0) - (Date.parse(left.updatedAt) || 0) ||
      left.name.localeCompare(right.name)
    );
  });
}

export function normalizeGitHubRepos(repos) {
  return toArray(repos)
    .map(mapGitHubRepo)
    .filter((repo) => !repo.private)
    .map((repo) => ({
      ...repo,
      description: englishText(repo.description, ""),
      homepage: isExternalUrl(repo.homepage) ? repo.homepage : "",
      tags: repo.tags.map((tag) => englishText(tag, "", { allowShort: true })).filter(Boolean),
      slug: slugify(repo.name),
    }));
}
