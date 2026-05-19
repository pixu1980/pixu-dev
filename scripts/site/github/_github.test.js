// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import { parseGitHubNumber, parseGitHubReposFromHtml } from "./_parse-html.js";
import {
  getGitHubUsername,
  mapGitHubRepo,
  normalizeGitHubRepos,
  sortGitHubRepos,
  tokenize,
} from "./_shared.js";
import {
  buildGitHubCollections,
  buildGitHubStats,
  buildLanguageStats,
  buildTopicStats,
  getPortfolioRepos,
  getTalkRepos,
  isTalkRepo,
} from "./_stats.js";

const repos = [
  {
    name: "dout-dev",
    html_url: "https://github.com/pixu1980/dout-dev",
    description: "English public CMS",
    homepage: "https://dout.dev",
    language: "JavaScript",
    stargazers_count: 3,
    forks_count: 2,
    topics: ["cms", "html"],
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    name: "talk-css",
    html_url: "https://github.com/pixu1980/talk-css",
    description: "English slides",
    language: "CSS",
    stargazers_count: 1,
    topics: ["talk"],
  },
];

test("GitHub shared helpers normalize repos and tokens", () => {
  assert.equal(getGitHubUsername({ profile: "https://github.com/pixu1980" }), "pixu1980");
  assert.equal(
    getGitHubUsername({ api: "https://api.github.com/users/pixu1980/repos" }),
    "pixu1980",
  );
  assert.equal(mapGitHubRepo(repos[0]).stars, 3);
  assert.deepEqual(tokenize("The CSS + HTML toolkit"), ["css", "html", "toolkit"]);

  const normalized = normalizeGitHubRepos([...repos, { name: "private", private: true }]);

  assert.equal(normalized.length, 2);
  assert.equal(normalized[0].slug, "dout-dev");
  assert.equal(sortGitHubRepos(normalized, ["talk-css"])[0].name, "dout-dev");
});

test("GitHub repos sort by latest update before stars or featured order", () => {
  const normalized = normalizeGitHubRepos([
    {
      name: "featured-old",
      html_url: "https://github.com/pixu1980/featured-old",
      description: "Featured old repository",
      stargazers_count: 20,
      updated_at: "2026-01-01T00:00:00Z",
    },
    {
      name: "fresh-low-star",
      html_url: "https://github.com/pixu1980/fresh-low-star",
      description: "Fresh repository",
      stargazers_count: 1,
      updated_at: "2026-05-15T00:00:00Z",
    },
    {
      name: "middle",
      html_url: "https://github.com/pixu1980/middle",
      description: "Middle repository",
      stargazers_count: 5,
      updated_at: "2026-03-01T00:00:00Z",
    },
  ]);

  const sorted = sortGitHubRepos(normalized, ["featured-old"]);

  assert.deepEqual(
    sorted.map((repo) => repo.name),
    ["fresh-low-star", "middle", "featured-old"],
  );

  assert.equal(buildGitHubStats(sorted).lastUpdatedAt, "2026-05-15T00:00:00Z");
});

test("GitHub stats split portfolio and talk repos", () => {
  const normalized = normalizeGitHubRepos(repos);

  assert.equal(isTalkRepo(normalized[1]), true);

  assert.deepEqual(
    getPortfolioRepos(normalized).map((repo) => repo.name),
    ["dout-dev"],
  );

  assert.deepEqual(
    getTalkRepos(normalized).map((repo) => repo.name),
    ["talk-css"],
  );

  assert.deepEqual(
    buildLanguageStats(normalized).map((entry) => entry.name),
    ["CSS", "JavaScript"],
  );

  assert.equal(buildTopicStats(normalized)[0].name, "cms");
  assert.equal(buildGitHubStats(normalized, 10).publicRepos, 10);
  assert.equal(buildGitHubCollections(normalized).talkRepos.length, 1);
});

test("GitHub HTML parser extracts repository rows and compact numbers", () => {
  assert.equal(parseGitHubNumber("1.2k"), 1200);

  const parsed = parseGitHubReposFromHtml(
    `<ul id="user-repositories-list"><li><h3><a href="/pixu1980/demo">demo</a></h3><p itemprop="description">English demo repo</p><span itemprop="programmingLanguage">JavaScript</span><a href="/pixu1980/demo/stargazers">2</a><a href="/pixu1980/demo/forks">1</a><a class="topic-tag">css</a>Updated May 2026</li></ul>`,
    "pixu1980",
  );

  assert.equal(parsed[0].name, "demo");
  assert.equal(parsed[0].html_url, "https://github.com/pixu1980/demo");
  assert.equal(parsed[0].stargazers_count, 2);
});
