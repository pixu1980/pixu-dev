# Repository Refinement and Script Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove redundant package scripts, tighten release command behavior, and refactor high-complexity source paths without changing runtime output.

**Architecture:** Work in small TDD slices. First, add script-contract tests that fail on duplicate or misleading commands and README drift. Then simplify package scripts and release argument handling, and finally refactor the largest build-time modules (`scripts/template-engine/_filters.js`, `scripts/site/context/_template-context.js`) by extracting focused helpers while preserving behavior.

**Tech Stack:** Node.js 22+, pnpm, Vite, Biome, Playwright, node:test

---

## Scope and boundaries

- Include: `scripts/**`, `src/**`, `package.json`, `README.md`, `CONTRIBUTING.md`, `vite.config.js`, `.husky/**`.
- Exclude generated artifacts from optimization work: `dist/`, `playwright-report/`, `test-results/`, `node_modules/`.
- User decision applied: remove redundant scripts directly, do not keep deprecation aliases.
- User decision applied: keep only `rel` in `package.json`, update docs to use `pnpm rel -- <type>`.

### Task 1: Add script contract tests (fail first)

**Files:**
- Create: `scripts/_tests/_package-scripts.contract.test.js`
- Test: `scripts/_tests/_package-scripts.contract.test.js`

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/_tests/_package-scripts.contract.test.js`  
Expected: FAIL because `start`, `test:e2e`, and `pnpm rel:patch|minor|major` references still exist.

- [ ] **Step 3: Commit failing test**

```bash
git add scripts/_tests/_package-scripts.contract.test.js
git commit -m "test: add script contract checks"
```

### Task 2: Remove redundant scripts and align release CLI/docs

**Files:**
- Modify: `package.json`
- Modify: `scripts/release.js`
- Modify: `README.md`
- Test: `scripts/_tests/_package-scripts.contract.test.js`

- [ ] **Step 1: Implement script cleanup in `package.json`**

```json
{
  "scripts": {
    "assets:favicons": "node scripts/generate-favicons.js",
    "build": "pnpm assets:favicons && node scripts/build.js --interactive && pnpm format && pnpm lint && vite build",
    "dev": "vite dev",
    "format": "biome format --write .",
    "format:check": "biome format --reporter=summary --diagnostic-level=error .",
    "generate": "node scripts/build.js --out dist --public dist",
    "generate:interactive": "node scripts/build.js --out dist --public dist --interactive",
    "lint": "biome lint . && pnpm lint:content",
    "lint:content": "node scripts/lint-content.js",
    "prepare": "node .husky/install.mjs",
    "prepush:check": "pnpm build && pnpm exec playwright install && pnpm test",
    "preview": "vite preview . --outDir dist",
    "test": "playwright test",
    "rel": "node scripts/release.js"
  }
}
```

- [ ] **Step 2: Add explicit release type parsing in `scripts/release.js`**

```js
const releaseType = process.argv[2] || "patch";
const allowedReleaseTypes = new Set(["patch", "minor", "major", "prerelease"]);

if (!allowedReleaseTypes.has(releaseType)) {
  console.error(`Error: unsupported release type "${releaseType}"`);
  process.exit(1);
}

run(
  `pnpm exec standard-version --release-as ${releaseType} --releaseCommitMessageFormat='chore(release): v{{currentTag}}'`,
);
```

- [ ] **Step 3: Update README release section to the single `rel` command contract**

```sh
pnpm rel -- patch
pnpm rel -- minor
pnpm rel -- major
```

- [ ] **Step 4: Run script contract test**

Run: `node --test scripts/_tests/_package-scripts.contract.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json scripts/release.js README.md scripts/_tests/_package-scripts.contract.test.js
git commit -m "refactor: remove redundant scripts and align release docs"
```

### Task 3: Split template filter registration to reduce complexity

**Files:**
- Create: `scripts/template-engine/filters/_text.js`
- Create: `scripts/template-engine/filters/_html.js`
- Create: `scripts/template-engine/filters/_date.js`
- Create: `scripts/template-engine/filters/_collections.js`
- Create: `scripts/template-engine/filters/index.js`
- Create: `scripts/template-engine/_filters.test.js`
- Modify: `scripts/template-engine/_filters.js`
- Test: `scripts/template-engine/_filters.test.js`

- [ ] **Step 1: Write failing filter parity test**

```js
// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";
import { TemplateRenderer } from "./_renderer.js";

test("built-in filter aliases keep behavior parity", () => {
  const renderer = new TemplateRenderer(process.cwd());
  const filters = Object.fromEntries(renderer.filters);

  assert.equal(filters.slug("Hello World"), "hello-world");
  assert.equal(filters.slugify("Hello World"), "hello-world");
  assert.equal(filters.md("**x**"), filters.markdown("**x**"));
});
```

- [ ] **Step 2: Run test to verify it fails before extraction**

Run: `node --test scripts/template-engine/_filters.test.js`  
Expected: FAIL while new modular files are not wired yet.

- [ ] **Step 3: Extract registration groups and keep aliases**

```js
// scripts/template-engine/_filters.js
import { registerTextFilters } from "./filters/_text.js";
import { registerHtmlFilters } from "./filters/_html.js";
import { registerDateFilters } from "./filters/_date.js";
import { registerCollectionFilters } from "./filters/_collections.js";

