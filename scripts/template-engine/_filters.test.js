// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";
import { TemplateRenderer } from "./_renderer.js";

test("built-in filter aliases keep behavior parity", () => {
  const renderer = new TemplateRenderer(process.cwd());
  const filters = Object.fromEntries(renderer.filters);

  assert.equal(filters.slug("Hello World"), "hello-world");
  assert.equal(filters.slugify("Hello World"), "hello-world");
  assert.equal(filters.md("**x**"), filters.markdown("**x**"));
});
