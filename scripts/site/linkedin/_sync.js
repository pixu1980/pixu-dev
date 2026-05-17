import { buildSections } from "../markdown/index.js";
import {
  getGeneratedSources,
  getLinkedInImportSections,
  normalizeResumeFrontmatter,
  upsertMarkdownSection,
} from "../_resume-document.js";
import { normalizeWhitespace, toArray } from "../_text.js";

function formatTimelineHeading(entry) {
  const title = normalizeWhitespace(entry?.title);
  const organization = normalizeWhitespace(entry?.organization || entry?.subtitle);

  if (title && organization) return `${title} - ${organization}`;

  return title || organization || "Untitled entry";
}

function normalizeEntry(entry = {}) {
  return {
    ...entry,
    title: normalizeWhitespace(entry.title),
    organization: normalizeWhitespace(entry.organization),
    subtitle: normalizeWhitespace(entry.subtitle),
    dateRange: normalizeWhitespace(entry.dateRange),
    summary: normalizeWhitespace(entry.summary),
    highlights: toArray(entry.highlights).map(normalizeWhitespace).filter(Boolean),
    skills: toArray(entry.skills).map(normalizeWhitespace).filter(Boolean),
  };
}

function renderTimelineSectionMarkdown(entries = [], leadMarkdown = "") {
  const parts = [];
  const normalizedLead = String(leadMarkdown || "").trim();

  normalizedLead && parts.push(normalizedLead);

  toArray(entries)
    .map(normalizeEntry)
    .filter((entry) => entry.title || entry.organization || entry.subtitle)
    .forEach((entry) => {
      const lines = [`### ${formatTimelineHeading(entry)}`];

      entry.dateRange && lines.push("", entry.dateRange);
      entry.summary && lines.push("", entry.summary);

      entry.highlights.length && lines.push("", ...entry.highlights.map((item) => `- ${item}`));
      entry.skills.length && lines.push("", `Stack: ${entry.skills.join(", ")}`);

      parts.push(lines.join("\n"));
    });

  return `${parts.filter(Boolean).join("\n\n").trim()}\n`;
}

function nextImportedValue(importSections, key, parsedValue, currentValue) {
  return importSections.has(key)
    ? parsedValue || currentValue || (Array.isArray(parsedValue) ? [] : "")
    : currentValue;
}

export function applyLinkedInSync({ frontmatter = {}, content = "", parsed = {} }) {
  const nextFrontmatter = normalizeResumeFrontmatter(frontmatter);
  const importSections = new Set(getLinkedInImportSections(nextFrontmatter));
  const generated = getGeneratedSources(nextFrontmatter);
  const currentLinkedIn = structuredClone(generated.linkedin || {});
  const nextLinkedIn = {
    ...currentLinkedIn,
    label: "LinkedIn",
    status: parsed.status || currentLinkedIn.status || "fallback",
    profileUrl:
      parsed.profileUrl ||
      currentLinkedIn.profileUrl ||
      nextFrontmatter.sourceConfig?.linkedin?.profile ||
      "",
    profileImage: parsed.profileImage || currentLinkedIn.profileImage || "",
    name: parsed.name || currentLinkedIn.name || nextFrontmatter.name || "",
    focus: parsed.focus?.length ? parsed.focus : toArray(currentLinkedIn.focus),
    services: parsed.services?.length ? parsed.services : toArray(currentLinkedIn.services),
    connections: parsed.connections || currentLinkedIn.connections || "",
  };

  nextLinkedIn.headline = nextImportedValue(
    importSections,
    "headline",
    normalizeWhitespace(parsed.headline),
    normalizeWhitespace(currentLinkedIn.headline || nextFrontmatter.title),
  );
  nextLinkedIn.summary = nextImportedValue(
    importSections,
    "summary",
    normalizeWhitespace(parsed.summary),
    normalizeWhitespace(currentLinkedIn.summary || nextFrontmatter.summary),
  );
  nextLinkedIn.skills = nextImportedValue(
    importSections,
    "skills",
    toArray(parsed.skills),
    toArray(currentLinkedIn.skills),
  );
  nextLinkedIn.experience = nextImportedValue(
    importSections,
    "experience",
    toArray(parsed.experience),
    toArray(currentLinkedIn.experience),
  );
  nextLinkedIn.education = nextImportedValue(
    importSections,
    "education",
    toArray(parsed.education),
    toArray(currentLinkedIn.education),
  );

  nextFrontmatter.generated = {
    ...generated,
    linkedin: nextLinkedIn,
  };

  if (parsed.name) {
    nextFrontmatter.name = parsed.name;
  }

  if (importSections.has("headline") && parsed.headline) {
    nextFrontmatter.title = parsed.headline;
  }

  if (importSections.has("summary") && parsed.summary) {
    nextFrontmatter.summary = parsed.summary;
  }

  let nextContent = content;
  const sections = buildSections(content);
  const experienceSection = sections.find((section) => section.slug === "experience");
  const educationSection = sections.find((section) => section.slug === "education");
  const experienceLead = experienceSection?.blocks?.length ? experienceSection.leadMarkdown : "";
  const educationLead = educationSection?.blocks?.length ? educationSection.leadMarkdown : "";

  if (importSections.has("experience") && nextLinkedIn.experience.length) {
    nextContent = upsertMarkdownSection(
      nextContent,
      experienceSection?.text || "Experience",
      renderTimelineSectionMarkdown(nextLinkedIn.experience, experienceLead),
    );
  }

  if (importSections.has("education") && nextLinkedIn.education.length) {
    nextContent = upsertMarkdownSection(
      nextContent,
      educationSection?.text || "Education",
      renderTimelineSectionMarkdown(nextLinkedIn.education, educationLead),
    );
  }

  return {
    frontmatter: nextFrontmatter,
    content: nextContent,
    importedSections: [...importSections],
  };
}

export { renderTimelineSectionMarkdown };
