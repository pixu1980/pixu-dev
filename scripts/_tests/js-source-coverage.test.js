// @ts-check
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { test } from "node:test";

const coverage = {
  "scripts/build.js": ["scripts/build.test.js"],
  "scripts/changelog.js": ["scripts/changelog.test.js"],
  "scripts/cms.js": ["scripts/cms.test.js"],
  "scripts/generate-favicons.js": ["scripts/generate-favicons.test.js"],
  "scripts/lint-content.js": ["scripts/lint-content.test.js"],
  "scripts/release.js": ["scripts/release.test.js"],
  "scripts/run-node-tests.js": ["scripts/run-node-tests.test.js"],
  "scripts/site/_build-interactions.js": ["scripts/site/_io-loaders.test.js"],
  "scripts/site/_build-site.js": ["scripts/site/_io-loaders.test.js"],
  "scripts/site/_constants.js": ["scripts/site/_text-format.test.js"],
  "scripts/site/_fetch.js": ["scripts/site/_io-loaders.test.js"],
  "scripts/site/_format.js": ["scripts/site/_text-format.test.js"],
  "scripts/site/_profile-image.js": ["scripts/site/_io-loaders.test.js"],
  "scripts/site/_prompt.js": ["scripts/site/_io-loaders.test.js"],
  "scripts/site/_resume-document.js": ["scripts/site/_resume-document.test.js"],
  "scripts/site/_sync-resume.js": ["scripts/site/_build-site.test.js"],
  "scripts/site/_text.js": ["scripts/site/_text-format.test.js"],
  "scripts/site/context/_helpers.js": ["scripts/site/context/_context.test.js"],
  "scripts/site/context/_profile.js": ["scripts/site/context/_context.test.js"],
  "scripts/site/context/_public-data.js": ["scripts/site/context/_context.test.js"],
  "scripts/site/context/_template-context.js": ["scripts/site/context/_context.test.js"],
  "scripts/site/context/sections/_about.js": ["scripts/site/context/_context.test.js"],
  "scripts/site/context/sections/_portfolio.js": ["scripts/site/context/_context.test.js"],
  "scripts/site/context/sections/_speaking.js": ["scripts/site/context/_context.test.js"],
  "scripts/site/github/_load.js": ["scripts/site/_io-loaders.test.js"],
  "scripts/site/github/_parse-html.js": ["scripts/site/github/_github.test.js"],
  "scripts/site/github/_shared.js": ["scripts/site/github/_github.test.js"],
  "scripts/site/github/_stats.js": ["scripts/site/github/_github.test.js"],
  "scripts/site/linkedin/_load.js": ["scripts/site/linkedin/_linkedin.test.js"],
  "scripts/site/linkedin/_pdf.js": ["scripts/site/linkedin/_pdf.test.js"],
  "scripts/site/linkedin/_sync.js": ["scripts/site/linkedin/_sync.test.js"],
  "scripts/site/markdown/_merge-sections.js": ["scripts/site/markdown/_markdown.test.js"],
  "scripts/site/markdown/_sections.js": ["scripts/site/markdown/_markdown.test.js"],
  "scripts/site/markdown/_structured.js": ["scripts/site/markdown/_markdown.test.js"],
  "scripts/site/output/_assets.js": ["scripts/site/_io-loaders.test.js"],
  "scripts/site/output/_ensure-dir.js": ["scripts/site/_io-loaders.test.js"],
  "scripts/site/sessionize/_language.js": ["scripts/site/sessionize/_sessionize.test.js"],
  "scripts/site/sessionize/_link-talks.js": ["scripts/site/sessionize/_link-talks.test.js"],
  "scripts/site/sessionize/_load.js": ["scripts/site/_io-loaders.test.js"],
  "scripts/site/sessionize/_parse-api.js": ["scripts/site/sessionize/_sessionize.test.js"],
  "scripts/site/sessionize/_parse-html.js": ["scripts/site/sessionize/_sessionize.test.js"],
  "scripts/site/sessionize/_speaker-summary.js": ["scripts/site/sessionize/_sessionize.test.js"],
  "scripts/template-engine/_expression-parser.js": [
    "scripts/template-engine/_expression-parser.test.js",
  ],
  "scripts/template-engine/_filters.js": ["scripts/template-engine/_filters.test.js"],
  "scripts/template-engine/_marked-options.js": [
    "scripts/template-engine/filters/_filters.behavior.test.js",
  ],
  "scripts/template-engine/_renderer.js": ["scripts/template-engine/_renderer.test.js"],
  "scripts/template-engine/filters/_collections.js": [
    "scripts/template-engine/filters/_filters.behavior.test.js",
  ],
  "scripts/template-engine/filters/_date.js": [
    "scripts/template-engine/filters/_filters.behavior.test.js",
  ],
  "scripts/template-engine/filters/_html.js": [
    "scripts/template-engine/filters/_filters.behavior.test.js",
  ],
  "scripts/template-engine/filters/_shared.js": [
    "scripts/template-engine/filters/_filters.behavior.test.js",
  ],
  "scripts/template-engine/filters/_text.js": [
    "scripts/template-engine/filters/_filters.behavior.test.js",
  ],
  "src/scripts/app.js": ["tests/resume.spec.js"],
  "src/scripts/components/_utils.js": ["src/scripts/components/_utils.test.js"],
  "src/scripts/components/accent-color-selector/_accent-color-selector.js": [
    "tests/resume.spec.js",
  ],
  "src/scripts/components/color-scheme-selector/_color-scheme-selector.js": [
    "tests/resume.spec.js",
  ],
  "src/scripts/components/display-preferences-popover/_display-preferences-popover.js": [
    "tests/resume.spec.js",
  ],
  "src/scripts/components/pointer-glow/_pointer-glow.js": ["tests/resume.spec.js"],
  "src/scripts/components/scroll-progress/_scroll-progress.js": ["tests/resume.spec.js"],
  "src/scripts/components/skip-link/_skip-link.js": ["tests/resume.spec.js"],
};

async function collectSourceFiles(root, files = []) {
  const info = await stat(root);
  if (info.isDirectory()) {
    const entries = await readdir(root);
    await Promise.all(entries.map((entry) => collectSourceFiles(join(root, entry), files)));
    return files;
  }

  const pathname = relative(process.cwd(), root);
  if (
    pathname.endsWith(".js") &&
    !pathname.endsWith(".test.js") &&
    !pathname.endsWith("index.js")
  ) {
    files.push(pathname);
  }

  return files;
}

test("every non-barrel source JS file has behavior test coverage", async () => {
  const sourceFiles = (
    await Promise.all([collectSourceFiles("scripts"), collectSourceFiles("src/scripts")])
  )
    .flat()
    .sort();

  assert.deepEqual(
    sourceFiles.filter((file) => !coverage[file]),
    [],
  );

  for (const [sourceFile, testFiles] of Object.entries(coverage)) {
    assert.equal(sourceFiles.includes(sourceFile), true, `${sourceFile} must be a tracked source`);
    assert.equal(
      testFiles.some((testFile) => existsSync(testFile)),
      true,
      `${sourceFile} needs an existing test file`,
    );
  }
});
