import { tokenize } from "../github/_shared.js";
import { isTalkRepo } from "../github/_stats.js";
import { normalizeWhitespace, slugify, toArray } from "../_text.js";

function normalizeTalkRepoMap(talkRepoMap) {
  return toArray(talkRepoMap)
    .map((item) => ({
      session: normalizeWhitespace(item?.session || item?.talk || item?.title),
      sessionId: normalizeWhitespace(item?.sessionId || item?.id),
      sessionUrl: normalizeWhitespace(item?.sessionUrl || item?.url),
      repoName: normalizeWhitespace(item?.repoName || item?.repo),
      repoUrl: normalizeWhitespace(item?.repoUrl || item?.github || item?.repository),
      label: normalizeWhitespace(item?.label || ""),
    }))
    .filter((item) => item.repoName || item.repoUrl);
}

function getManualRelatedRepos(talk, repos, talkRepoMap) {
  const normalizedTitle = normalizeWhitespace(talk.title).toLowerCase();
  const normalizedId = normalizeWhitespace(talk.id).toLowerCase();
  const normalizedUrl = normalizeWhitespace(talk.url).toLowerCase();
  const mapItem = normalizeTalkRepoMap(talkRepoMap).find((item) => {
    const session = item.session.toLowerCase();
    const sessionId = item.sessionId.toLowerCase();
    const sessionUrl = item.sessionUrl.toLowerCase();
    return (
      (session && (session === normalizedTitle || slugify(session) === normalizedId)) ||
      (sessionId && (sessionId === normalizedId || slugify(sessionId) === normalizedId)) ||
      (sessionUrl && normalizedUrl?.includes(sessionUrl))
    );
  });
  if (!mapItem) return null;

  const repo = repos.find(
    (candidate) =>
      (mapItem.repoName && candidate.name.toLowerCase() === mapItem.repoName.toLowerCase()) ||
      (mapItem.repoUrl && candidate.url.toLowerCase() === mapItem.repoUrl.toLowerCase()),
  );
  if (repo) {
    return [
      {
        name: repo.name,
        url: repo.url,
        language: repo.language,
        isExternal: true,
        label: mapItem.label || "GitHub",
      },
    ];
  }

  if (mapItem.repoUrl) {
    const fallbackName =
      mapItem.repoName ||
      mapItem.repoUrl.replace(/\/$/, "").split("/").filter(Boolean).at(-1) ||
      "repo";
    return [
      {
        name: fallbackName,
        url: mapItem.repoUrl,
        language: "Mixed",
        isExternal: true,
        label: mapItem.label || "GitHub",
      },
    ];
  }

  return null;
}

export function linkTalksToRepos(talks, repos, talkRepoMap = []) {
  const indexedRepos = repos.map((repo) => ({
    repo,
    tokens: new Set(tokenize([repo.name, repo.description, repo.language, ...repo.tags].join(" "))),
  }));

  return talks.map((talk) => {
    const manualRelatedRepos = getManualRelatedRepos(talk, repos, talkRepoMap);
    if (manualRelatedRepos?.length) {
      return { ...talk, relatedRepos: manualRelatedRepos };
    }

    const talkTokens = new Set(
      tokenize([talk.title, talk.abstract, talk.technicalLevel].join(" ")),
    );
    const talkSlug = slugify(talk.title);
    const relatedRepos = indexedRepos
      .map(({ repo, tokens }) => {
        let score = 0;
        const repoSlug = slugify(repo.name.replace(/^talk-/i, ""));
        if (repoSlug === talkSlug) score += 80;
        if (repoSlug && talkSlug.includes(repoSlug)) score += 48;
        if (talkSlug && repoSlug.includes(talkSlug)) score += 48;
        talkTokens.forEach((token) => {
          if (tokens.has(token)) score += token === repo.name.toLowerCase() ? 6 : 2;
          if (repo.name.toLowerCase().includes(token)) score += 3;
        });
        if (isTalkRepo(repo)) score += 8;
        if (/css/i.test(talk.title) && /scss|css/i.test(repo.name + repo.description)) score += 4;
        if (
          /reactive|signals|custom|vanilla/i.test(talk.title) &&
          /js|javascript|web/i.test(repo.language)
        )
          score += 3;
        if (
          /access|wcag|a11y/i.test(talk.title + talk.abstract) &&
          /wcag|a11y|access/i.test(repo.name + repo.description + repo.tags.join(" "))
        )
          score += 5;
        return { repo, score };
      })
      .filter((entry) => entry.score > 2)
      .sort(
        (left, right) =>
          Number(isTalkRepo(right.repo)) - Number(isTalkRepo(left.repo)) ||
          right.score - left.score ||
          right.repo.stars - left.repo.stars,
      )
      .slice(0, 3)
      .map((entry) => ({
        name: entry.repo.name,
        url: entry.repo.url,
        language: entry.repo.language,
        isExternal: true,
      }));

    return { ...talk, relatedRepos };
  });
}
