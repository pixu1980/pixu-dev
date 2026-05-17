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

  assert.equal(pkg.devDependencies?.["standard-version"], undefined);
  assert.equal(scripts.start, undefined, "start must be removed, use dev");
  assert.equal(scripts["test:e2e"], undefined, "test:e2e must be removed, use test");
  assert.equal(scripts["build:interactive"], undefined, "build:interactive must be removed");
  assert.equal(scripts["setup:browsers"], "playwright install");
  assert.equal(scripts["prepush:check"], "pnpm verify");
  assert.match(String(scripts.verify), /pnpm lint/);
  assert.match(String(scripts.verify), /pnpm format:check/);
  assert.match(String(scripts.verify), /pnpm test/);
  assert.match(String(scripts.cms), /--interactive/, "cms must support interactive sync");
  assert.match(
    String(scripts.build),
    /PIXU_BUILD_MARKDOWN_ONLY=1/,
    "build must read markdown snapshots",
  );
  assert.doesNotMatch(String(scripts.build), /node scripts\/build\.js/);
  assert.match(String(scripts.build), /vite build/);
  assert.equal(scripts.preview, "pnpm build && vite preview . --outDir dist");
  assert.match(
    String(scripts.test),
    /node scripts\/run-node-tests\.js/,
    "test must run Node unit tests",
  );
  assert.match(String(scripts.test), /playwright test/, "test must run Playwright tests");
  assert.equal(scripts["changelog:update"], "node scripts/changelog.js");
  assert.equal(scripts["changelog:regen"], "node scripts/changelog.js --all");
});

test("README docs match script contract", async () => {
  const readme = await readFile(new URL("../../README.md", import.meta.url), "utf8");
  const changelog = await readFile(new URL("../../CHANGELOG.md", import.meta.url), "utf8");

  assert.match(readme, /pnpm 11\.0\.5 or newer/);
  assert.match(readme, /http:\/\/localhost:4317/);
  assert.match(readme, /pnpm rel -- patch/);
  assert.match(readme, /pnpm rel -- minor/);
  assert.match(readme, /pnpm rel -- major/);
  assert.match(readme, /pnpm changelog:update/);
  assert.match(readme, /pnpm changelog:regen/);
  assert.match(readme, /src\/styles\/index\.css/);
  assert.doesNotMatch(readme, /src\/styles\/main\.css/);
  assert.doesNotMatch(readme, /pnpm rel:patch/);
  assert.doesNotMatch(readme, /pnpm rel:minor/);
  assert.doesNotMatch(readme, /pnpm rel:major/);
  assert.doesNotMatch(changelog, /standard-version/);
});

test("Vite local servers bind to localhost only", async () => {
  const viteConfig = await readFile(new URL("../../vite.config.js", import.meta.url), "utf8");

  assert.match(viteConfig, /127\.0\.0\.1/);
  assert.doesNotMatch(viteConfig, /0\.0\.0\.0/);
});

test("ignore rules keep lockfile commit-friendly and local pnpm cache ignored", async () => {
  const gitignore = await readFile(new URL("../../.gitignore", import.meta.url), "utf8");

  assert.match(gitignore, /^\.pnpm-store$/m);
  assert.doesNotMatch(gitignore, /^pnpm-lock\.yaml$/m);
});

test("pre-push hook runs the project quality gate", async () => {
  const hook = await readFile(new URL("../../.husky/pre-push", import.meta.url), "utf8");

  assert.match(hook, /^pnpm prepush:check\s*$/m);
});

test("pages workflow deploys only on semver tags", async () => {
  const workflow = await readFile(
    new URL("../../.github/workflows/deploy-pages.yml", import.meta.url),
    "utf8",
  );

  assert.match(workflow, /tags:\s*[\r\n]+\s*-\s*['"]v\*\.\*\.\*['"]/);
  assert.doesNotMatch(workflow, /branches:\s*\[/);
});
