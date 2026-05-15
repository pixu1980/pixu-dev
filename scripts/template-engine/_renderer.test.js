// @ts-check
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import TemplateEngine, { TemplateRenderer } from "./index.js";

test("TemplateRenderer renders text, raw HTML, conditionals, loops, switch, markdown, and includes", async () => {
  const root = await mkdtemp(join(tmpdir(), "pixu-template-"));
  await writeFile(join(root, "child.html"), "<strong>{{ label }}</strong>", "utf8");
  const renderer = new TemplateRenderer(root);

  try {
    const html = renderer.renderString(
      `<p>{{ title | upper }}</p><if condition="items.length > 0"><span>yes</span></if><for each="item in items"><i>{{ item }}</i></for><switch expr="kind"><case value="a">A</case><default>B</default></switch><md>**bold**</md><include src="./child.html" data='{"label":"Child"}'></include><div>{{ raw | raw }}</div>`,
      { title: "hello", items: ["x", "y"], kind: "a", raw: "<em>raw</em>" },
      { currentDir: root },
    );

    assert.match(html, /<p>HELLO<\/p>/);
    assert.match(html, /<span>yes<\/span>/);
    assert.match(html, /<i>x<\/i><i>y<\/i>/);
    assert.match(html, /A/);
    assert.match(html, /<strong>Child<\/strong>/);
    assert.match(html, /<em>raw<\/em>/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("TemplateEngine delegates rendering and custom filters to renderer", async () => {
  const root = await mkdtemp(join(tmpdir(), "pixu-engine-"));
  await writeFile(join(root, "page.html"), "<h1>{{ title | shout }}</h1>", "utf8");
  const engine = new TemplateEngine({ rootDir: root });
  engine.registerFilter("shout", (value) => `${String(value).toUpperCase()}!`);

  try {
    assert.equal(engine.render("page.html", { title: "hello" }), "<h1>HELLO!</h1>");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
