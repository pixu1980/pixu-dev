// @ts-check
import assert from "node:assert/strict";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { getNodeTestFiles } from "./run-node-tests.js";

test("Node test runner discovers nested test files without shell find", async () => {
  const root = await mkdtemp(join(tmpdir(), "pixu-node-tests-"));

  try {
    await mkdir(join(root, "scripts", "nested"), { recursive: true });
    await mkdir(join(root, "src", "scripts"), { recursive: true });
    await writeFile(join(root, "scripts", "alpha.test.js"), "");
    await writeFile(join(root, "scripts", "nested", "beta.test.js"), "");
    await writeFile(join(root, "src", "scripts", "component.test.js"), "");
    await writeFile(join(root, "scripts", "helper.js"), "");

    const files = await getNodeTestFiles([join(root, "scripts"), join(root, "src", "scripts")]);

    assert.deepEqual(
      files.map((file) => file.slice(root.length + 1)),
      ["scripts/alpha.test.js", "scripts/nested/beta.test.js", "src/scripts/component.test.js"],
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
