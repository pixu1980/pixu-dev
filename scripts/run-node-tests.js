import { spawnSync } from "node:child_process";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

async function collectTestFiles(root, files = []) {
  const info = await stat(root);

  if (info.isDirectory()) {
    const entries = await readdir(root);
    await Promise.all(entries.map((entry) => collectTestFiles(join(root, entry), files)));
    return files;
  }

  if (root.endsWith(".test.js")) {
    files.push(root);
  }

  return files;
}

async function getNodeTestFiles(roots = ["scripts", "src/scripts"]) {
  const files = (await Promise.all(roots.map((root) => collectTestFiles(root)))).flat();
  return files.sort();
}

async function runNodeTests() {
  const files = await getNodeTestFiles();

  if (!files.length) {
    console.error("No Node test files found.");
    return 1;
  }

  const result = spawnSync(process.execPath, ["--test", ...files], { stdio: "inherit" });
  return result.status ?? 1;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  process.exit(await runNodeTests());
}

export { collectTestFiles, getNodeTestFiles, runNodeTests };
