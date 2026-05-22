// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getReleasePreparationCommands,
  getNextVersion,
  getReleaseType,
  hasConventionalReleaseCommit,
  isGitStatusClean,
} from "./release.js";

test("release type defaults to patch and accepts allowed values", () => {
  assert.equal(getReleaseType([]), "patch");
  assert.equal(getReleaseType(["minor"]), "minor");
  assert.equal(getReleaseType(["major"]), "major");
  assert.equal(getReleaseType(["prerelease"]), "prerelease");
});

test("release type rejects unsupported values without exiting process", () => {
  assert.throws(() => getReleaseType(["mega"]), /unsupported release type "mega"/);
});

test("release version bump stays dependency-free", () => {
  assert.equal(getNextVersion("0.2.7", "patch"), "0.2.8");
  assert.equal(getNextVersion("0.2.7", "minor"), "0.3.0");
  assert.equal(getNextVersion("0.2.7", "major"), "1.0.0");
  assert.equal(getNextVersion("0.2.7", "prerelease"), "0.2.8-rc.0");
  assert.equal(getNextVersion("0.2.8-rc.0", "prerelease"), "0.2.8-rc.1");
});

test("release commit detection uses conventional commit prefixes", () => {
  assert.equal(hasConventionalReleaseCommit("abc123 feat(ui): add panel"), true);
  assert.equal(hasConventionalReleaseCommit("abc123 fix: restore nav"), true);
  assert.equal(hasConventionalReleaseCommit("abc123 refactor(build)!: simplify"), true);
  assert.equal(hasConventionalReleaseCommit("abc123 chore(release): v0.2.7"), false);
  assert.equal(hasConventionalReleaseCommit("abc123 build(release): generate dist"), false);
});

test("git status parser treats untracked files as dirty", () => {
  assert.equal(isGitStatusClean(""), true);
  assert.equal(isGitStatusClean(" M dist/index.html\n"), false);
  assert.equal(isGitStatusClean("?? dist/new-file.js\n"), false);
});

test("release preparation runs verify before build", () => {
  assert.deepEqual(getReleasePreparationCommands(), ["pnpm verify", "pnpm build"]);
});
