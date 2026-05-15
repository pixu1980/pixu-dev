// @ts-check
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

async function loadJson(pathname) {
  return JSON.parse(await readFile(pathname, "utf8"));
}

test("package scripts do not contain redundant aliases", async () => {
  const pkg = await loadJson(new URL("../../package.json", import.meta.url));
  const scripts = pkg.scripts || {};

  assert.equal(scripts.start, undefined, "start must be removed, use dev");
  assert.equal(scripts["test:e2e"], undefined, "test:e2e must be removed, use test");
  assert.equal(scripts["build:interactive"], undefined, "build:interactive must be removed");
  assert.match(String(scripts.build), /--interactive/, "build must be interactive");
  assert.match(String(scripts.test), /node --test/, "test must run Node unit tests");
  assert.match(String(scripts.test), /playwright test/, "test must run Playwright tests");
});

test("README release docs match rel command contract", async () => {
  const readme = await readFile(new URL("../../README.md", import.meta.url), "utf8");

  assert.match(readme, /pnpm rel -- patch/);
  assert.match(readme, /pnpm rel -- minor/);
  assert.match(readme, /pnpm rel -- major/);
  assert.doesNotMatch(readme, /pnpm rel:patch/);
  assert.doesNotMatch(readme, /pnpm rel:minor/);
  assert.doesNotMatch(readme, /pnpm rel:major/);
});
