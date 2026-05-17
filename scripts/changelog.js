import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CHANGELOG = join(ROOT, "CHANGELOG.md");
const PACKAGE_JSON = join(ROOT, "package.json");
const DEFAULT_REPOSITORY_URL = "https://github.com/pixu1980/pixu-dev-resume";
const HEADER = `# Changelog

All notable changes to this project will be documented in this file. Commit messages follow Conventional Commits.
`;

const RELEASE_TYPES = new Map([
  ["feat", "Features"],
  ["fix", "Bug Fixes"],
  ["perf", "Performance Improvements"],
  ["refactor", "Code Refactoring"],
]);

function git(args, fallback = "") {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return fallback;
  }
}

function normalizeRepositoryUrl(value = "") {
  return String(value)
    .replace(/^git\+/, "")
    .replace(/\.git$/, "")
    .replace(/^git@github\.com:/, "https://github.com/");
}

function getRepositoryUrl(pkg = {}) {
  const raw = typeof pkg.repository === "string" ? pkg.repository : pkg.repository?.url;
  return normalizeRepositoryUrl(raw || pkg.homepage || DEFAULT_REPOSITORY_URL);
}

function parseConventionalCommit(line = "") {
  const match = String(line).match(/^([0-9a-f]+)\s+([a-z]+)(?:\(([^)]+)\))?!?:\s+(.+)$/i);

  if (!match) return null;

  const [, hash, type, scope = "", subject] = match;
  const normalizedType = type.toLowerCase();

  if (!RELEASE_TYPES.has(normalizedType)) return null;

  return {
    hash,
    scope,
    subject: subject.trim(),
    type: normalizedType,
  };
}

function formatEntry(entry, commitUrl = "") {
  const scope = entry.scope ? `**${entry.scope}:** ` : "";
  const suffix = commitUrl ? ` ([${entry.hash}](${commitUrl}${entry.hash}))` : "";
  return `* ${scope}${entry.subject}${suffix}`;
}

function getCompareUrl(repositoryUrl, previousTag, currentTag) {
  if (!repositoryUrl || !previousTag || !currentTag) return "";
  return `${repositoryUrl}/compare/${previousTag}...${currentTag}`;
}

function getCommitUrl(repositoryUrl) {
  return repositoryUrl ? `${repositoryUrl}/commit/` : "";
}

function buildChangelog({
  compareUrl = "",
  commitUrl = "",
  currentTag = "",
  date = new Date().toISOString().slice(0, 10),
  logs = [],
  previousTag = "",
  version,
}) {
  const headingTarget =
    compareUrl || (previousTag && currentTag ? `${previousTag}...${currentTag}` : "");
  const heading = headingTarget
    ? `### [${version}](${headingTarget}) (${date})`
    : `### ${version} (${date})`;
  const entries = logs.map(parseConventionalCommit).filter(Boolean);
  const grouped = new Map();

  for (const entry of entries) {
    const section = RELEASE_TYPES.get(entry.type);
    grouped.set(section, [...(grouped.get(section) || []), entry]);
  }

  const parts = [heading];

  for (const section of RELEASE_TYPES.values()) {
    const sectionEntries = grouped.get(section) || [];
    if (!sectionEntries.length) continue;

    parts.push(
      "",
      `### ${section}`,
      "",
      sectionEntries.map((entry) => formatEntry(entry, commitUrl)).join("\n"),
    );
  }

  if (parts.length === 1) {
    parts.push("", "No notable release entries.");
  }

  return `${parts.join("\n").trim()}\n`;
}

function isVersionHeading(line = "") {
  return /^### (?:\[[0-9]+\.[0-9]+\.[0-9]+(?:-[^\]]+)?\]|[0-9]+\.[0-9]+\.[0-9]+(?:-\S+)?)/.test(
    line,
  );
}

function replaceVersionSection(existing, version, section) {
  const lines = String(existing || HEADER)
    .trimEnd()
    .split("\n");
  const sectionLines = section.trimEnd().split("\n");
  const matchesVersion = (line) =>
    line.startsWith(`### [${version}]`) || line.startsWith(`### ${version} `);
  const start = lines.findIndex(matchesVersion);

  if (start >= 0) {
    let end = lines.length;
    for (let index = start + 1; index < lines.length; index += 1) {
      if (isVersionHeading(lines[index])) {
        end = index;
        break;
      }
    }

    return `${[...lines.slice(0, start), ...sectionLines, "", ...lines.slice(end)].join("\n")}\n`;
  }

  const firstRelease = lines.findIndex(isVersionHeading);
  const insertAt = firstRelease >= 0 ? firstRelease : lines.length;
  return `${[...lines.slice(0, insertAt), ...sectionLines, "", ...lines.slice(insertAt)].join(
    "\n",
  )}\n`;
}

