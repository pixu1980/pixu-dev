// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import { buildEffectiveProfile, buildLinkedInFallback } from "./_profile.js";
import { buildPublicData } from "./_public-data.js";
import {
  buildContactMethods,
  buildHeroMeta,
  buildHeroMetrics,
  buildRepoView,
  buildSourceStatus,
  buildTalkView,
  normalizeLinks,
} from "./_helpers.js";
import { buildTemplateContext } from "./_template-context.js";
import { buildAboutSection } from "./sections/_about.js";
import { buildPortfolioSection } from "./sections/_portfolio.js";
import { buildSpeakingSection } from "./sections/_speaking.js";

const data = {
  github: {
    label: "GitHub",
    status: "live",
    profile: { username: "pixu1980", avatarUrl: "https://github.com/pixu1980.png" },
    stats: { publicRepos: 12, importedRepos: 8, totalStars: 3, totalForks: 1 },
    repos: [
      {
        name: "dout-dev",
        url: "https://github.com/pixu1980/dout-dev",
        description: "",
        homepage: "https://dout.dev",
        stars: 1,
        tags: ["css"],
        updatedAt: "2026-05-01T00:00:00Z",
      },
    ],
    portfolioRepos: [],
    portfolioLanguages: [],
    languages: [{ name: "JavaScript", count: 1, percent: 100 }],
    portfolioTopics: [],
    topics: [{ name: "css", count: 1 }],
    portfolioStats: null,
  },
  sessionize: {
    label: "Sessionize",
    status: "fallback",
    profileUrl: "https://sessionize.com/pixu1980/",
    speaker: { image: "", headline: "Speaker" },
    talks: [
      {
        title: "Talk",
        url: "https://sessionize.com/s/x",
        abstract: "Long abstract",
        relatedRepos: [{ url: "https://github.com/pixu1980/talk-demo" }],
        talkLinks: {
          slides: {
            href: "https://pixu1980.github.io/talk-demo/",
            label: "Slides",
            kind: "slides",
            isExternal: true,
          },
        },
      },
    ],
    events: [{ name: "Roma JS", when: "May 2026", where: "Rome", note: "Talk" }],
  },
  linkedin: {
    label: "LinkedIn",
    status: "fallback",
    name: "Pixu",
    headline: "Engineer",
    summary: "Bio",
    profileImage: "",
    skills: ["CSS"],
    focus: ["A11y"],
    experience: [],
    education: [],
  },
};

const frontmatter = {
  name: "Emiliano",
  title: "Engineer",
  summary: "Summary",
  location: "Rome",
  email: "mail@example.com",
  phone: "+39",
  motto: "Learn",
  links: [{ label: "GitHub", url: "https://github.com/pixu1980" }],
  metrics: [{ label: "Years", value: "29", note: "Shipping" }],
  availability: { headline: "Available", summary: "Contact me" },
};

test("context helpers build normalized links, hero data, repo views, and talk views", () => {
  assert.deepEqual(normalizeLinks(frontmatter.links, "action")[0], {
    href: "https://github.com/pixu1980",
    label: "GitHub",
    kind: "action",
    isExternal: true,
  });
  assert.equal(buildHeroMetrics(frontmatter, data).length, 3);
  assert.deepEqual(buildHeroMeta(frontmatter, data), [
    "Rome",
    "8 public repos",
    "1 talks",
    "3 stars",
  ]);
  assert.equal(buildSourceStatus([data.github])[0].statusLabel, "Live");
  assert.deepEqual(buildContactMethods(frontmatter), ["mail@example.com", "+39", "Rome"]);
  assert.equal(buildRepoView(data.github.repos[0]).repoLink.label, "Repo");
  assert.equal(buildTalkView(data.sessionize.talks[0]).slidesLink.label, "Slides");
});

test("profile, public data, and section builders compose render context", () => {
  const fallback = buildLinkedInFallback(
    { ...frontmatter, fallbacks: { linkedin: { focus: ["CSS"] } } },
    "pixu1980",
    { linkedin: { experience: [{ title: "Dev" }], education: [] } },
  );
  const profile = buildEffectiveProfile(frontmatter, data);
  const publicData = buildPublicData(frontmatter, data, "/profile.jpg", profile);

  assert.equal(fallback.profileImage, "https://github.com/pixu1980.png?size=512");
  assert.equal(profile.name, "Pixu");
  assert.equal(publicData.profile.sourceStatus.github, "live");

  const about = buildAboutSection(
    { slug: "about", bodyHtml: "<h3>Principle</h3><p>Readable</p>", contactHtml: "<p>Contact</p>" },
    frontmatter,
    data,
    "<p>Lead</p>",
  );
  const portfolio = buildPortfolioSection({ slug: "portfolio" }, frontmatter, data, "<p>Lead</p>");
  const speaking = buildSpeakingSection({ slug: "speaking" }, frontmatter, data, "<p>Lead</p>");
  const context = buildTemplateContext({
    frontmatter,
    data,
    profileImage: "/profile.jpg",
    profile,
    sections: [{ slug: "speaking", text: "Speaking", bodyHtml: "<p>Lead</p>" }],
  });

  assert.equal(about.contact.headline, "Available");
  assert.equal(portfolio.repos[0].repoLink.label, "Repo");
  assert.equal(speaking.talks[0].slidesLink.label, "Slides");
  assert.equal(context.navigation[0].slug, "speaking");
});
