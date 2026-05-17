// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import { getCliCmsOptions } from "./cms.js";

test("cms CLI options default to content resume markdown source", () => {
  const options = getCliCmsOptions([], {});

  assert.match(options.sourcePath, /content\/resume\.md$/);
  assert.equal(options.syncFrontmatter, true);
  assert.equal(options.syncOnly, true);
  assert.deepEqual(options.interactions, {
    enabled: false,
    selectPdfSections: false,
    selectRepos: false,
    mapTalks: false,
  });
});

test("cms CLI options enable interactive mappings and repo selection", () => {
  const options = getCliCmsOptions(["--interactive", "--source", "content/custom.md"], {});

  assert.match(options.sourcePath, /content\/custom\.md$/);
  assert.deepEqual(options.interactions, {
    enabled: true,
    selectPdfSections: true,
    selectRepos: true,
    mapTalks: true,
  });
});

test("cms CLI options enable PDF section selection explicitly", () => {
  const options = getCliCmsOptions(["--select-pdf-sections"], {});

  assert.deepEqual(options.interactions, {
    enabled: true,
    selectPdfSections: true,
    selectRepos: false,
    mapTalks: false,
  });
});
