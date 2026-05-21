// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import { buildAboutSection } from "./sections/_about.js";
import { buildContactSection } from "./sections/_contact.js";
import { buildSkillClusters } from "./sections/_skills-clusters.js";
import { buildPortfolioSection } from "./sections/_portfolio.js";
import { buildSpeakingSection } from "./sections/_speaking.js";
import { buildEffectiveProfile, buildLinkedInFallback } from "./_profile.js";
import { buildPublicData } from "./_public-data.js";
import {
  buildContactMethods,
  buildEventView,
  buildHeroMeta,
  buildHeroMetrics,
  buildYearsOfExperience,
  buildRepoView,
  buildSourceStatus,
  buildTalkView,
  normalizeLinks,
} from "./_helpers.js";
import { buildTemplateContext } from "./_template-context.js";

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
  metrics: [
    {
      label: "shipping software",
      value: "{{ yearsOfExperience }} years",
      note: "Professional work started in late 1997",
    },
  ],
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
  assert.equal(buildHeroMetrics(frontmatter, data)[0].value, "~29 years");
  assert.equal(buildHeroMetrics(frontmatter, data)[1].value, "12 repo");
  assert.equal(buildHeroMetrics(frontmatter, data)[2].value, "1 talks");
  assert.equal(buildYearsOfExperience(frontmatter, data), "~29");
  assert.deepEqual(buildHeroMeta(frontmatter, data), [
    "Rome",
    "8 public repos",
    "1 talks",
    "3 stars",
  ]);
  assert.equal(buildSourceStatus([data.github])[0].statusLabel, "Live");
  assert.deepEqual(buildContactMethods(frontmatter), [
    {
      href: "mailto:mail@example.com",
      label: "Email",
      value: "mail@example.com",
      description: "Start a project conversation or ask about availability.",
      kind: "email",
      isExternal: false,
    },
    {
      href: "tel:+39",
      label: "Phone",
      value: "+39",
      description: "Use this for direct coordination when async is too slow.",
      kind: "phone",
      isExternal: false,
    },
    {
      href: "https://www.google.com/maps/search/?api=1&query=Rome",
      label: "Location",
      value: "Rome",
      description: "Based in Rome, available for remote and selected onsite work.",
      kind: "location",
      isExternal: true,
    },
  ]);
  assert.equal(buildRepoView(data.github.repos[0]).repoLink.label, "Repo");
  const longTalk = {
    ...data.sessionize.talks[0],
    abstract:
      "This is a deliberately long abstract that should stay complete in rendered HTML content without truncation markers because content paragraphs must not end with visual ellipsis anymore, even when source text is much longer than teaser limits used before.",
  };
  const excerptTalk = {
    ...data.sessionize.talks[0],
    abstract:
      "What if browser already provided design system?Does CSS Reset still make sense in 2025? Yes.",
  };
  assert.equal(buildTalkView(longTalk).slidesLink.label, "Slides");
  assert.match(buildTalkView(longTalk).detailId, /^talk-/);
  assert.equal(buildTalkView(longTalk).teaserText.endsWith("..."), false);
  assert.equal(buildTalkView(longTalk).abstractText.endsWith("..."), false);
  assert.equal(
    buildTalkView(excerptTalk).teaserText,
    "What if browser already provided design system?",
  );
  assert.match(buildEventView(data.sessionize.events[0]).detailId, /^event-/);
});

