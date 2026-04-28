import { normalizeWhitespace, toArray, toNumber } from "../_text.js";

export function isTalkRepo(repo) {
  return /^talk-/i.test(repo?.name || "");
}

function getPublishedRepoNames(publishedRepos) {
  return toArray(publishedRepos)
    .map((name) => normalizeWhitespace(name).toLowerCase())
    .filter(Boolean);
}

export function getPortfolioRepos(repos, publishedRepos) {
  const portfolioRepos = toArray(repos).filter((repo) => !isTalkRepo(repo));

  if (!Array.isArray(publishedRepos)) return portfolioRepos;

  const selectedNames = new Set(getPublishedRepoNames(publishedRepos));
  return portfolioRepos.filter((repo) => selectedNames.has(repo.name.toLowerCase()));
}

export function getTalkRepos(repos) {
  return toArray(repos).filter(isTalkRepo);
}

export function buildLanguageStats(repos) {
  const counts = new Map();

  repos.forEach((repo) => {
    const language = repo.language || "Mixed";
    counts.set(language, (counts.get(language) || 0) + 1);
  });

  const total = Math.max(repos.length, 1);

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count, percent: Math.round((count / total) * 100) }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

export function buildTopicStats(repos) {
  const counts = new Map();

  repos
    .flatMap((repo) => repo.tags)
    .forEach((topic) => {
      counts.set(topic, (counts.get(topic) || 0) + 1);
    });

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .slice(0, 12);
}

export function buildGitHubStats(repos, profilePublicRepos = repos.length) {
  return {
    importedRepos: repos.length,
    publicRepos: toNumber(profilePublicRepos, repos.length),
    sourceRepos: repos.length,
    ownRepos: repos.filter((repo) => !repo.fork).length,
    forks: repos.filter((repo) => repo.fork).length,
    totalStars: repos.reduce((sum, repo) => sum + repo.stars, 0),
    totalForks: repos.reduce((sum, repo) => sum + repo.forksCount, 0),
    totalOpenIssues: repos.reduce((sum, repo) => sum + repo.openIssues, 0),
    lastUpdatedAt: repos[0]?.updatedAt || "",
  };
}

export function buildGitHubCollections(repos, config = {}) {
  const portfolioRepos = getPortfolioRepos(repos, config.publishedRepos);
  const talkRepos = getTalkRepos(repos);

  return {
    portfolioRepos,
    talkRepos,
    portfolioStats: buildGitHubStats(portfolioRepos, portfolioRepos.length),
    portfolioLanguages: buildLanguageStats(portfolioRepos),
    portfolioTopics: buildTopicStats(portfolioRepos),
  };
}
