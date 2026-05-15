// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import { buildTemplateContext } from "./_template-context.js";

test("portfolio section is built through dedicated handler and keeps stats shape", () => {
  const context = buildTemplateContext({
    frontmatter: { links: [] },
    profileImage: "/assets/profile.jpg",
    profile: { name: "Pixu", headline: "Engineer", description: "Bio" },
    sections: [{ slug: "portfolio", label: "Portfolio", bodyHtml: "<p>x</p>" }],
    data: {
      github: {
        status: "fallback",
        profile: { username: "pixu1980" },
        portfolioRepos: [],
        repos: [],
        portfolioLanguages: [],
        languages: [],
        portfolioTopics: [],
        topics: [],
        portfolioStats: {
          publicRepos: 0,
          ownRepos: 0,
          totalStars: 0,
          totalForks: 0,
          importedRepos: 0,
          lastUpdatedAt: "",
        },
        stats: {
          publicRepos: 0,
          ownRepos: 0,
          totalStars: 0,
          totalForks: 0,
          importedRepos: 0,
          lastUpdatedAt: "",
        },
      },
      sessionize: { status: "fallback", talks: [], events: [], speaker: {}, profileUrl: "" },
      linkedin: { status: "fallback", skills: [], focus: [], experience: [], education: [] },
    },
  });

  assert.equal(Array.isArray(context.sections), true);
  assert.equal(context.sections[0].slug, "portfolio");
  assert.equal(typeof context.sections[0].stats, "object");
  assert.equal(typeof context.sections[0].stats.latestUpdate, "string");
});
