// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import { getCliBuildOptions } from "./build.js";

test("build CLI options resolve output paths and interactive flags", () => {
  const options = getCliBuildOptions(["--out", "dist-preview", "--interactive"], {});

  assert.match(options.outDir, /dist-preview$/);
  assert.equal(options.publicDir, options.outDir);
  assert.equal(options.interactions.enabled, true);
  assert.equal(options.interactions.selectRepos, true);
  assert.equal(options.interactions.mapTalks, true);
  assert.deepEqual(options.interactions.linkedinBrowser, { enabled: false, confirm: true });
});

test("build CLI options support explicit non-interactive interaction flags", () => {
  const options = getCliBuildOptions(["--select-repos", "--map-talks", "--linkedin-browser"], {});

  assert.equal(options.interactions.enabled, true);
  assert.equal(options.interactions.selectRepos, true);
  assert.equal(options.interactions.mapTalks, true);
  assert.deepEqual(options.interactions.linkedinBrowser, { enabled: true, confirm: false });
});
