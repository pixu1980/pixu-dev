// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import { getCliBuildOptions } from "./build.js";

test("build CLI options resolve output paths and interactive flags", () => {
  const options = getCliBuildOptions(["--out", "dist-preview", "--interactive"], {});

  assert.match(options.outDir, /dist-preview$/);
  assert.equal(options.publicDir, options.outDir);
  assert.equal(options.sourcePath, undefined);
  assert.equal(options.useFrontmatterFallbacksOnly, false);
  assert.deepEqual(options.interactions, {
    enabled: true,
    selectRepos: true,
    mapTalks: true,
  });
});

test("build CLI options support explicit non-interactive interaction flags", () => {
  const options = getCliBuildOptions(["--select-repos", "--map-talks"], {});

  assert.deepEqual(options.interactions, {
    enabled: true,
    selectRepos: true,
    mapTalks: true,
  });
});

test("build CLI options support markdown-only builds from explicit source", () => {
  const options = getCliBuildOptions([
    "--source",
    "content/resume.md",
    "--markdown-only",
    "--interactive",
  ]);

  assert.match(options.sourcePath, /content\/resume\.md$/);
  assert.equal(options.useFrontmatterFallbacksOnly, true);
  assert.deepEqual(options.interactions, {
    enabled: false,
    selectRepos: false,
    mapTalks: false,
  });
});
