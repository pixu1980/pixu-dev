import { fetchJson, fetchText } from "../_fetch.js";
import { toArray } from "../_text.js";
import { getGitHubUsername, normalizeGitHubRepos, sortGitHubRepos } from "./_shared.js";
import { parseGitHubReposFromHtml } from "./_parse-html.js";

import {
  buildGitHubCollections,
  buildGitHubStats,
  buildLanguageStats,
  buildTopicStats,
} from "./_stats.js";

async function fetchGitHubRepos(username, headers) {
  const repos = [];

  for (let page = 1; page <= 10; page += 1) {
    const url = `https://api.github.com/users/${username}/repos?type=owner&sort=updated&per_page=100&page=${page}`;
    const batch = await fetchJson(url, headers);

    repos.push(...toArray(batch));

    if (!Array.isArray(batch) || batch.length < 100) {
      break;
    }
  }

  return repos;
}

async function fetchGitHubProfileData(username, headers) {
  try {
    const [profile, repos] = await Promise.all([
      fetchJson(`https://api.github.com/users/${username}`, headers),
      fetchGitHubRepos(username, headers),
    ]);

    return { profile, repos };
  } catch (apiError) {
    const profile = await fetchJson(`https://api.github.com/users/${username}`, headers).catch(
      () => ({}),
    );

    const html = await fetchText(`https://github.com/${username}?tab=repositories`);
    const repos = parseGitHubReposFromHtml(html, username);

    if (!repos.length) {
      throw apiError;
    }

    return { profile, repos };
  }
}

export async function loadGitHubData(config, fallback) {
  const username = getGitHubUsername(config);
  const fallbackRepos = sortGitHubRepos(normalizeGitHubRepos(fallback?.repos), config?.featured);
  const token = process.env.GITHUB_TOKEN;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const base = {
    label: "GitHub",
    status: "fallback",
    profileUrl: config?.profile || (username ? `https://github.com/${username}` : ""),
    profile: {
      username,
      name: "",
      bio: "",
      avatarUrl: username ? `https://github.com/${username}.png?size=512` : "",
      followers: 0,
      following: 0,
      publicRepos: fallbackRepos.length,
      createdAt: "",
    },
    stats: buildGitHubStats(fallbackRepos, fallbackRepos.length),
    languages: buildLanguageStats(fallbackRepos),
    topics: buildTopicStats(fallbackRepos),
    repos: fallbackRepos,
    ...buildGitHubCollections(fallbackRepos, config),
  };

  if (!username) {
    return base;
  }

  try {
    const data = await fetchGitHubProfileData(username, headers);
    const repos = sortGitHubRepos(normalizeGitHubRepos(data.repos), config?.featured);

    if (!repos.length) {
      return base;
    }

    return {
      ...base,
      status: "live",
      profile: {
        username,
        name: data.profile?.name || "",
        bio: data.profile?.bio || "",
        avatarUrl: data.profile?.avatar_url || base.profile.avatarUrl,
        followers: Number(data.profile?.followers || 0),
        following: Number(data.profile?.following || 0),
        publicRepos: Number(data.profile?.public_repos || repos.length),
        createdAt: data.profile?.created_at || "",
      },
      stats: buildGitHubStats(repos, data.profile?.public_repos || repos.length),
      languages: buildLanguageStats(repos),
      topics: buildTopicStats(repos),
      repos,
      ...buildGitHubCollections(repos, config),
    };
  } catch (error) {
    console.warn(`GitHub sync fallback: ${error?.message || "unknown error"}`);
    return base;
  }
}
