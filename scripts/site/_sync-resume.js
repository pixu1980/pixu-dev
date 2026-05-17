import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { buildLinkedInFallback } from "./context/index.js";
import { closePrompt } from "./_prompt.js";
import { parseResumeDocument, stringifyResumeDocument } from "./_resume-document.js";
import { runBuildInteractions } from "./_build-interactions.js";
import { getGitHubUsername, loadGitHubData } from "./github/index.js";
import { loadLinkedInData, applyLinkedInSync } from "./linkedin/index.js";
import { buildMarkdownDerivedFallbacks } from "./markdown/index.js";
import { loadSessionizeData } from "./sessionize/index.js";
import { normalizeWhitespace, toArray } from "./_text.js";
import { CONTENT } from "./_constants.js";

function previewList(values, limit, mapItem) {
  return toArray(values)
    .slice(0, limit)
    .map((value) => mapItem(value))
    .filter(Boolean);
}

function printSourcePreview(title, payload) {
  console.log(`\n${title}`);
  console.log(JSON.stringify(payload, null, 2));
}

function buildGitHubPreview(github) {
  return {
    status: github.status,
    profile: github.profile.username,
    repos: github.repos.length,
    portfolioRepos: previewList(github.portfolioRepos || github.repos, 8, (repo) => repo.name),
    talkRepos: previewList(github.talkRepos, 8, (repo) => repo.name),
    stats: github.stats,
  };
}

function buildSessionizePreview(sessionize) {
  return {
    status: sessionize.status,
    profileUrl: sessionize.profileUrl,
    speaker: {
      headline: sessionize.speaker.headline,
      topics: sessionize.speaker.topics,
    },
    talks: previewList(sessionize.talks, 8, (talk) => talk.title),
    events: previewList(sessionize.events, 8, (event) => {
      return [event.name, event.when, event.where].filter(Boolean).join(" / ");
    }),
  };
}

function buildLinkedInPreview(linkedin, importSections) {
  return {
    status: linkedin.status,
    profileUrl: linkedin.profileUrl,
    importedSections: importSections,
    headline: linkedin.headline,
    skills: linkedin.skills,
    experience: previewList(linkedin.experience, 8, (entry) => {
      return [entry.title, entry.organization, entry.dateRange].filter(Boolean).join(" / ");
    }),
    education: previewList(linkedin.education, 8, (entry) => {
      return [entry.title, entry.subtitle, entry.dateRange].filter(Boolean).join(" / ");
    }),
  };
}

export async function syncResumeSources(options = {}) {
  const resumePath = options.sourcePath || join(CONTENT, "resume.md");
  const markdown = await readFile(resumePath, "utf8");
  const { frontmatter, content, sections } = parseResumeDocument(markdown);
  const githubUsername = getGitHubUsername(frontmatter.sourceConfig?.github);

  const github = await loadGitHubData(
    frontmatter.sourceConfig?.github,
    frontmatter.generated?.github,
  );
  const sessionizeRaw = await loadSessionizeData(
    frontmatter.sourceConfig?.sessionize,
    frontmatter.generated?.sessionize,
  );

  let nextFrontmatter = frontmatter;
  let nextGithub = github;

  try {
    const interactionResult = await runBuildInteractions({
      frontmatter,
      content,
      github,
      sessionizeRaw,
      path: resumePath,
      options: options.interactions || {},
    });

    nextFrontmatter = interactionResult.frontmatter;
    nextGithub = interactionResult.github;
  } finally {
    if (options.interactions?.enabled) {
      closePrompt();
    }
  }

  const derivedFallbacks = buildMarkdownDerivedFallbacks(sections);
  const linkedinFallback = buildLinkedInFallback(nextFrontmatter, githubUsername, derivedFallbacks);
  const linkedin = await loadLinkedInData(nextFrontmatter.sourceConfig?.linkedin, linkedinFallback);
  const linkedinSync = applyLinkedInSync({
    frontmatter: nextFrontmatter,
    content,
    parsed: linkedin,
  });

  const syncedFrontmatter = {
    ...linkedinSync.frontmatter,
    generated: {
      ...linkedinSync.frontmatter.generated,
      github: nextGithub,
      sessionize: sessionizeRaw,
      linkedin: linkedinSync.frontmatter.generated?.linkedin,
    },
  };

  await writeFile(
    resumePath,
    stringifyResumeDocument(syncedFrontmatter, linkedinSync.content),
    "utf8",
  );

  const importSections = nextFrontmatter.sourceConfig?.linkedin?.importSections || [];
  printSourcePreview("GitHub preview", buildGitHubPreview(nextGithub));
  printSourcePreview("Sessionize preview", buildSessionizePreview(sessionizeRaw));
  printSourcePreview(
    "LinkedIn PDF preview",
    buildLinkedInPreview(syncedFrontmatter.generated.linkedin, importSections),
  );

  console.log(`\nUpdated ${normalizeWhitespace(resumePath)} from live sources.`);

  return {
    frontmatter: syncedFrontmatter,
    content: linkedinSync.content,
    github: nextGithub,
    sessionize: sessionizeRaw,
    linkedin: syncedFrontmatter.generated.linkedin,
  };
}
