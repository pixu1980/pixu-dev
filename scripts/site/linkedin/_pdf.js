import { access, readdir, readFile } from "node:fs/promises";
import { extname, isAbsolute, join, resolve } from "node:path";

import { PDFParse } from "pdf-parse";

import { CONTENT, ROOT } from "../_constants.js";
import { looksLikeDateRange } from "../markdown/_sections.js";
import { normalizeWhitespace, toArray, uniqueBy } from "../_text.js";

const SECTION_MARKERS = new Set([
  "Summary",
  "Experience",
  "Education",
  "Top Skills",
  "Skills",
  "Languages",
  "Certifications",
]);
const TITLE_HINT_RE =
  /\b(engineer|developer|lead|mentor|architect|designer|manager|consultant|speaker|host|sensei|advocate|specialist|teacher|owner|founder)\b/i;
const ORGANIZATION_HINT_RE =
  /\b(dev|dojo|software|studio|agency|consulting|group|company|labs|universit|school|academy|s\.r\.l\.|inc|ltd|llc|corp)\b/i;
const EXPERIENCE_DATE_LINE_RE =
  /^(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Sept)\s+\d{4}|\d{4})\s*-\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Sept)\s+\d{4}|Present|\d{4})(?:\s*\([^)]*\))?$/i;
const URL_RE = /(?:https?:\/\/|www\.)\S+/i;
const EMAIL_RE = /\S+@\S+/;
const PHONE_RE = /^\+?[\d\s().-]{8,}$/;
const PDF_TRANSLATIONS = new Map([
  ["architettura delle soluzioni", "Solution architecture"],
  ["sviluppo web", "Web development"],
  ["istruzione in aula", "Classroom training"],
  ["roma", "Rome"],
  ["roma, italia", "Rome, Italy"],
  ["roma, lazio, italia", "Rome, Latium, Italy"],
  ["autonomo", "Freelance"],
  [
    "perito tecnico industriale spec. informatica, informatica",
    "Industrial Technical Diploma, Computer Science",
  ],
]);

async function pathExists(pathname) {
  try {
    await access(pathname);
    return true;
  } catch {
    return false;
  }
}

function resolvePdfCandidate(candidate, rootDir = ROOT) {
  return isAbsolute(candidate) ? candidate : resolve(rootDir, candidate);
}

function cleanPdfLine(value = "") {
  return normalizeWhitespace(
    String(value)
      .replaceAll("\u0000", "")
      .replace(/^Page\s+\d+\s+of\s+\d+$/i, "")
      .replace(/^--\s*\d+\s+of\s+\d+\s*--$/i, ""),
  );
}

function splitPdfLines(text = "") {
  return String(text).replace(/\f/g, "\n").split(/\r?\n/).map(cleanPdfLine).filter(Boolean);
}

function joinPdfText(lines = []) {
  return normalizeWhitespace(
    lines
      .join(" ")
      .replace(/([.?!])([A-Z])/g, "$1 $2")
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(/\(\s+/g, "(")
      .replace(/\s+\)/g, ")"),
  );
}

function isHardSummaryBreak(line = "") {
  return (
    /^[-•⁃]/.test(line) ||
    /^(Project|Client|Role|Software|Solution|Technologies|Used technologies|Description|Lessons?|Stack|Highlights?)\s*:/i.test(
      line,
    )
  );
}

function looksLikeSummaryContinuation(previousLine = "", currentLine = "") {
  if (!previousLine || !currentLine) return false;

  return (
    !isHardSummaryBreak(currentLine) &&
    (!/[.!?)]$/.test(previousLine) || /[,;:-]$/.test(previousLine))
  );
}

function joinPdfSummary(lines = []) {
  const normalized = lines.map(normalizeWhitespace).filter(Boolean);
  const paragraphs = [];

  for (const line of normalized) {
    const previous = paragraphs.at(-1) || "";

    if (looksLikeSummaryContinuation(previous, line)) {
      paragraphs[paragraphs.length - 1] = `${previous} ${line}`;
      continue;
    }

    paragraphs.push(line);
  }

  return paragraphs.join("\n\n").trim();
}

