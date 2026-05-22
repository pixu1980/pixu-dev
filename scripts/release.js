import { execFileSync, execSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE_JSON = join(ROOT, "package.json");
const RELEASE_STATUS_PATHS = ["dist", "static", "src/assets/images/logo.png"];

function run(cmd) {
  console.log(`$ ${cmd}`);
  return execSync(cmd, { cwd: ROOT, stdio: "inherit" });
}

function git(args, fallback = "") {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
  } catch {
    return fallback;
  }
}

function isGitStatusClean(status = "") {
  return status.trim() === "";
}

function getGitStatus(paths = []) {
  return git(["status", "--porcelain", "--", ...paths], "");
}

function isBuildClean(paths = RELEASE_STATUS_PATHS) {
  return isGitStatusClean(getGitStatus(paths));
}

function isBranchClean() {
  return isGitStatusClean(getGitStatus());
}

function hasConventionalReleaseCommit(log = "") {
  return String(log)
    .split("\n")
    .some((line) =>
      /^(?:[0-9a-f]+\s+)?(?:feat|fix|perf|refactor)(?:\([^)]+\))?!?:\s+/i.test(line.trim()),
    );
}

function getLastReachableTag() {
  return git(["describe", "--tags", "--abbrev=0", "HEAD"], "").trim();
}

function getReleaseCommitLog(lastTag = getLastReachableTag()) {
  const range = lastTag ? `${lastTag}..HEAD` : "HEAD";
  return git(["log", "--format=%h %s", range], "").trim();
}

function validateCommits(log = getReleaseCommitLog()) {
  if (!hasConventionalReleaseCommit(log)) {
    console.warn("No conventional release commits found since last reachable tag.");
    return false;
  }

  return true;
}

function getReleasePreparationCommands() {
  return ["pnpm verify", "pnpm build"];
}

export function getReleaseType(argv = process.argv.slice(2)) {
  const releaseType = argv[0] || "patch";
  const allowedReleaseTypes = new Set(["patch", "minor", "major", "prerelease"]);
  if (!allowedReleaseTypes.has(releaseType)) {
    throw new Error(`unsupported release type "${releaseType}"`);
  }

  return releaseType;
}

function parseVersion(version) {
  const match = String(version).match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-z]+)\.(\d+))?$/i);

  if (!match) {
    throw new Error(`unsupported version "${version}"`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prereleaseId: match[4] || "",
    prereleaseNumber: match[5] ? Number(match[5]) : -1,
  };
}

function getNextVersion(version, releaseType) {
  const parsed = parseVersion(version);

  if (releaseType === "major") {
    return `${parsed.major + 1}.0.0`;
  }

  if (releaseType === "minor") {
    return `${parsed.major}.${parsed.minor + 1}.0`;
  }

  if (releaseType === "prerelease") {
    if (parsed.prereleaseId) {
      return `${parsed.major}.${parsed.minor}.${parsed.patch}-${parsed.prereleaseId}.${
        parsed.prereleaseNumber + 1
      }`;
    }

    return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}-rc.0`;
  }

  return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
}

async function readPackage() {
  return JSON.parse(await readFile(PACKAGE_JSON, "utf8"));
}

async function writePackageVersion(version) {
  const pkg = await readPackage();
  pkg.version = version;
  await writeFile(PACKAGE_JSON, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
}

async function release() {
  console.log("Release Pipeline Start\n");
  const releaseType = getReleaseType();

  if (!isBranchClean()) {
    console.error("Error: Uncommitted changes exist. Commit or stash first.");
    process.exit(1);
  }

  const currentPackage = await readPackage();
  const nextVersion = getNextVersion(currentPackage.version, releaseType);
  const nextTag = `v${nextVersion}`;

  console.log("1. Verify + Generate Content");
  for (const command of getReleasePreparationCommands()) {
    run(command);
  }

  if (!isBuildClean()) {
    console.log("\n2. Commit Build Artifacts");
    run("git add dist static src/assets/images/logo.png");
    run('git commit -m "build(release): generate dist + assets"');
  } else {
    console.log("Build artifacts clean, skip commit.");
  }

  console.log("\n3. Generate Changelog + Bump Version");
  validateCommits();
  await writePackageVersion(nextVersion);
  run("node scripts/changelog.js");
  run("git add package.json CHANGELOG.md");
  run(`git commit -m "chore(release): ${nextTag}"`);
  run(`git tag ${nextTag}`);

  console.log("\n4. Push Release");
  run("git push --no-verify");
  run("git push --no-verify --tags");

  console.log("\nRelease complete. Dist pushed, Actions will deploy.");
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  release().catch((err) => {
    console.error("Release failed:", err.message);
    process.exit(1);
  });
}

export {
  getLastReachableTag,
  getNextVersion,
  getReleaseCommitLog,
  hasConventionalReleaseCommit,
  isBranchClean,
  isBuildClean,
  isGitStatusClean,
  getReleasePreparationCommands,
  release,
  run,
  validateCommits,
};
