import { buildGitHubCollections, getPortfolioRepos } from "./github/index.js";
import { getLinkedInImportSections } from "./_resume-document.js";
import { isEnglishTalk } from "./sessionize/_language.js";
import { findTalkRepoMapItem, rankTalkRepoCandidates } from "./sessionize/_link-talks.js";
import { canPrompt, promptLine } from "./_prompt.js";
import { normalizeWhitespace, toArray } from "./_text.js";

const PDF_IMPORT_SECTIONS = ["headline", "summary", "skills", "experience", "education"];

function sameList(left, right) {
  const leftValues = toArray(left).map((value) => String(value));
  const rightValues = toArray(right).map((value) => String(value));

  return (
    leftValues.length === rightValues.length &&
    leftValues.every((value, index) => value === rightValues[index])
  );
}

function ensureSourceConfig(frontmatter) {
  frontmatter.sourceConfig ??= {};
  frontmatter.sourceConfig.github ??= {};
  frontmatter.sourceConfig.linkedin ??= {};
  frontmatter.sourceConfig.sessionize ??= {};
  frontmatter.sourceConfig.sessionize.talkRepoMap ??= [];
  return frontmatter.sourceConfig;
}

function parseNamedSelection(answer, options) {
  const normalized = answer.trim().toLowerCase();

  if (normalized === "all") return [...options];
  if (["none", "empty", "0"].includes(normalized)) return [];

  const selected = new Set();
  const byName = new Map(options.map((value) => [value.toLowerCase(), value]));

  for (const part of normalized.split(/[\s,]+/).filter(Boolean)) {
    const rangeMatch = part.match(/^(\d+)-(\d+)$/);

    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      for (let index = Math.min(start, end); index <= Math.max(start, end); index += 1) {
        if (options[index - 1]) selected.add(options[index - 1]);
      }
      continue;
    }

    const numericIndex = Number(part);
    if (Number.isInteger(numericIndex) && options[numericIndex - 1]) {
      selected.add(options[numericIndex - 1]);
      continue;
    }

    if (byName.has(part)) {
      selected.add(byName.get(part));
    }
  }

  return Array.from(selected);
}

function parseRepoSelection(answer, repos) {
  const normalized = answer.trim().toLowerCase();

  if (normalized === "all") return repos.map((repo) => repo.name);
  if (["none", "empty", "0"].includes(normalized)) return [];

  const selected = new Set();
  const byName = new Map(repos.map((repo) => [repo.name.toLowerCase(), repo.name]));

  for (const part of normalized.split(/[\s,]+/).filter(Boolean)) {
    const rangeMatch = part.match(/^(\d+)-(\d+)$/);

    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      for (let index = Math.min(start, end); index <= Math.max(start, end); index += 1) {
        if (repos[index - 1]) selected.add(repos[index - 1].name);
      }
      continue;
    }

    const numericIndex = Number(part);
    if (Number.isInteger(numericIndex) && repos[numericIndex - 1]) {
      selected.add(repos[numericIndex - 1].name);
      continue;
    }

    if (byName.has(part)) {
      selected.add(byName.get(part));
    }
  }

  return Array.from(selected);
}

async function promptPortfolioRepos(frontmatter, github, options) {
  if (!options.selectRepos) return false;

  const sourceConfig = ensureSourceConfig(frontmatter);
  const repos = getPortfolioRepos(github.repos);

  if (!repos.length) return false;

  const currentNames = Array.isArray(sourceConfig.github.publishedRepos)
    ? sourceConfig.github.publishedRepos
    : repos.map((repo) => repo.name);
  const current = new Set(currentNames.map((name) => String(name).toLowerCase()));

  console.log("\nPortfolio repositories");
  repos.forEach((repo, index) => {
    const marker = current.has(repo.name.toLowerCase()) ? "[x]" : "[ ]";
    const stars = repo.stars === 1 ? "1 star" : `${repo.stars} stars`;
    console.log(`${marker} ${index + 1}. ${repo.name} (${stars})`);
  });
  console.log("Type numbers, ranges, repo names, all, none, or skip.");

  const answer = await promptLine("Repos to publish [keep current]: ", options.prompt);
  if (!answer || answer.toLowerCase() === "skip") return false;

  const selected = parseRepoSelection(answer, repos);

  if (selected.length !== repos.length && !selected.length && answer.toLowerCase() !== "none") {
    console.warn("Portfolio selection ignored: no matching repositories.");
    return false;
  }

  if (sameList(sourceConfig.github.publishedRepos, selected)) return false;

  sourceConfig.github.publishedRepos = selected;
  return true;
}

