import { load } from "cheerio";
import { englishText, escapeRegExp, normalizeWhitespace, toArray, uniqueBy } from "../_text.js";
import { splitTextLines } from "../_text.js";
import { looksLikeDateRange } from "../markdown/_sections.js";

function parseJsonLdBlocks(html) {
  const blocks = [];

  for (const match of html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      blocks.push(JSON.parse(match[1].trim()));
    } catch {}
  }

  return blocks;
}

function collectJsonLdNodes(value, bucket = []) {
  if (!value || typeof value !== "object") {
    return bucket;
  }

  if (Array.isArray(value)) {
    return value.reduce((items, child) => collectJsonLdNodes(child, items), bucket);
  }

  bucket.push(value);

  Object.values(value).forEach((child) => {
    collectJsonLdNodes(child, bucket);
  });

  return bucket;
}

function isLinkedInUiNoise(value = "") {
  return /^(see all|show all|activity|skills|interests|followers|connections|licenses|certifications|volunteering)$/i.test(
    normalizeWhitespace(value),
  );
}

function getMeta($, selector) {
  return normalizeWhitespace($(selector).first().attr("content") || "");
}

function findLinkedInSection($, patterns) {
  const sections = $("section").toArray();

  const withHeading = sections.find((section) => {
    return patterns.some((pattern) => {
      return pattern.test(
        normalizeWhitespace(
          $(section)
            .find("h1, h2, h3, h4, header, [aria-level], [data-view-name], [id], [aria-label]")
            .first()
            .text(),
        ),
      );
    });
  });

  if (withHeading) return withHeading;

  return (
    sections.find((section) => {
      const attrs = [
        $(section).attr("id"),
        $(section).attr("class"),
        $(section).attr("aria-label"),
        $(section).attr("data-view-name"),
      ]
        .filter(Boolean)
        .join(" ");

      return patterns.some((pattern) => pattern.test(normalizeWhitespace(attrs)));
    }) || null
  );
}

function parseLinkedInSectionEntries($, section, kind) {
  if (!section) {
    return [];
  }

  return uniqueBy(
    $(section)
      .find("li")
      .toArray()
      .map((item) => {
        const lines = uniqueBy(
          splitTextLines($(item).text()).filter((line) => !isLinkedInUiNoise(line)),
          (line) => line.toLowerCase(),
        );

        if (!lines.length) {
          return null;
        }

        const dateRange = lines.find(looksLikeDateRange) || "";
        const title = englishText(lines[0], "", { allowShort: true });

        const subtitle = englishText(
          lines.find((line, index) => index > 0 && line !== dateRange) || "",
          "",
          { allowShort: true },
        );

        const summary = lines
          .filter((line) => line.length > 110)
          .map((line) => englishText(line))
          .filter(Boolean)
          .join(" ");

        const skills =
          lines
            .find((line) => /^Skills:/i.test(line))
            ?.replace(/^Skills:\s*/i, "")
            .split(/\s*,\s*/)
            .map((skill) => englishText(skill, "", { allowShort: true }))
            .filter(Boolean) || [];

        if (!title || isLinkedInUiNoise(title)) {
          return null;
        }

        return kind === "experience"
          ? {
              title,
              organization: subtitle,
              dateRange,
              location: lines.find((line) => /^[A-Z].*,\s*[A-Z]/.test(line)) || "",
              summary,
              highlights: [],
              skills,
            }
          : { title, subtitle, dateRange, summary, highlights: [] };
      })
      .filter(Boolean),
    (entry) =>
      `${entry.title.toLowerCase()}::${(entry.organization || entry.subtitle || "").toLowerCase()}::${(entry.dateRange || "").toLowerCase()}`,
  );
}

function parseLinkedInSkills($, nodes, fallback) {
  const section = findLinkedInSection($, [/^skills$/i]);

  const sectionSkills = section
    ? $(section)
        .find("li, span[aria-hidden='true']")
        .map((_, node) => normalizeWhitespace($(node).text()))
        .get()
        .filter((text) => text.length > 1 && text.length < 64 && !isLinkedInUiNoise(text))
    : [];

  const jsonSkills = nodes.flatMap((node) => toArray(node?.knowsAbout || node?.skills));

  return uniqueBy(
    [...sectionSkills, ...jsonSkills, ...toArray(fallback?.skills), ...toArray(fallback?.focus)]
      .map((skill) => englishText(skill?.name || skill, "", { allowShort: true }))
      .filter(Boolean),
    (skill) => skill.toLowerCase(),
  ).slice(0, 28);
}

