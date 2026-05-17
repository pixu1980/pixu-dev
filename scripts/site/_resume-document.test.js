// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getGeneratedSources,
  getLinkedInImportSections,
  parseResumeDocument,
  upsertMarkdownSection,
} from "./_resume-document.js";

test("resume document migrates fallbacks into generated sources and exposes structured sections", () => {
  const document = parseResumeDocument(`---
name: Emiliano Pisu
sourceConfig:
  linkedin:
    enabled: true
fallbacks:
  github:
    repos:
      - name: detector-js
  linkedin:
    headline: Senior Frontend Engineer
---

## About

Lead paragraph.

### Principle

Readable systems.

## Experience

### Senior Frontend Engineer - Pixu Dev

April 2024 - Present

Building things.
`);

  assert.equal(document.frontmatter.name, "Emiliano Pisu");
  assert.equal(getGeneratedSources(document.frontmatter).github.repos[0].name, "detector-js");
  assert.deepEqual(getLinkedInImportSections(document.frontmatter), [
    "headline",
    "summary",
    "skills",
    "experience",
    "education",
  ]);
  assert.equal(document.sections[0].leadHtml.trim(), "<p>Lead paragraph.</p>");
  assert.equal(document.sections[0].blocks[0].heading, "Principle");
  assert.equal(document.sections[1].blocks[0].paragraphs[0], "April 2024 - Present");
});

test("resume document can replace existing markdown sections and append missing ones", () => {
  const initial = `## About

Lead paragraph.

## Experience

Old entry.
`;

  const updated = upsertMarkdownSection(
    initial,
    "Experience",
    "### New Role - Pixu\n\nMay 2026 - Present\n\nShipped.",
  );
  const appended = upsertMarkdownSection(updated, "Education", "### School\n\n2001 - 2005");

  assert.match(appended, /## Experience\n\n### New Role - Pixu/);
  assert.match(appended, /## Education\n\n### School/);
  assert.doesNotMatch(appended, /Old entry\./);
});
