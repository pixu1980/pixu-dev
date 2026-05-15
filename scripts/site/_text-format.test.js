// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getBuildDateParts,
  getDisplayLabel,
  getStatusLabel,
  formatDate,
  formatNumber,
} from "./_format.js";
import {
  englishText,
  escapeAttr,
  escapeHtml,
  isExternalUrl,
  isLikelyEnglish,
  normalizeTypography,
  normalizeWhitespace,
  slugify,
  splitTextLines,
  toArray,
  toNumber,
  truncateText,
  uniqueBy,
} from "./_text.js";

test("text helpers normalize typography, escaping, slugs, arrays, and uniqueness", () => {
  assert.equal(normalizeTypography("A\u2014B \u201cC\u201d"), 'A - B "C"');
  assert.equal(
    escapeHtml(`<a title="x">It's</a>`),
    "&lt;a title=&quot;x&quot;&gt;It&#39;s&lt;/a&gt;",
  );
  assert.equal(escapeAttr("`x`"), "&#96;x&#96;");
  assert.equal(normalizeWhitespace(" a\n b "), "a b");
  assert.equal(truncateText("one two three", 8), "one two...");
  assert.equal(slugify("Hello, World!"), "hello-world");
  assert.deepEqual(splitTextLines(" a\n\n b "), ["a", "b"]);
  assert.deepEqual(toArray("x"), []);
  assert.equal(toNumber("4"), 4);
  assert.deepEqual(
    uniqueBy([{ id: 1 }, { id: 1 }, { id: 2 }], (item) => item.id),
    [{ id: 1 }, { id: 2 }],
  );
  assert.equal(isExternalUrl("https://pixu.dev"), true);
});

test("English helpers reject configured non-English markers and accept short allowed text", () => {
  assert.equal(isLikelyEnglish("Present and future frontend architecture"), true);
  assert.equal(englishText("CSS", "", { allowShort: true }), "CSS");
  assert.equal(englishText("", "fallback"), "fallback");
});

test("format helpers expose status, number, date, section label, and build date data", () => {
  assert.equal(getStatusLabel("live"), "Live");
  assert.equal(getStatusLabel("fallback"), "Fallback");
  assert.equal(formatNumber(1200), "1.2K");
  assert.equal(formatDate("2026-05-15T00:00:00Z"), "May 2026");
  assert.equal(getDisplayLabel({ slug: "portfolio", text: "Projects" }), "Portfolio");
  assert.match(getBuildDateParts().buildDate, /^\d{4}-\d{2}-\d{2}$/);
});
