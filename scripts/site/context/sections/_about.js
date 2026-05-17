import { collectStructuredSectionBlocks, getParagraphsFromHtml } from "../../markdown/index.js";
import { normalizeWhitespace, toArray } from "../../_text.js";
import { buildContactMethods, normalizeLinks } from "../_helpers.js";

function buildAboutSection(section, frontmatter, data, leadHtml) {
  return {
    ...section,
    leadHtml,
    insightBlocks: collectStructuredSectionBlocks(section),
    linkedin: {
      ...data.linkedin,
      displaySkills: data.linkedin.skills?.length ? data.linkedin.skills : data.linkedin.focus,
    },
    contact: {
      headline: frontmatter.availability?.headline || "Available for design engineering work",
      summary:
        frontmatter.availability?.summary ||
        getParagraphsFromHtml(section.contactHtml).join(" ") ||
        normalizeWhitespace(section.contactHtml || ""),
      methods: buildContactMethods(frontmatter),
      links: normalizeLinks(toArray(frontmatter.links).slice(0, 5), "link"),
    },
  };
}

export { buildAboutSection };
