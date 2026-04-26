import { load } from "cheerio";
import { MONTH_YEAR_RE } from "../_constants.js";
import {
  englishText,
  isLikelyEnglish,
  normalizeWhitespace,
  toArray,
  truncateText,
  uniqueBy,
} from "../_text.js";
import { buildLanguagesFromText, getLanguageScore, getSessionLanguageInfo } from "./_language.js";

export function parseSessionizeSpeaker(html, fallback) {
  const $ = load(html);
  const name = normalizeWhitespace($("h1").first().text());
  const headline = englishText(
    $("h1").first().nextAll("p").first().text(),
    fallback?.speakerHeadline || "",
  );
  const image =
    $("img[alt]")
      .toArray()
      .map((node) => ({
        alt: normalizeWhitespace($(node).attr("alt")),
        src: $(node).attr("src") || $(node).attr("data-src") || "",
      }))
      .find(
        (candidate) => candidate.src && candidate.alt.toLowerCase().includes(name.toLowerCase()),
      )?.src || "";
  const summaryParagraphs = $("p")
    .map((_, node) => normalizeWhitespace($(node).text()))
    .get()
    .filter(
      (text) =>
        text.length > 80 &&
        !MONTH_YEAR_RE.test(text) &&
        !/^Technical requirements:/i.test(text) &&
        !/^Preferred session duration:/i.test(text),
    );
  const topics = [];
  $("h3").each((_, heading) => {
    const title = normalizeWhitespace($(heading).text());
    if (!/^Topics$/i.test(title) && !/^Area of Expertise$/i.test(title)) return;
    let cursor = $(heading).next();
    while (cursor.length && cursor.get(0)?.tagName?.toLowerCase() !== "h3") {
      cursor
        .find("li")
        .each((__, item) => topics.push(englishText($(item).text(), "", { allowShort: true })));
      cursor = cursor.next();
    }
  });
  return {
    name,
    headline,
    image,
    summary: truncateText(
      englishText(summaryParagraphs.slice(0, 3).join(" "), fallback?.summary || ""),
      540,
    ),
    topics: uniqueBy(
      [...topics, ...toArray(fallback?.topics)]
        .map((topic) => englishText(topic, "", { allowShort: true }))
        .filter(Boolean),
      (topic) => topic.toLowerCase(),
    ),
  };
}

export function parseSessionizeTalks(html, profileUrl, preferredLanguage) {
  const $ = load(html);
  const talks = new Map();
  $("h3 > a[href*='/s/']").each((_, anchor) => {
    const link = $(anchor);
    const href = link.attr("href") || "";
    const title = englishText(link.text(), "", { allowShort: true });
    if (!href || !title) return;
    const url = new URL(href, profileUrl).href;
    const { id, languageCode } = getSessionLanguageInfo(url);
    let languages = buildLanguagesFromText(
      normalizeWhitespace(link.closest("h3").text()).replace(title, ""),
    );
    const paragraphs = [];
    let cursor = link.closest("h3").next();
    while (cursor.length) {
      const tag = cursor.get(0)?.tagName?.toLowerCase();
      if (tag === "h3") break;
      if (tag === "p") paragraphs.push(normalizeWhitespace(cursor.text()));
      cursor = cursor.next();
      if (paragraphs.length >= 8) break;
    }
    const duration = paragraphs.find((text) => /^Preferred session duration/i.test(text));
    const technical = paragraphs.find((text) => /^Technical requirements/i.test(text));
    const abstract = englishText(
      paragraphs.filter((text) => text !== duration && text !== technical).join(" "),
      "",
    );
    if (!isLikelyEnglish(abstract)) return;
    if (!languages.includes("EN")) languages = ["EN"];
    const key = title.toLowerCase();
    const entry = {
      id,
      title,
      url,
      abstract,
      duration: englishText(
        String(duration || "").replace(/^Preferred session duration:?\s*/i, ""),
        "",
        { allowShort: true },
      ),
      technicalLevel: englishText(
        String(technical || "").replace(/^Technical requirements:?\s*/i, ""),
        "",
        { allowShort: true },
      ),
      languages,
      languageScore: getLanguageScore(languageCode, preferredLanguage),
      relatedRepos: [],
    };
    const current = talks.get(key);
    if (
      !current ||
      entry.languageScore > current.languageScore ||
      entry.abstract.length > current.abstract.length
    )
      talks.set(key, entry);
  });
  return Array.from(talks.values()).sort((left, right) => left.title.localeCompare(right.title));
}

export function parseSessionizeEvents(html, profileUrl) {
  const $ = load(html);
  const events = new Map();
  $("h3 > a").each((_, anchor) => {
    const link = $(anchor);
    const href = link.attr("href") || "";
    if (!href || href.includes("/s/")) return;
    const details = [];
    let cursor = link.closest("h3").next();
    while (cursor.length) {
      const tag = cursor.get(0)?.tagName?.toLowerCase();
      if (tag === "h3") break;
      details.push(normalizeWhitespace(cursor.text()));
      cursor = cursor.next();
      if (details.length >= 5) break;
    }
    const joined = details.join(" ");
    const name = normalizeWhitespace(link.text());
    const when = joined.match(MONTH_YEAR_RE)?.[0] || "";
    const where = joined.match(/[A-Z][A-Za-z.' -]+,\s*[A-Z][A-Za-z.' -]+/)?.[0] || "";
    const note = details.filter((text) => text && text !== when && text !== where).join(" / ");
    if (name && (when || where || note))
      events.set(name.toLowerCase(), {
        name,
        url: new URL(href, profileUrl).href,
        when,
        where,
        note,
      });
  });
  return Array.from(events.values());
}
