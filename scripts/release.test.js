// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import { getReleaseType } from "./release.js";

test("release type defaults to patch and accepts allowed values", () => {
  assert.equal(getReleaseType([]), "patch");
  assert.equal(getReleaseType(["minor"]), "minor");
  assert.equal(getReleaseType(["major"]), "major");
  assert.equal(getReleaseType(["prerelease"]), "prerelease");
});

test("release type rejects unsupported values without exiting process", () => {
  assert.throws(() => getReleaseType(["mega"]), /unsupported release type "mega"/);
});