export function registerBuiltinFilters(renderer) {
  registerTextFilters(renderer);
  registerHtmlFilters(renderer);
  registerDateFilters(renderer);
  registerCollectionFilters(renderer);
}
```

- [ ] **Step 4: Run filter tests**

Run: `node --test scripts/template-engine/_filters.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/template-engine/_filters.js scripts/template-engine/filters scripts/template-engine/_filters.test.js
git commit -m "refactor: split template filters into focused modules"
```

### Task 4: Refactor section context builder into section handlers

**Files:**
- Create: `scripts/site/context/sections/_about.js`
- Create: `scripts/site/context/sections/_portfolio.js`
- Create: `scripts/site/context/sections/_speaking.js`
- Create: `scripts/site/context/sections/index.js`
- Create: `scripts/site/context/_template-context.test.js`
- Modify: `scripts/site/context/_template-context.js`
- Test: `scripts/site/context/_template-context.test.js`

- [ ] **Step 1: Write failing handler dispatch test**

```js
// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildTemplateContext } from "./_template-context.js";

test("portfolio section is built through dedicated handler and keeps stats shape", () => {
  const context = buildTemplateContext({
    frontmatter: { links: [] },
    profileImage: "/assets/profile.jpg",
    profile: { name: "Pixu", headline: "Engineer", description: "Bio" },
    sections: [{ slug: "portfolio", label: "Portfolio", bodyHtml: "<p>x</p>" }],
    data: {
      github: {
        status: "fallback",
        profile: { username: "pixu1980" },
        portfolioRepos: [],
        repos: [],
        portfolioLanguages: [],
        languages: [],
        portfolioTopics: [],
        topics: [],
        portfolioStats: { publicRepos: 0, ownRepos: 0, totalStars: 0, totalForks: 0, lastUpdatedAt: "" },
        stats: { publicRepos: 0, ownRepos: 0, totalStars: 0, totalForks: 0, lastUpdatedAt: "" }
      },
      sessionize: { status: "fallback", talks: [], events: [], speaker: {}, profileUrl: "" },
      linkedin: { status: "fallback", skills: [], focus: [], experience: [], education: [] }
    }
  });

  assert.equal(Array.isArray(context.sections), true);
  assert.equal(context.sections[0].slug, "portfolio");
  assert.equal(typeof context.sections[0].stats, "object");
});
```

- [ ] **Step 2: Run test to verify it fails before handler extraction**

Run: `node --test scripts/site/context/_template-context.test.js`  
Expected: FAIL while section handler modules do not exist.

- [ ] **Step 3: Extract section-specific builders and dispatch map**

```js
// scripts/site/context/sections/index.js
import { buildAboutSection } from "./_about.js";
import { buildPortfolioSection } from "./_portfolio.js";
import { buildSpeakingSection } from "./_speaking.js";

export const SECTION_BUILDERS = {
  about: buildAboutSection,
  portfolio: buildPortfolioSection,
  speaking: buildSpeakingSection,
};
```

```js
// scripts/site/context/_template-context.js
import { SECTION_BUILDERS } from "./sections/index.js";

function buildSectionView(section, frontmatter, data) {
  const builder = SECTION_BUILDERS[section.slug];
  if (builder) return builder(section, frontmatter, data);
  return buildDefaultSection(section);
}
```

- [ ] **Step 4: Run context test and existing test suites**

Run: `node --test scripts/site/context/_template-context.test.js`  
Expected: PASS.

Run: `pnpm build`  
Expected: PASS.

Run: `pnpm test`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/site/context/_template-context.js scripts/site/context/sections scripts/site/context/_template-context.test.js
git commit -m "refactor: split section context builders by domain"
```

### Task 5: Final regression and documentation sync

**Files:**
- Modify (if needed): `CONTRIBUTING.md`
- Modify (if needed): `README.md`
- Test: full repo checks

- [ ] **Step 1: Ensure docs reference only supported commands**

```md
# Keep only commands that exist in package.json scripts
- pnpm dev
- pnpm build
- pnpm preview
- pnpm test
- pnpm rel -- patch|minor|major
```

- [ ] **Step 2: Run final checks**

Run: `pnpm format:check && pnpm lint && pnpm build && pnpm test`  
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add README.md CONTRIBUTING.md package.json scripts
git commit -m "chore: finalize repo refinement and command docs"
```

## Self-review results

1. **Spec coverage:** Plan covers redundancy and optimization in source modules and `package.json` script cleanup, with explicit docs alignment and test gates.
2. **Placeholder scan:** No TBD/TODO placeholders, all code-affecting steps include concrete snippets and exact commands.
3. **Type consistency:** Function names used across tasks are consistent (`registerBuiltinFilters`, `buildTemplateContext`, `SECTION_BUILDERS`, `rel -- <type>` contract).
