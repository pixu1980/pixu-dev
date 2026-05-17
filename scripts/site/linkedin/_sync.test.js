// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import { applyLinkedInSync } from "./_sync.js";

test("LinkedIn sync only refreshes configured PDF sections and rewrites experience markdown", () => {
  const result = applyLinkedInSync({
    frontmatter: {
      title: "Authored headline",
      summary: "Authored summary",
      sourceConfig: {
        linkedin: {
          importSections: ["experience"],
        },
      },
      generated: {
        linkedin: {
          headline: "Stored headline",
          summary: "Stored summary",
          skills: ["Accessibility"],
        },
      },
    },
    content: `## About\n\nLead paragraph.\n\n## Experience\n\nOld entry.\n`,
    parsed: {
      name: "Emiliano Pisu",
      headline: "Parsed headline",
      summary: "Parsed summary",
      skills: ["Web development"],
      experience: [
        {
          title: "Senior Frontend Engineer",
          organization: "Pixu Dev",
          dateRange: "April 2024 - Present",
          summary: "Building resilient interfaces.",
          highlights: [],
          skills: [],
        },
      ],
      education: [],
    },
  });

  assert.equal(result.frontmatter.title, "Authored headline");
  assert.equal(result.frontmatter.summary, "Authored summary");
  assert.equal(result.frontmatter.generated.linkedin.headline, "Stored headline");
  assert.equal(result.frontmatter.generated.linkedin.skills[0], "Accessibility");
  assert.match(result.content, /## Experience\n\n### Senior Frontend Engineer - Pixu Dev/);
  assert.match(result.content, /Building resilient interfaces\./);
});
