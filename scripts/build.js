import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DIST, buildSite } from "./site/index.js";

function getCliOption(name, fallback = "", argv = process.argv) {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] || fallback : fallback;
}

function hasCliFlag(name, argv = process.argv) {
  return argv.includes(name);
}

function hasEnvFlag(name, env = process.env) {
  return ["1", "true", "yes"].includes(String(env[name] || "").toLowerCase());
}

function getCliBuildOptions(argv = process.argv, env = process.env) {
  const outDir = getCliOption("--out", getCliOption("--out-dir", DIST, argv), argv);
  const publicDir = getCliOption("--public", getCliOption("--public-dir", outDir, argv), argv);
  const sourcePath = getCliOption(
    "--source",
    getCliOption("--from", env.PIXU_BUILD_SOURCE || "", argv),
    argv,
  );
  const interactive =
    hasCliFlag("--interactive", argv) || hasEnvFlag("PIXU_BUILD_INTERACTIVE", env);
  const markdownOnly =
    hasCliFlag("--markdown-only", argv) || hasEnvFlag("PIXU_BUILD_MARKDOWN_ONLY", env);
  const selectRepos =
    interactive || hasCliFlag("--select-repos", argv) || hasEnvFlag("PIXU_BUILD_SELECT_REPOS", env);
  const mapTalks =
    interactive || hasCliFlag("--map-talks", argv) || hasEnvFlag("PIXU_BUILD_MAP_TALKS", env);
  const interactions = {
    enabled: !markdownOnly && (interactive || selectRepos || mapTalks),
    selectRepos: !markdownOnly && selectRepos,
    mapTalks: !markdownOnly && mapTalks,
  };

  return {
    outDir: resolve(outDir),
    publicDir: resolve(publicDir),
    sourcePath: sourcePath ? resolve(sourcePath) : undefined,
    useFrontmatterFallbacksOnly: markdownOnly,
    interactions,
  };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  await buildSite(getCliBuildOptions());
}

export { DIST, buildSite };
export { getCliBuildOptions };
