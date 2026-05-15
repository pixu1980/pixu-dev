import { marked } from "marked";
import { createMarkedOptions } from "../_marked-options.js";
import { ensureRootAbsolute } from "./_shared.js";

function registerHtmlFilters(renderer) {
  renderer.registerFilter("absUrl", (value) => ensureRootAbsolute(value));
  renderer.registerFilter("escapeHtml", (value) => {
    const htmlEscapeMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;",
    };
    return String(value).replace(/[&<>"']/g, (s) => htmlEscapeMap[s]);
  });
  renderer.registerFilter("raw", (value) => value);
  renderer.registerFilter("striptags", (value) => String(value).replace(/<[^>]*>/g, ""));
  renderer.registerFilter("md", (value) => {
    try {
      return marked(String(value), createMarkedOptions());
    } catch {
      return String(value);
    }
  });
  renderer.registerFilter("rawMd", (value) => {
    try {
      return marked(String(value), createMarkedOptions());
    } catch {
      return String(value);
    }
  });
  renderer.registerFilter("markdown", (value) => {
    try {
      return marked(String(value), createMarkedOptions());
    } catch {
      return String(value);
    }
  });
}

export { registerHtmlFilters };
