import { execSync } from "node:child_process";

function run(cmd) {
  console.log(`$ ${cmd}`);
  return execSync(cmd, { stdio: "inherit" });
}

function isBuildClean() {
  try {
    const status = execSync("git diff --name-only").toString();
    return status.trim() === "";
  } catch {
    return false;
  }
}

function isBranchClean() {
  try {
    const status = execSync("git status --porcelain").toString();
    return status.trim() === "";
  } catch {
    return false;
  }
}

function validateCommits() {
  try {
    const lastTag = execSync("git describe --tags --abbrev=0 2>/dev/null || echo ''")
      .toString()
      .trim();
    const commitLog = execSync(
      `git log ${lastTag ? `${lastTag}..HEAD` : ""} --oneline --grep="^feat|^fix|^perf|^refactor" 2>/dev/null || true`,
    )
      .toString()
      .trim();

    if (!commitLog) {
      console.warn("No conventional commits found since last tag. Are you sure?");
      return true;
    }
    return true;
  } catch {
    return true;
  }
}

async function release() {
  console.log("Release Pipeline Start\n");

  if (!isBranchClean()) {
    console.error("Error: Uncommitted changes exist. Commit or stash first.");
    process.exit(1);
  }

  console.log("1. Build + Generate Content");
  run("pnpm build");

  if (!isBuildClean()) {
    console.log("\n2. Commit Build Artifacts");
    run("git add dist generated");
    run('git commit -m "build(release): generate dist + assets"');
  } else {
    console.log("Build artifacts clean, skip commit.");
  }

  console.log("\n3. Generate Changelog + Bump Version");
  validateCommits();
  run("pnpm exec standard-version --releaseCommitMessageFormat='chore(release): v{{currentTag}}'");

  console.log("\n4. Push Release");
  run("git push && git push --tags");

  console.log("\n✓ Release complete. Dist pushed, Actions will deploy.");
}

release().catch((err) => {
  console.error("Release failed:", err.message);
  process.exit(1);
});
