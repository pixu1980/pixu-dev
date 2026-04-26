import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DIST, buildSite } from "./site/index.js";

function getCliOption(name, fallback = "") {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] || fallback : fallback;
}

function getCliBuildOptions() {
  const outDir = getCliOption("--out", getCliOption("--out-dir", DIST));
  const publicDir = getCliOption("--public", getCliOption("--public-dir", outDir));
  return { outDir: resolve(outDir), publicDir: resolve(publicDir) };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  await buildSite(getCliBuildOptions());
}

export { DIST, buildSite };
