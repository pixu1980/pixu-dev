// @ts-check
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import { buildSite } from "./_build-site.js";

test("buildSite renders from markdown snapshots and does not emit runtime resume json", async () => {
  const root = await mkdtemp(join(tmpdir(), "pixu-build-site-"));
  const sourcePath = join(root, "resume.md");
  const outDir = join(root, "dist");

  await writeFile(
    sourcePath,
    `---
name: Emiliano Pisu
title: Senior Frontend Engineer
summary: Build from one source.
location: Rome, Italy
links:
  - label: GitHub
    url: https://github.com/pixu1980
sourceConfig:
  github:
    profile: https://github.com/pixu1980
  sessionize:
    profile: https://sessionize.com/pixu1980/
generated:
  github:
    status: live
    profile:
      username: pixu1980
    repos:
      - name: detector-js
        description: Zero-dependency platform detector
        url: https://github.com/pixu1980/detector-js
        homepage: https://detector.js.org
        language: JavaScript
        stars: 33
        watchers: 33
        forksCount: 7
        openIssues: 0
        archived: false
        fork: false
        private: false
        tags:
          - javascript
        updatedAt: 2026-05-01T00:00:00.000Z
        createdAt: 2024-01-01T00:00:00.000Z
        slug: detector-js
  sessionize:
    status: live
    profileUrl: https://sessionize.com/pixu1980/
    speaker:
      headline: Public Speaking
      summary: Sessionize snapshot.
      topics:
        - Accessibility
    talks:
      - title: Accessible Web
        abstract: Patterns that survive delivery pressure.
        url: https://sessionize.com/s/pixu1980/accessible-web/123
        languages:
          - EN
        technicalLevel: 200
    events:
      - name: DevFest Bari
        when: November 2025
        where: Bari, Italy
  linkedin:
    status: fallback
    name: Emiliano Pisu
    headline: Senior Frontend Engineer
    summary: Build from markdown snapshots.
    skills:
      - Accessibility
    focus:
      - Accessibility
fallbacks:
  github:
    repos:
      - name: detector-js
        description: Zero-dependency platform detector
        url: https://github.com/pixu1980/detector-js
        homepage: https://detector.js.org
        language: JavaScript
        stars: 33
        watchers: 33
        forksCount: 7
        openIssues: 0
        archived: false
        fork: false
        private: false
        tags:
          - javascript
        updatedAt: 2026-05-01T00:00:00.000Z
        createdAt: 2024-01-01T00:00:00.000Z
        slug: detector-js
  sessionize:
    speakerHeadline: Public Speaking
    summary: Sessionize snapshot.
    topics:
      - Accessibility
    talks:
      - title: Accessible Web
        abstract: Patterns that survive delivery pressure.
        url: https://sessionize.com/s/pixu1980/accessible-web/123
        languages:
          - EN
        technicalLevel: 200
    events:
      - name: DevFest Bari
        when: November 2025
        where: Bari, Italy
  linkedin:
    name: Emiliano Pisu
    headline: Senior Frontend Engineer
    summary: Build from markdown snapshots.
    skills:
      - Accessibility
    focus:
      - Accessibility
---

## About

Lead paragraph.

## Experience

### Senior Frontend Engineer - Pixu Dev

April 2024 - Present

Building resilient interfaces.

## Skills

### Design Engineering

Systems and interfaces.

## Portfolio

Selected work.

## Speaking

Talks and events.
`,
    "utf8",
  );

  try {
    await buildSite({ sourcePath, outDir, publicDir: outDir, useFrontmatterFallbacksOnly: true });

    const html = await readFile(join(outDir, "index.html"), "utf8");
    assert.match(html, /detector-js/);
    assert.match(html, /Accessible Web/);
    await assert.rejects(() => stat(join(outDir, "data", "resume.json")), /ENOENT/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
