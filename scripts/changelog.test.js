// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import { buildChangelog, parseConventionalCommit, replaceVersionSection } from "./changelog.js";

test("conventional commit parser keeps release-worthy entries", () => {
  assert.deepEqual(parseConventionalCommit("abc123 feat(ui): add panel"), {
    hash: "abc123",
    scope: "ui",
    subject: "add panel",
    type: "feat",
  });
  assert.deepEqual(parseConventionalCommit("def456 fix: restore nav"), {
    hash: "def456",
    scope: "",
    subject: "restore nav",
    type: "fix",
  });
  assert.equal(parseConventionalCommit("aaa111 chore(release): v0.2.7"), null);
  assert.equal(parseConventionalCommit("bbb222 docs: update readme"), null);
});

test("changelog builder renders sections without external dependencies", () => {
  const markdown = buildChangelog({
    compareUrl: "https://github.com/pixu1980/pixu-dev-resume/compare/v0.2.7...v0.2.8",
    commitUrl: "https://github.com/pixu1980/pixu-dev-resume/commit/",
    date: "2026-05-17",
    logs: [
      "abc123 feat(ui): add panel",
      "def456 fix: restore nav",
      "aaa111 chore(release): v0.2.7",
    ],
    previousTag: "v0.2.7",
    version: "0.2.8",
  });

  assert.match(markdown, /### \[0\.2\.8\]/);
  assert.match(markdown, /### Features/);
  assert.match(markdown, /\* \*\*ui:\*\* add panel/);
  assert.match(markdown, /### Bug Fixes/);
  assert.match(markdown, /\* restore nav/);
  assert.doesNotMatch(markdown, /chore\(release\)/);
});

test("replaceVersionSection updates an existing release block", () => {
  const existing = [
    "# Changelog",
    "",
    "### [0.2.8](old) (2026-05-16)",
    "",
    "### Features",
    "",
    "* old item",
    "",
    "### [0.2.7](older) (2026-05-15)",
    "",
    "* previous",
    "",
  ].join("\n");
  const section = "### [0.2.8](new) (2026-05-17)\n\n### Bug Fixes\n\n* fixed\n";

  assert.equal(
    replaceVersionSection(existing, "0.2.8", section),
    [
      "# Changelog",
      "",
      "### [0.2.8](new) (2026-05-17)",
      "",
      "### Bug Fixes",
      "",
      "* fixed",
      "",
      "### [0.2.7](older) (2026-05-15)",
      "",
      "* previous",
      "",
    ].join("\n"),
  );
});
