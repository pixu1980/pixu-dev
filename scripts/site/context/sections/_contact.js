import { getParagraphsFromHtml } from "../../markdown/index.js";
import { normalizeWhitespace, toArray } from "../../_text.js";
import { buildContactMethods, normalizeLinks } from "../_helpers.js";

function buildContactSection(section, frontmatter, _data, leadHtml) {
  return {
    ...section,
    leadHtml,
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

export { buildContactSection };