function cleanLinkedInHeadline(value = "", name = "") {
  const normalized = normalizeWhitespace(value)
    .replace(new RegExp(escapeRegExp(normalizeWhitespace(name)), "i"), "")
    .replace(/\s*\|\s*LinkedIn.*$/i, "")
    .replace(/\s*[-,|]\s*LinkedIn.*$/i, "")
    .replaceAll("\u2026", "...")
    .replace(/^[\s,|-]+|[\s,|-]+$/g, "");

  return !normalized ||
    /^LinkedIn$/i.test(normalized) ||
    normalized.toLowerCase() === normalizeWhitespace(name).toLowerCase()
    ? ""
    : englishText(normalized, "");
}

function cleanLinkedInSummary(value = "", fallback = "") {
  const normalized = normalizeWhitespace(value).replaceAll("\u2026", "...");

  return /profile on LinkedIn|connections on LinkedIn|\bExperience:\s|\bEducation:\s/i.test(
    normalized,
  )
    ? fallback
    : englishText(normalized, fallback);
}

function getLinkedInIntro(value = "", fallback = "") {
  const normalized = normalizeWhitespace(value)
    .replace(/\s*·\s*Experience:.*$/i, "")
    .replaceAll("\u2026", "...")
    .replace(/\s+/g, " ");

  return normalized && /^Hi\b/i.test(normalized) ? englishText(normalized, fallback) : fallback;
}

export function parseLinkedInProfile(html, fallback) {
  const $ = load(html);
  const nodes = parseJsonLdBlocks(html).flatMap((block) => collectJsonLdNodes(block));

  const people = nodes.filter((node) =>
    /Person|ProfilePage/i.test(toArray(node?.["@type"]).join(" ")),
  );

  const profile = people[0]?.mainEntity || people[0] || {};
  const titleText = getMeta($, 'meta[property="og:title"], meta[name="title"]');
  const descriptionText = getMeta($, 'meta[property="og:description"], meta[name="description"]');

  const name =
    normalizeWhitespace(
      profile.name || $("h1").first().text() || titleText.replace(/\s*[|,-]\s*LinkedIn.*$/i, ""),
    ) ||
    fallback?.name ||
    "";

  const headline =
    getLinkedInIntro(descriptionText) ||
    cleanLinkedInHeadline(profile.headline || profile.jobTitle, name) ||
    cleanLinkedInHeadline(titleText, name) ||
    fallback?.headline ||
    "";

  const profileImage =
    normalizeWhitespace(
      profile.image?.url ||
        profile.image ||
        getMeta($, 'meta[property="og:image"], meta[name="image"]') ||
        "",
    ) ||
    fallback?.profileImage ||
    "";

  return {
    name: englishText(name, fallback?.name || "", { allowShort: true }),
    headline,
    summary: cleanLinkedInSummary(profile.description || descriptionText, fallback?.summary || ""),
    profileImage,
    connections:
      normalizeWhitespace(descriptionText)
        .match(/(\d{1,3}(?:,\d{3})?|\d+\+)\s+connections/i)?.[1]
        ?.replaceAll(",", "") || "",
    skills: parseLinkedInSkills($, people, fallback),
    focus: toArray(fallback?.focus),
    experience:
      parseLinkedInSectionEntries(
        $,
        findLinkedInSection($, [/^experience$/i, /experience/i]),
        "experience",
      ) || toArray(fallback?.experience),
    education:
      parseLinkedInSectionEntries(
        $,
        findLinkedInSection($, [/^education$/i, /education/i]),
        "education",
      ) || toArray(fallback?.education),
  };
}

export function isPlaceholderProfileImage(value = "") {
  return /static\.licdn\.com\/aero-v1\/sc\/h\//i.test(value);
}
