import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import TemplateEngine from "../template-engine/index.js";

import {
  buildEffectiveProfile,
  buildLinkedInFallback,
  buildTemplateContext,
} from "./context/index.js";

import { loadStoredLinkedInData } from "./linkedin/index.js";

import { getGitHubUsername, loadStoredGitHubData } from "./github/index.js";

import { isEnglishTalk, linkTalksToRepos, loadStoredSessionizeData } from "./sessionize/index.js";

import { mergeSectionsForRender, buildMarkdownDerivedFallbacks } from "./markdown/index.js";

import { copyAssets, localizeProfileImage, ensureDir } from "./output/index.js";

import { CONTENT, DIST, SRC } from "./_constants.js";
import { getPreferredProfileImage } from "./_profile-image.js";
import { getGeneratedSources, parseResumeDocument } from "./_resume-document.js";

export async function buildSite(options = {}) {
  const startedAt = performance.now();
  const outputRoot = options.outDir || DIST;
  const publicRoot = options.publicDir || outputRoot;
  const resumePath = options.sourcePath || join(CONTENT, "resume.md");
  const markdown = await readFile(resumePath, "utf8");
  const { frontmatter, sections: parsedSections } = parseResumeDocument(markdown);
  const derivedFallbacks = buildMarkdownDerivedFallbacks(parsedSections);
  const sections = mergeSectionsForRender(parsedSections);
  const githubUsername = getGitHubUsername(frontmatter.sourceConfig?.github);
  const linkedinFallback = buildLinkedInFallback(frontmatter, githubUsername, derivedFallbacks);
  const generatedSources = getGeneratedSources(frontmatter);
  const github = loadStoredGitHubData(frontmatter.sourceConfig?.github, generatedSources.github);
  const sessionizeRaw = loadStoredSessionizeData(
    frontmatter.sourceConfig?.sessionize,
    generatedSources.sessionize,
  );
  const linkedin = loadStoredLinkedInData(
    frontmatter.sourceConfig?.linkedin,
    generatedSources.linkedin,
    linkedinFallback,
  );

  const sessionize = {
    ...sessionizeRaw,
    talks: linkTalksToRepos(
      sessionizeRaw.talks.filter(isEnglishTalk),
      github.talkRepos?.length ? github.talkRepos : github.repos,
      frontmatter.sourceConfig?.sessionize?.talkRepoMap,
    ),
  };

  const data = { github, sessionize, linkedin };
  const profile = buildEffectiveProfile(frontmatter, data);

  await copyAssets(outputRoot, publicRoot);
  await ensureDir(publicRoot);

  const profileImage = await localizeProfileImage(getPreferredProfileImage(data), publicRoot);
  const context = buildTemplateContext({
    frontmatter,
    data,
    profileImage,
    sections,
    profile,
  });
  const engine = new TemplateEngine({ rootDir: SRC });
  const html = engine.render("index.html", context);

  await writeFile(join(outputRoot, "index.html"), html, "utf8");

  console.log(
    `Built ${outputRoot}/index.html in ${(performance.now() - startedAt).toFixed(0)}ms, github:${data.github.status}, sessionize:${data.sessionize.status}, linkedin:${data.linkedin.status}`,
  );
}

export { DIST };
