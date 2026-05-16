// @ts-check
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { test } from "node:test";

test("component utilities register styles and custom elements once", async () => {
  const dom = new JSDOM("<!doctype html><head></head><body></body>", {
    url: "https://pixu.dev/",
  });
  globalThis.document = dom.window.document;
  globalThis.customElements = dom.window.customElements;
  globalThis.CSSStyleSheet = dom.window.CSSStyleSheet;

  const { canAdoptStyleSheets, registerComponent, registerStyles } = await import("./_utils.js");

  class DemoElement extends dom.window.HTMLElement {}

  assert.equal(canAdoptStyleSheets(), false);
  registerStyles("demo-element", "demo-element { color: red; }");
  registerStyles("demo-element", "demo-element { color: blue; }");
  registerComponent("demo-element", DemoElement);
  registerComponent("demo-element", DemoElement);

  assert.equal(document.head.querySelectorAll("style[data-component='demo-element']").length, 1);
  assert.equal(customElements.get("demo-element"), DemoElement);
});
