// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import { linkTalksToRepos } from "./_link-talks.js";

test("links mapped talks to GitHub and GitHub Pages slides", () => {
  const [talk] = linkTalksToRepos(
    [
      {
        id: "110137",
        title: "(class)less is more",
        url: "https://sessionize.com/s/pixu1980/classless-is-more/110137",
        abstract: "Classless CSS systems",
      },
    ],
    [
      {
        name: "talk-classless-is-more",
        url: "https://github.com/pixu1980/talk-classless-is-more",
        language: "CSS",
        description: "Slides and examples",
        tags: ["css"],
        stars: 1,
      },
    ],
    [
      {
        session: "(class)less is more",
        sessionId: "110137",
        sessionUrl: "https://sessionize.com/s/pixu1980/classless-is-more/110137",
        repoName: "talk-classless-is-more",
      },
    ],
  );

  assert.deepEqual(talk.talkLinks.github, {
    href: "https://github.com/pixu1980/talk-classless-is-more",
    label: "GitHub",
    kind: "related-repo",
    isExternal: true,
  });
  assert.deepEqual(talk.talkLinks.slides, {
    href: "https://pixu1980.github.io/talk-classless-is-more/",
    label: "Slides",
    kind: "slides",
    isExternal: true,
  });
});

test("uses explicit slide URL overrides from talk repo map", () => {
  const [talk] = linkTalksToRepos(
    [
      {
        id: "128446",
        title: "Accessible Web: combining WCAG, WAI-ARIA, and Semantics",
        url: "https://sessionize.com/s/pixu1980/accessible-web-combining-wcag-wai-aria-and-semanti/128446",
        abstract: "Accessible web semantics",
      },
    ],
    [],
    [
      {
        session: "Accessible Web: combining WCAG, WAI-ARIA, and Semantics",
        sessionId: "128446",
        repoName: "talk-semantic-accessible-web",
        repoUrl: "https://github.com/pixu1980/talk-semantic-accessible-web",
        slidesUrl: "https://pixu1980.github.io/talk-semantic-accessible-web/",
      },
    ],
  );

  assert.equal(
    talk.relatedRepos[0].url,
    "https://github.com/pixu1980/talk-semantic-accessible-web",
  );
  assert.equal(
    talk.talkLinks.slides.href,
    "https://pixu1980.github.io/talk-semantic-accessible-web/",
  );
});