test("skills aggregation merges source, about insights, and linkedin data into six fixed clusters", () => {
  const aboutSection = {
    slug: "about",
    bodyHtml:
      "<h3>Bridge design and code</h3><p>Turn visual language into production-grade systems.</p>" +
      "<h3>Accessibility is product quality</h3><p>Semantics, WCAG patterns, motion restraint.</p>",
  };
  const skillsSection = {
    slug: "skills",
    bodyHtml:
      "<h3>Frontend Architecture</h3>" +
      "<p>Build native-web interfaces that stay readable, resilient, and maintainable as products grow.</p>" +
      "<p>Tags: HTML, CSS, JavaScript, TypeScript, progressive enhancement.</p>" +
      "<h3>Mentoring and Enablement</h3>" +
      "<p>Raise team capability through reusable guidance, mentoring, and delivery-friendly documentation.</p>" +
      "<ul><li>Mentoring</li><li>Documentation</li><li>Pairing</li></ul>",
  };

  const clusters = buildSkillClusters({
    aboutSection,
    linkedin: data.linkedin,
    skillsSection,
  });

  assert.equal(clusters.length, 6);
  assert.deepEqual(
    clusters.map((cluster) => cluster.slug),
    [
      "ai-product-and-engineering",
      "frontend-architecture",
      "design-engineering-systems",
      "accessibility-and-quality",
      "mentoring-and-enablement",
      "speaking-and-community",
    ],
  );
  assert.ok(
    clusters
      .find((cluster) => cluster.slug === "accessibility-and-quality")
      ?.items.some((item) => item.includes("Accessibility") || item.includes("WCAG")),
  );
  assert.equal(
    clusters.find((cluster) => cluster.slug === "frontend-architecture")?.summary,
    "Build native-web interfaces that stay readable, resilient, and maintainable as products grow.",
  );
  assert.deepEqual(clusters.find((cluster) => cluster.slug === "frontend-architecture")?.items, [
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "progressive enhancement",
  ]);
});

test("profile, public data, and section builders compose render context", () => {
  const fallback = buildLinkedInFallback(
    { ...frontmatter, fallbacks: { linkedin: { focus: ["CSS"] } } },
    "pixu1980",
    {
      linkedin: {
        experience: [{ title: "Dev", summary: "With {{ yearsOfExperience }} years" }],
        education: [],
      },
    },
  );
  const profile = buildEffectiveProfile(frontmatter, data);
  const publicData = buildPublicData(frontmatter, data, "/profile.jpg", profile);

  assert.equal(fallback.profileImage, "assets/images/profile.png");
  assert.equal(fallback.experience[0].summary, "With ~29 years");
  assert.equal(profile.name, "Pixu");
  assert.equal(publicData.profile.sourceStatus.github, "live");

  const about = buildAboutSection(
    { slug: "about", bodyHtml: "<h3>Principle</h3><p>Readable</p>", contactHtml: "<p>Contact</p>" },
    frontmatter,
    data,
    "<p>Lead</p>",
  );
  const contact = buildContactSection(
    { slug: "contact", bodyHtml: "<p>Contact</p>", contactHtml: "<p>Contact</p>" },
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
    sections: [
      {
        slug: "about",
        text: "About",
        bodyHtml: "<h3>Bridge design and code</h3><p>Readable systems.</p>",
      },
      {
        slug: "skills",
        text: "Skills",
        bodyHtml: "<h3>Frontend Architecture</h3><p>HTML, CSS, JavaScript</p>",
      },
      { slug: "speaking", text: "Speaking", bodyHtml: "<p>Lead</p>" },
    ],
  });

  assert.deepEqual(about, {
    slug: "about",
    bodyHtml: "<h3>Principle</h3><p>Readable</p>",
    contactHtml: "<p>Contact</p>",
    leadHtml: "<p>Lead</p>",
  });
  assert.equal(contact.contact.headline, "Available");
  assert.equal(portfolio.repos[0].repoLink.label, "Repo");
  assert.equal(speaking.talks[0].slidesLink.label, "Slides");
  assert.equal(context.navigation[0].slug, "about");
  assert.equal(context.sections.find((section) => section.slug === "skills")?.clusters.length, 6);

  const experienceContext = buildTemplateContext({
    frontmatter,
    data: {
      ...data,
      linkedin: {
        ...data.linkedin,
        experience: [
          {
            title: "Lead Engineer",
            organization: "Studio",
            dateRange: "April 2021 - Present (5 years)",
            summary: "Built resilient UI systems.",
            highlights: ["Accessibility"],
            skills: ["CSS", "JavaScript"],
          },
        ],
      },
    },
    profileImage: "/profile.jpg",
    profile,
    sections: [{ slug: "experience", text: "Experience", bodyHtml: "<p>Lead</p>" }],
  });

  assert.match(experienceContext.sections[0].entries[0].detailId, /^experience-/);
});