function withCurrentHeader(markdown = "") {
  const firstRelease = String(markdown).search(/^### /m);

  if (firstRelease < 0) {
    return `${HEADER.trim()}\n`;
  }

  return `${HEADER.trim()}\n\n${String(markdown).slice(firstRelease).trimStart()}`;
}

function parseVersion(version = "") {
  const match = String(version).match(/^v?(\d+)\.(\d+)\.(\d+)(?:-.+)?$/);
  return match ? match.slice(1, 4).map(Number) : [0, 0, 0];
}

function compareVersions(left, right) {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);

  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] !== rightParts[index]) return leftParts[index] - rightParts[index];
  }

  return String(left).localeCompare(String(right));
}

function getCommitLogs(previousTag = "", target = "HEAD") {
  const range = previousTag ? `${previousTag}..${target}` : target;
  return git(["log", "--format=%h %s", range], "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function getRefDate(ref = "HEAD") {
  return git(["log", "-1", "--format=%cs", ref], new Date().toISOString().slice(0, 10));
}

function getLastReachableTag() {
  return git(["describe", "--tags", "--abbrev=0", "HEAD"], "");
}

function getTagsPointingAtHead() {
  return git(["tag", "--points-at", "HEAD"], "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function getSemverTags() {
  return git(["tag", "--list", "v[0-9]*.[0-9]*.[0-9]*"], "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .sort(compareVersions);
}

async function readPackage() {
  return JSON.parse(await readFile(PACKAGE_JSON, "utf8"));
}

async function updateCurrentChangelog(options = {}) {
  const pkg = await readPackage();
  const repositoryUrl = getRepositoryUrl(pkg);
  const version = options.version || pkg.version;
  const currentTag = `v${version}`;
  const previousTag = options.previousTag ?? getLastReachableTag();
  const logs = options.logs || getCommitLogs(previousTag, "HEAD");
  const section = buildChangelog({
    compareUrl: getCompareUrl(repositoryUrl, previousTag, currentTag),
    commitUrl: getCommitUrl(repositoryUrl),
    currentTag,
    date: getRefDate("HEAD"),
    logs,
    previousTag,
    version,
  });
  const existing = withCurrentHeader(await readFile(CHANGELOG, "utf8").catch(() => HEADER));
  const next = replaceVersionSection(existing || HEADER, version, section);

  await writeFile(CHANGELOG, next, "utf8");
  return next;
}

async function regenerateChangelog(options = {}) {
  const pkg = await readPackage();
  const repositoryUrl = getRepositoryUrl(pkg);
  const currentTag = `v${pkg.version}`;
  const exactHeadTags = getTagsPointingAtHead();
  const headHasCurrentTag = exactHeadTags.includes(currentTag);
  const historyTags = getSemverTags().filter((tag) => headHasCurrentTag || tag !== currentTag);
  const sections = [];
  let previousTag = "";

  for (const tag of historyTags) {
    sections.push(
      buildChangelog({
        compareUrl: getCompareUrl(repositoryUrl, previousTag, tag),
        commitUrl: getCommitUrl(repositoryUrl),
        currentTag: tag,
        date: getRefDate(tag),
        logs: getCommitLogs(previousTag, tag),
        previousTag,
        version: tag.replace(/^v/, ""),
      }),
    );
    previousTag = tag;
  }

  if (!headHasCurrentTag) {
    const lastReachableTag = getLastReachableTag();
    sections.push(
      buildChangelog({
        compareUrl: getCompareUrl(repositoryUrl, lastReachableTag, currentTag),
        commitUrl: getCommitUrl(repositoryUrl),
        currentTag,
        date: getRefDate("HEAD"),
        logs: options.logs || getCommitLogs(lastReachableTag, "HEAD"),
        previousTag: lastReachableTag,
        version: pkg.version,
      }),
    );
  }

  const next = `${HEADER.trim()}\n\n${sections
    .reverse()
    .map((section) => section.trim())
    .join("\n\n")}\n`;
  await writeFile(CHANGELOG, next, "utf8");
  return next;
}

async function main(argv = process.argv.slice(2)) {
  if (argv.includes("--all")) {
    await regenerateChangelog();
    return;
  }

  await updateCurrentChangelog();
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  main().catch((error) => {
    console.error(error?.message || error);
    process.exit(1);
  });
}

export {
  buildChangelog,
  compareVersions,
  getCommitLogs,
  getCompareUrl,
  getLastReachableTag,
  getRepositoryUrl,
  parseConventionalCommit,
  regenerateChangelog,
  replaceVersionSection,
  updateCurrentChangelog,
  withCurrentHeader,
};
