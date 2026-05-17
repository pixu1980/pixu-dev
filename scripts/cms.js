import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { syncResumeSources } from "./site/index.js";

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

export function getCliCmsOptions(argv = process.argv, env = process.env) {
  const sourcePath = getCliOption(
    "--source",
    getCliOption("--from", "content/resume.md", argv),
    argv,
  );
  const interactive = hasCliFlag("--interactive", argv) || hasEnvFlag("PIXU_CMS_INTERACTIVE", env);
  const selectPdfSections =
    interactive ||
    hasCliFlag("--select-pdf-sections", argv) ||
    hasEnvFlag("PIXU_CMS_SELECT_PDF_SECTIONS", env);
  const selectRepos =
    interactive || hasCliFlag("--select-repos", argv) || hasEnvFlag("PIXU_CMS_SELECT_REPOS", env);
  const mapTalks =
    interactive || hasCliFlag("--map-talks", argv) || hasEnvFlag("PIXU_CMS_MAP_TALKS", env);

  return {
    sourcePath: resolve(sourcePath),
    syncFrontmatter: true,
    syncOnly: true,
    interactions: {
      enabled: interactive || selectPdfSections || selectRepos || mapTalks,
      selectPdfSections,
      selectRepos,
      mapTalks,
    },
  };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  await syncResumeSources(getCliCmsOptions());
}
