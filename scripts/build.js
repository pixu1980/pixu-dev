import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DIST, buildSite } from "./site/index.js";

function getCliOption(name, fallback = "") {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] || fallback : fallback;
}

function hasCliFlag(name) {
  return process.argv.includes(name);
}

function hasEnvFlag(name) {
  return ["1", "true", "yes"].includes(String(process.env[name] || "").toLowerCase());
}

function getCliBuildOptions() {
  const outDir = getCliOption("--out", getCliOption("--out-dir", DIST));
  const publicDir = getCliOption("--public", getCliOption("--public-dir", outDir));
  const interactive = hasCliFlag("--interactive") || hasEnvFlag("PIXU_BUILD_INTERACTIVE");
  const selectRepos =
    interactive || hasCliFlag("--select-repos") || hasEnvFlag("PIXU_BUILD_SELECT_REPOS");
  const mapTalks = interactive || hasCliFlag("--map-talks") || hasEnvFlag("PIXU_BUILD_MAP_TALKS");
  const linkedinBrowserEnabled =
    hasCliFlag("--linkedin-browser") || hasEnvFlag("PIXU_BUILD_LINKEDIN_BROWSER");
  const linkedinBrowserConfirm = interactive && !linkedinBrowserEnabled;
  const interactions = {
    enabled: interactive || selectRepos || mapTalks || linkedinBrowserEnabled,
    selectRepos,
    mapTalks,
    linkedinBrowser: {
      enabled: linkedinBrowserEnabled,
      confirm: linkedinBrowserConfirm,
    },
  };

  return { outDir: resolve(outDir), publicDir: resolve(publicDir), interactions };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  await buildSite(getCliBuildOptions());
}

export { DIST, buildSite };
export { getCliBuildOptions };