function resolveRepoInput(answer, candidates, repos) {
  const normalized = normalizeWhitespace(answer);
  const numericIndex = Number(normalized);

  if (Number.isInteger(numericIndex) && candidates[numericIndex - 1]) {
    return { repoName: candidates[numericIndex - 1].repo.name };
  }

  const repo = repos.find((candidate) => candidate.name.toLowerCase() === normalized.toLowerCase());
  if (repo) return { repoName: repo.name };

  if (/^https?:\/\//i.test(normalized)) return { repoUrl: normalized };
  if (/^github\.com\//i.test(normalized)) return { repoUrl: `https://${normalized}` };
  if (/^[\w.-]+\/[\w.-]+$/i.test(normalized)) {
    return { repoUrl: `https://github.com/${normalized}` };
  }

  return normalized ? { repoName: normalized } : null;
}

async function promptTalkRepoMap(frontmatter, github, sessionizeRaw, options) {
  if (!options.mapTalks) return false;

  const sourceConfig = ensureSourceConfig(frontmatter);
  const talks = toArray(sessionizeRaw.talks).filter(isEnglishTalk);
  const talkRepos = github.talkRepos?.length
    ? github.talkRepos
    : github.repos.filter((repo) => /^talk-/i.test(repo.name));

  if (!talks.length || !talkRepos.length) return false;

  let changed = false;

  for (const talk of talks) {
    if (findTalkRepoMapItem(talk, sourceConfig.sessionize.talkRepoMap)) continue;

    const candidates = rankTalkRepoCandidates(talk, talkRepos).slice(0, 5);
    const suggested = candidates[0]?.repo;
    const fallbackLabel = suggested ? suggested.name : "skip";

    console.log(`\nTalk: ${talk.title}`);
    if (talk.url) console.log(`Sessionize: ${talk.url}`);
    candidates.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.repo.name} (${entry.score}) ${entry.repo.url}`);
    });

    const answer = await promptLine(
      `Related GitHub URL or repo [${fallbackLabel}]: `,
      options.prompt,
    );
    const value = answer || suggested?.name || "";

    if (!value || value.toLowerCase() === "skip") continue;

    const repoTarget = resolveRepoInput(value, candidates, talkRepos);
    if (!repoTarget) continue;

    sourceConfig.sessionize.talkRepoMap.push({
      session: talk.title,
      ...(talk.id ? { sessionId: talk.id } : {}),
      ...(talk.url ? { sessionUrl: talk.url } : {}),
      ...repoTarget,
    });
    changed = true;
  }

  return changed;
}

async function promptLinkedInPdfSections(frontmatter, options) {
  if (!options.selectPdfSections) return false;

  const sourceConfig = ensureSourceConfig(frontmatter);
  const current = getLinkedInImportSections(frontmatter);
  const currentSet = new Set(current.map((value) => value.toLowerCase()));

  console.log("\nLinkedIn PDF sections");
  PDF_IMPORT_SECTIONS.forEach((section, index) => {
    const marker = currentSet.has(section.toLowerCase()) ? "[x]" : "[ ]";
    console.log(`${marker} ${index + 1}. ${section}`);
  });
  console.log("Type numbers, ranges, names, all, none, or skip.");

  const answer = await promptLine("PDF sections to import [keep current]: ", options.prompt);
  if (!answer || answer.toLowerCase() === "skip") return false;

  const selected = parseNamedSelection(answer, PDF_IMPORT_SECTIONS);

  if (!selected.length && answer.toLowerCase() !== "none") {
    console.warn("PDF section selection ignored: no matching section names.");
    return false;
  }

  if (sameList(current, selected)) return false;

  sourceConfig.linkedin.importSections = selected;
  return true;
}

export async function runBuildInteractions({ frontmatter, github, sessionizeRaw, options }) {
  if (!options?.enabled) return { frontmatter, github };

  const promptOptions = { force: options.forcePrompt };
  if (!canPrompt(promptOptions)) {
    console.warn("Interactive build skipped: no TTY available.");
    return { frontmatter, github };
  }

  const nextFrontmatter = structuredClone(frontmatter);
  const interactionOptions = { ...options, prompt: promptOptions };
  const changedPdfSections = await promptLinkedInPdfSections(nextFrontmatter, interactionOptions);
  const changedRepos = await promptPortfolioRepos(nextFrontmatter, github, interactionOptions);
  const changedTalks = await promptTalkRepoMap(
    nextFrontmatter,
    github,
    sessionizeRaw,
    interactionOptions,
  );

  if (!changedPdfSections && !changedRepos && !changedTalks) {
    return { frontmatter, github };
  }

  return {
    frontmatter: nextFrontmatter,
    github: changedRepos
      ? { ...github, ...buildGitHubCollections(github.repos, nextFrontmatter.sourceConfig.github) }
      : github,
  };
}