function getSectionLines(lines, startLabel, stopLabels = []) {
  const startIndex = lines.indexOf(startLabel);

  if (startIndex < 0) return [];

  let endIndex = lines.length;

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (stopLabels.includes(lines[index])) {
      endIndex = index;
      break;
    }
  }

  return lines.slice(startIndex + 1, endIndex).filter((line) => !SECTION_MARKERS.has(line));
}

function looksLikePersonName(value = "") {
  return (
    /^[A-Z][\p{L}'-]+(?:\s+[A-Z][\p{L}'-]+)+$/u.test(value) &&
    value.length < 64 &&
    !URL_RE.test(value) &&
    !EMAIL_RE.test(value) &&
    !PHONE_RE.test(value)
  );
}

function looksLikeLocationLine(value = "") {
  return (
    value.length > 0 &&
    value.length <= 72 &&
    !URL_RE.test(value) &&
    !EMAIL_RE.test(value) &&
    !PHONE_RE.test(value) &&
    !looksLikeDateRange(value) &&
    !/[.!?]$/.test(value) &&
    /^[\p{L}\d ,.'/()&-]+$/u.test(value) &&
    (/,/.test(value) ||
      /\b(remote|rome|roma|latium|italy)\b/i.test(value) ||
      value.split(/\s+/).length <= 4)
  );
}

function normalizeLinkedInUrl(value = "") {
  const normalized = normalizeWhitespace(value).replace(/\s*\(LinkedIn\)$/i, "");

  if (!normalized) return "";
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (/linkedin\.com\//i.test(normalized)) return `https://${normalized.replace(/^\/+/, "")}`;

  return "";
}

function translatePdfValue(value = "") {
  const normalized = normalizeWhitespace(value);
  return PDF_TRANSLATIONS.get(normalized.toLowerCase()) || normalized;
}

function cleanHeadline(value = "") {
  return normalizeWhitespace(value)
    .replace(/\s*#+\s*/g, " | ")
    .replace(/[♀♂]/g, " ")
    .replace(/\s*\|\s*\|+/g, " | ")
    .replace(/\s{2,}/g, " ")
    .replace(/^\|\s*|\s*\|$/g, "");
}

function extractHeader(lines, fallback) {
  const summaryIndex = lines.indexOf("Summary");
  const headerLines = summaryIndex >= 0 ? lines.slice(0, summaryIndex) : [...lines];
  let name = fallback?.name || "";
  let nameIndex = -1;

  for (let index = headerLines.length - 1; index >= 0; index -= 1) {
    if (looksLikePersonName(headerLines[index])) {
      name = headerLines[index];
      nameIndex = index;
      break;
    }
  }

  const headlineSource = headerLines.slice(Math.max(nameIndex + 1, 0)).filter((line) => {
    return (
      !looksLikeLocationLine(line) &&
      !URL_RE.test(line) &&
      !EMAIL_RE.test(line) &&
      !PHONE_RE.test(line) &&
      !SECTION_MARKERS.has(line)
    );
  });

  return {
    headline: cleanHeadline(joinPdfText(headlineSource)) || fallback?.headline || "",
    name,
  };
}

function extractSummary(lines, fallback) {
  return joinPdfText(getSectionLines(lines, "Summary", ["Experience"])) || fallback?.summary || "";
}

function extractSkills(lines, fallback) {
  const skillSection = getSectionLines(lines, "Top Skills", [
    "Experience",
    "Education",
    "Languages",
    "Certifications",
    "Summary",
  ]);
  const parsedSkills = (
    skillSection.length
      ? skillSection
      : getSectionLines(lines, "Skills", [
          "Experience",
          "Education",
          "Languages",
          "Certifications",
          "Summary",
        ])
  )
    .filter((line) => line.length <= 64)
    .map(translatePdfValue)
    .filter(Boolean);

  return uniqueBy(
    [...parsedSkills, ...toArray(fallback?.skills), ...toArray(fallback?.focus)].map(
      normalizeWhitespace,
    ),
    (skill) => skill.toLowerCase(),
  ).slice(0, 28);
}

function looksLikeExperienceDate(value = "") {
  return EXPERIENCE_DATE_LINE_RE.test(normalizeWhitespace(value));
}

function classifyExperienceHeader(firstLine = "", secondLine = "") {
  const firstLooksTitle = TITLE_HINT_RE.test(firstLine);
  const secondLooksTitle = TITLE_HINT_RE.test(secondLine);
  const firstLooksOrganization =
    ORGANIZATION_HINT_RE.test(firstLine) || looksLikePersonName(firstLine);
  const secondLooksOrganization =
    ORGANIZATION_HINT_RE.test(secondLine) || looksLikePersonName(secondLine);

  if (firstLooksTitle && !secondLooksTitle) {
    return { organization: secondLine, title: firstLine };
  }

  if (secondLooksTitle && !firstLooksTitle) {
    return { organization: firstLine, title: secondLine };
  }

  if (firstLooksOrganization && !secondLooksOrganization) {
    return { organization: firstLine, title: secondLine };
  }

  return { organization: firstLine, title: secondLine };
}

function classifyExperienceHeaderLines(headerLines = []) {
  const lines = headerLines.map(normalizeWhitespace).filter(Boolean);

  if (!lines.length) {
    return { organization: "", title: "" };
  }

  if (lines.length === 1) {
    return { organization: "", title: lines[0] };
  }

  const titleLine = lines.at(-1) || "";

  if (TITLE_HINT_RE.test(titleLine)) {
    const organizationLines = lines
      .slice(0, -1)
      .filter(
        (line) => ORGANIZATION_HINT_RE.test(line) || looksLikePersonName(line) || /[()]/.test(line),
      );

    return {
      organization: organizationLines.length
        ? organizationLines.join(" ")
        : lines.slice(0, -1).at(-1) || "",
      title: titleLine,
    };
  }

  const pair = classifyExperienceHeader(lines.at(-2) || "", titleLine);
  const prefix = lines.slice(0, -2).join(" ");

  return {
    organization: [prefix, pair.organization].filter(Boolean).join(" "),
    title: pair.title,
  };
}

function looksLikeExperienceHeaderLine(value = "") {
  const normalized = normalizeWhitespace(value);
  const hasCorporateSuffix = /(?:s\.r\.l\.|s\.p\.a\.|inc\.|ltd\.|llc\.|corp\.)$/i.test(normalized);

  return (
    normalized.length > 0 &&
    normalized.length <= 96 &&
    /^[\p{Lu}\d(]/u.test(normalized) &&
    !looksLikeExperienceDate(normalized) &&
    (!/[.!?]$/.test(normalized) || hasCorporateSuffix) &&
    !/^[-•⁃]/.test(normalized) &&
    !/^(Project|Client|Role|Software|Solution|Technologies|Used technologies|Description|Lessons?|Stack|Highlights?):/i.test(
      normalized,
    )
  );
}

function getExperienceHeaderLines(sectionLines = [], dateIndex = 0) {
  const headerLines = [];

  for (let index = dateIndex - 1; index >= 0 && headerLines.length < 3; index -= 1) {
    const line = sectionLines[index] || "";

    if (!looksLikeExperienceHeaderLine(line)) {
      if (headerLines.length) break;
      continue;
    }

    headerLines.unshift(line);
  }

  return headerLines;
}

function extractExperience(lines, fallback) {
  const sectionLines = getSectionLines(lines, "Experience", ["Education"]);
  const dateIndexes = [];

  sectionLines.forEach((line, index) => {
    if (looksLikeExperienceDate(line) && index >= 2) {
      dateIndexes.push(index);
    }
  });

  const entries = dateIndexes
    .map((dateIndex, position) => {
      const nextDateIndex = dateIndexes[position + 1] ?? sectionLines.length;
      const headerLines = getExperienceHeaderLines(sectionLines, dateIndex);
      const { organization, title } = classifyExperienceHeaderLines(headerLines);

      if (!title && !organization) {
        return null;
      }

      let summaryStart = dateIndex + 1;
      let location = "";

      if (looksLikeLocationLine(sectionLines[summaryStart] || "")) {
        location = sectionLines[summaryStart];
        summaryStart += 1;
      }

      const nextHeaderStart =
        nextDateIndex < sectionLines.length
          ? nextDateIndex - getExperienceHeaderLines(sectionLines, nextDateIndex).length
          : nextDateIndex;
      const summaryEnd = Math.max(summaryStart, nextHeaderStart);
      const summary = joinPdfSummary(sectionLines.slice(summaryStart, summaryEnd));

      return {
        dateRange: sectionLines[dateIndex],
        highlights: [],
        location: translatePdfValue(location),
        organization: translatePdfValue(organization),
        skills: [],
        summary,
        title: translatePdfValue(title) || translatePdfValue(organization),
      };
    })
    .filter(Boolean);

  return entries.length
    ? uniqueBy(
        entries,
        (entry) =>
          `${entry.title.toLowerCase()}::${entry.organization.toLowerCase()}::${entry.dateRange.toLowerCase()}`,
      )
    : toArray(fallback?.experience);
}

function extractEducation(lines, fallback) {
  const sectionLines = getSectionLines(lines, "Education", [
    "Skills",
    "Top Skills",
    "Languages",
    "Certifications",
  ]);
  const entries = [];

  for (let index = 0; index < sectionLines.length; index += 1) {
    const title = sectionLines[index];
    const subtitleLine = sectionLines[index + 1] || "";

    if (!title || looksLikeDateRange(title) || SECTION_MARKERS.has(title)) {
      continue;
    }

    if (!subtitleLine || SECTION_MARKERS.has(subtitleLine)) {
      entries.push({ dateRange: "", highlights: [], subtitle: "", summary: "", title });
      continue;
    }

    const dateRange =
      subtitleLine.match(/\(([^)]*\d{4}[^)]*)\)/)?.[1] ||
      subtitleLine.match(/\b\d{4}\s*-\s*\d{4}\b/)?.[0] ||
      "";

    entries.push({
      dateRange,
      highlights: [],
      subtitle: translatePdfValue(
        subtitleLine
          .replace(/\(([^)]*\d{4}[^)]*)\)/g, "")
          .replace(/\s*·\s*$/, "")
          .replace(/\s+-\s*$/, ""),
      ),
      summary: "",
      title: translatePdfValue(title),
    });
    index += 1;
  }

  return entries.length
    ? uniqueBy(entries, (entry) => `${entry.title.toLowerCase()}::${entry.dateRange.toLowerCase()}`)
    : toArray(fallback?.education);
}

