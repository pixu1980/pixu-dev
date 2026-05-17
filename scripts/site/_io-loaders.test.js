// @ts-check
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import { fetchJson, fetchResponse, fetchText } from "./_fetch.js";
import { runBuildInteractions } from "./_build-interactions.js";
import { getPreferredProfileImage } from "./_profile-image.js";
import { canPrompt, promptYesNo } from "./_prompt.js";
import { loadGitHubData } from "./github/_load.js";
import { loadLinkedInData } from "./linkedin/_load.js";
import { loadSessionizeData } from "./sessionize/_load.js";
import {
  assertSafeOutputRoot,
  copyAssets,
  localizeProfileImage,
  readTemplate,
} from "./output/_assets.js";
import { ensureDir } from "./output/_ensure-dir.js";

test("fetch helpers add defaults, parse JSON/text, and throw on HTTP errors", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => ({
    ok: !String(url).includes("fail"),
    status: 503,
    json: async () => ({ ok: true }),
    text: async () => "ok",
  }));

  assert.equal((await fetchResponse("https://example.com")).ok, true);
  assert.deepEqual(await fetchJson("https://example.com/data.json"), { ok: true });
  assert.equal(await fetchText("https://example.com/page"), "ok");
  await assert.rejects(() => fetchResponse("https://example.com/fail"), /Fetch failed 503/);
});

test("loaders return fallback data when external configuration is missing", async () => {
  const github = await loadGitHubData(
    {},
    {
      repos: [
        { name: "demo", description: "English repo", html_url: "https://github.com/pixu1980/demo" },
      ],
    },
  );
  const sessionize = await loadSessionizeData(
    {},
    { talks: [{ title: "Talk", languages: ["EN"] }], events: ["event"], topics: ["CSS"] },
  );
  const linkedin = await loadLinkedInData(
    { enabled: false },
    { name: "Pixu", focus: ["CSS"], experience: [{ title: "Dev" }] },
  );

  assert.equal(github.status, "fallback");
  assert.equal(github.repos[0].name, "demo");
  assert.equal(sessionize.talks[0].title, "Talk");
  assert.equal(linkedin.skills[0], "CSS");
});

test("profile image and output helpers choose, localize, copy, and read assets", async (t) => {
  const temp = await mkdtemp(join(tmpdir(), "pixu-output-"));

  t.mock.method(globalThis, "fetch", async () => ({
    ok: true,
    headers: new Headers({ "content-type": "image/png" }),
    arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
  }));

  try {
    await ensureDir(join(temp, "nested"));
    await assert.doesNotReject(() => stat(join(temp, "nested")));

    assert.equal(
      getPreferredProfileImage({
        linkedin: {
          profileImage: "https://media.licdn.com/dms/image/static.licdn.com/aero-v1/sc/h/foo",
        },
        sessionize: { speaker: { image: "https://sessionize.com/me.jpg" } },
        github: { profile: { avatarUrl: "https://github.com/pixu1980.png" } },
      }),
      "https://sessionize.com/me.jpg",
    );

    assert.equal(
      await localizeProfileImage("https://example.com/profile", temp),
      "assets/profile.png",
    );
    assert.equal((await readFile(join(temp, "assets", "profile.png"))).length, 3);
    assert.equal(await localizeProfileImage("/local.jpg", temp), "/local.jpg");
    await copyAssets(join(temp, "dist"), join(temp, "public"));
    assert.match(await readTemplate(join(temp, "dist", "styles", "index.css")), /@import/);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test("output helpers reject unsafe output roots before removing files", () => {
  assert.throws(() => assertSafeOutputRoot(process.cwd()), /Refusing to clear unsafe output root/);
  assert.doesNotThrow(() => assertSafeOutputRoot(join(tmpdir(), "pixu-output-safe")));
});

test("prompt and build interaction helpers stay inert without enabled options", async () => {
  assert.equal(canPrompt({}), false);
  assert.equal(await promptYesNo("Use browser?", true, {}), true);

  const frontmatter = { sourceConfig: { github: {}, sessionize: { talkRepoMap: [] } } };
  const result = await runBuildInteractions({
    frontmatter,
    content: "## Portfolio",
    github: { repos: [] },
    sessionizeRaw: { talks: [] },
    path: "content/resume.md",
    options: {},
  });

  assert.equal(result.frontmatter, frontmatter);
});
