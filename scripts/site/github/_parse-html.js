import { load } from "cheerio";
import { englishText, normalizeWhitespace, uniqueBy } from "../_text.js";

export function parseGitHubNumber(value = "") {
  const normalized = normalizeWhitespace(value).toLowerCase().replaceAll(",", "");
  const match = normalized.match(/([\d.]+)\s*([km]?)/);

  if (!match) {
    return 0;
  }

  const base = Number.parseFloat(match[1]);
  const multiplier = match[2] === "m" ? 1_000_000 : match[2] === "k" ? 1_000 : 1;

  return Number.isFinite(base) ? Math.round(base * multiplier) : 0;
}

export function parseGitHubReposFromHtml(html, username) {
  const $ = load(html);

  const candidates = $("#user-repositories-list li, [data-testid='results-list'] li")
    .toArray()
    .map((item) => {
      const row = $(item);
      const link = row.find("h3 a[href], [itemprop='name codeRepository']").first();
      const href = link.attr("href") || "";
      const name = normalizeWhitespace(link.text()).replace(/^Public\s*/i, "");

      if (!name || !href) {
        return null;
      }

      const topics = row
        .find("a.topic-tag, [data-ga-click*='topic']")
        .map((_, node) => englishText($(node).text(), "", { allowShort: true }))
        .get()
        .filter(Boolean);

      return {
        name,
        description: englishText(row.find("p[itemprop='description'], p").first().text(), ""),
        html_url: new URL(href, `https://github.com/${username}`).href,
        homepage: "",
        language:
          normalizeWhitespace(row.find("[itemprop='programmingLanguage']").text()) || "Mixed",
        stargazers_count: parseGitHubNumber(row.find("a[href$='/stargazers']").first().text()),
        watchers_count: parseGitHubNumber(row.find("a[href$='/stargazers']").first().text()),
        forks_count: parseGitHubNumber(row.find("a[href$='/forks']").first().text()),
        open_issues_count: 0,
        archived: /archived/i.test(row.text()),
        fork: /forked from/i.test(row.text()),
        private: false,
        topics,
        updated_at: normalizeWhitespace(row.text()).match(/Updated\s+[^,\n]+/i)?.[0] || "",
        created_at: "",
      };
    })
    .filter(Boolean);

  return uniqueBy(candidates, (repo) => repo.name.toLowerCase());
}
