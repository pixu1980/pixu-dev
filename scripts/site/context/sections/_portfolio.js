import { buildLanguageStats } from "../../github/index.js";
import { formatDate, formatNumber } from "../../_format.js";
import { buildRepoView } from "../_helpers.js";

function buildPortfolioSection(section, _frontmatter, data, leadHtml) {
  const repos = data.github.portfolioRepos?.length ? data.github.portfolioRepos : data.github.repos;

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

export { buildPortfolioSection };
