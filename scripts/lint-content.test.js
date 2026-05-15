// @ts-check
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import {
  checkEnglishOnly,
  checkForbiddenTypography,
  collectFiles,
  getExtension,
  lintContent,
} from "./lint-content.js";

test("content lint detects forbidden typography and non-English markers", () => {
  const errors = [];

  checkForbiddenTypography("copy.md", `Hello ${String.fromCharCode(8212)} world`, errors);
  checkEnglishOnly("content/resume.md", "- IT", errors);

  assert.deepEqual(errors, [
    "copy.md:1 contains emdash",
    "content/resume.md contains non-English talk language fallback",
  ]);
});

test("content lint collects checked files and reports errors", async () => {
  const root = await mkdtemp(join(tmpdir(), "pixu-lint-"));

  try {
    await writeFile(join(root, "README.md"), "Plain English", "utf8");
    await writeFile(join(root, "notes.bin"), "ignored", "utf8");

    assert.equal(getExtension("README.md"), ".md");
    assert.deepEqual(await collectFiles(root), [join(root, "README.md")]);
    assert.deepEqual(await lintContent([root]), []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
