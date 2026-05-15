// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import { registerAllBuiltinFilters } from "./index.js";
import { ensureRootAbsolute, getTagHref, getTagLabel, utilSlug } from "./_shared.js";
import { createMarkedOptions } from "../_marked-options.js";

function createRenderer() {
  const filters = new Map();
  return {
    filters,
    registerFilter(name, fn) {
      filters.set(name, fn);
    },
  };
}

test("filter shared helpers normalize slugs, URLs, and tag display", () => {
  assert.equal(utilSlug("Hello World!"), "hello-world");
  assert.equal(ensureRootAbsolute("docs/page.html"), "/docs/page.html");
  assert.equal(ensureRootAbsolute("https://pixu.dev"), "https://pixu.dev");
  assert.equal(getTagHref({ name: "CSS" }), "/tags/css.html");
  assert.equal(getTagHref({ url: "tags/html.html" }), "/tags/html.html");
  assert.equal(getTagLabel("css"), "CSS");
});

test("built-in filters cover text, HTML, date, and collection behavior", () => {
  const renderer = createRenderer();
  registerAllBuiltinFilters(renderer);
  const filters = Object.fromEntries(renderer.filters);

  assert.equal(filters.upper("hello"), "HELLO");
  assert.equal(filters.escapeHtml("<x>"), "&lt;x&gt;");
  assert.match(filters.md("**bold**"), /<strong>bold<\/strong>/);
  assert.equal(filters.date("2026-05-15T00:00:00Z", "YYYY-MM-DD"), "2026-05-15");
  assert.equal(filters.join([{ label: "A" }, "B"], " / "), "A / B");
  assert.equal(filters.length([1, 2]), 2);
  assert.equal(filters.prop({ name: "Pixu" }, "name"), "Pixu");
  assert.deepEqual(filters.slice([1, 2, 3], 1), [2, 3]);
  assert.deepEqual(Object.keys(filters.groupBy([{ type: "a" }, { type: "a" }], "type")), ["a"]);
  assert.equal(filters.sortBy([{ n: 2 }, { n: 1 }], "n")[0].n, 1);
  assert.deepEqual(createMarkedOptions(), { gfm: true });
});