function extractProfileUrl(lines, config) {
  return (
    normalizeLinkedInUrl(config?.profile || "") ||
    normalizeLinkedInUrl(lines.find((line) => /linkedin\.com\/in\//i.test(line)) || "")
  );
}

export async function findLinkedInPdfPath(config = {}, options = {}) {
  const contentDir = options.contentDir || CONTENT;
  const rootDir = options.rootDir || ROOT;
  const candidates = [];

  if (config?.pdf) {
    const configuredCandidate = resolvePdfCandidate(config.pdf, rootDir);
    return (await pathExists(configuredCandidate)) ? configuredCandidate : "";
  }

  candidates.push(
    join(contentDir, "profile.pdf"),
    join(contentDir, "linkedin-profile.pdf"),
    join(contentDir, "linkedin.pdf"),
    join(contentDir, "linkedin-export.pdf"),
  );

  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      return candidate;
    }
  }

  const entries = await readdir(contentDir, { withFileTypes: true }).catch(() => []);
  const fallback = entries
    .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === ".pdf")
    .map((entry) => join(contentDir, entry.name))
    .sort((left, right) => left.localeCompare(right))[0];

  return fallback || "";
}

export async function extractLinkedInPdfText(pdfPath) {
  if (!pdfPath) return "";

  const buffer = await readFile(pdfPath);
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text || "";
  } finally {
    await parser.destroy().catch(() => {});
  }
}

export function parseLinkedInPdfText(text, fallback = {}, config = {}) {
  const lines = splitPdfLines(text);
  const header = extractHeader(lines, fallback);

  return {
    connections: "",
    education: extractEducation(lines, fallback),
    experience: extractExperience(lines, fallback),
    focus: toArray(fallback?.focus),
    headline: header.headline,
    name: header.name,
    profileImage: fallback?.profileImage || "",
    profileUrl: extractProfileUrl(lines, config),
    services: toArray(fallback?.services),
    skills: extractSkills(lines, fallback),
    summary: extractSummary(lines, fallback),
  };
}

export function isPlaceholderProfileImage(value = "") {
  return /static\.licdn\.com\/aero-v1\/sc\/h\//i.test(value);
}
