// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import { mergeSectionsForRender } from "./_merge-sections.js";
import {
  buildSections,
  getParagraphsFromHtml,
  looksLikeDateRange,
  parseInlineList,
  splitTitleAndSubtitle,
  withSectionMeta,
} from "./_sections.js";
import {
  buildMarkdownDerivedFallbacks,
  collectStructuredSectionBlocks,
  getLeadingSectionHtml,
  parseEducationEntriesFromHtml,
  parseExperienceEntriesFromHtml,
} from "./_structured.js";

test("Markdown section parser builds slugs, meta, paragraphs, and inline lists", () => {
  const sections = buildSections("## Portfolio\n\nLead.\n\n### Item - Org\n\nStack: HTML, CSS");

  assert.equal(sections[0].slug, "portfolio");
  assert.equal(sections[0].blocks[0].heading, "Item - Org");
  assert.equal(sections[0].leadHtml.trim(), "<p>Lead.</p>");
  assert.equal(withSectionMeta(sections)[0].indexLabel, "01");
  assert.deepEqual(getParagraphsFromHtml(sections[0].bodyHtml), ["Lead.", "Stack: HTML, CSS"]);
  assert.deepEqual(parseInlineList("Stack: HTML, CSS"), ["HTML", "CSS"]);
  assert.equal(looksLikeDateRange("May 2026 - Present"), true);
  assert.deepEqual(splitTitleAndSubtitle("Role - Company"), { title: "Role", subtitle: "Company" });
});

test("Structured markdown parser extracts leading copy, entries, and merged contact", () => {
  const html =
    "<p>Lead.</p><h3>Engineer - Pixu</h3><p>May 2026 - Present</p><p>Summary</p><ul><li>Built UI</li></ul>";
  const blocks = collectStructuredSectionBlocks(html);
  const sections = [
    { slug: "about", bodyHtml: "<p>About</p>" },
    { slug: "contact", bodyHtml: "<p>Contact</p>" },
    { slug: "experience", bodyHtml: html },
    { slug: "education", bodyHtml: "<h3>School - Rome</h3><p>2001</p>" },
  ];

  assert.equal(blocks[0].heading, "Engineer - Pixu");
  assert.equal(getLeadingSectionHtml(html), "<p>Lead.</p>");
  assert.equal(parseExperienceEntriesFromHtml(html)[0].organization, "Pixu");
  assert.equal(parseEducationEntriesFromHtml(sections[3].bodyHtml)[0].title, "School");
  assert.equal(
    mergeSectionsForRender(sections).find((section) => section.slug === "about").contactHtml,
    "<p>Contact</p>",
  );
  assert.equal(buildMarkdownDerivedFallbacks(sections).linkedin.experience[0].title, "Engineer");
});
