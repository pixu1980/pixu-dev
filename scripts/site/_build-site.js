import matter from "gray-matter";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import TemplateEngine from "../template-engine/index.js";

import {
  buildEffectiveProfile,
  buildLinkedInFallback,
  buildPublicData,
  buildTemplateContext,
} from "./context/index.js";

import { loadLinkedInData } from "./linkedin/index.js";

import { getGitHubUsername, loadGitHubData } from "./github/index.js";

import { isEnglishTalk, linkTalksToRepos, loadSessionizeData } from "./sessionize/index.js";

import {
  mergeSectionsForRender,
  buildSections,
  buildMarkdownDerivedFallbacks,
} from "./markdown/index.js";

import { copyAssets, localizeProfileImage, ensureDir } from "./output/index.js";

import { CONTENT, DIST, SRC } from "./_constants.js";
import { getPreferredProfileImage } from "./_profile-image.js";

export async function buildSite(options = {}) {
  const startedAt = performance.now();
  const outputRoot = options.outDir || DIST;
  const publicRoot = options.publicDir || outputRoot;
  const markdown = await readFile(join(CONTENT, "resume.md"), "utf8");
  const { data: frontmatter, content } = matter(markdown);
  const parsedSections = buildSections(content);
  const derivedFallbacks = buildMarkdownDerivedFallbacks(parsedSections);
  const sections = mergeSectionsForRender(parsedSections);
  const githubUsername = getGitHubUsername(frontmatter.sourceConfig?.github);
  const linkedinFallback = buildLinkedInFallback(frontmatter, githubUsername, derivedFallbacks);

  const [github, sessionizeRaw, linkedin] = await Promise.all([
    loadGitHubData(frontmatter.sourceConfig?.github, frontmatter.fallbacks?.github),
    loadSessionizeData(frontmatter.sourceConfig?.sessionize, frontmatter.fallbacks?.sessionize),
    loadLinkedInData(frontmatter.sourceConfig?.linkedin, linkedinFallback),
  ]);

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
  const publicData = buildPublicData(frontmatter, data, profileImage, profile);
  const context = buildTemplateContext({ frontmatter, data, profileImage, sections, profile });
  const engine = new TemplateEngine({ rootDir: SRC });
  const html = engine.render("index.html", context);

  await ensureDir(join(publicRoot, "data"));

  await writeFile(
    join(publicRoot, "data", "resume.json"),
    JSON.stringify(publicData, null, 2),
    "utf8",
  );

  await writeFile(join(outputRoot, "index.html"), html, "utf8");

  console.log(
    `Built ${outputRoot}/index.html in ${(performance.now() - startedAt).toFixed(0)}ms, github:${data.github.status}, sessionize:${data.sessionize.status}, linkedin:${data.linkedin.status}`,
  );
}

export { DIST };
