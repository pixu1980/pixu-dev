// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  GENERATED_FAVICON_FILES,
  OBSOLETE_FAVICON_FILES,
  getAdaptiveSvg,
  getFlatLogo,
  getLogoBody,
  getLogoViewBox,
  getPngSourceSvg,
  getSafariPinnedSvg,
  getThemedLogo,
} from "./generate-favicons.js";

const sourceSvg = '<svg viewBox="0 0 300 300"><path fill="#52e0c4"/><path fill="#639"/></svg>';

test("favicon helpers extract and theme source logo", () => {
  const body = getLogoBody(sourceSvg);

  assert.equal(body, '<path fill="#52e0c4"/><path fill="#639"/>');
  assert.match(getThemedLogo(body), /class="logo-teal"/);
  assert.match(getThemedLogo(body), /class="logo-purple"/);
});

test("favicon helpers build adaptive, png, and pinned SVG variants", () => {
  const viewBox = getLogoViewBox(sourceSvg);
  const body = getLogoBody(sourceSvg);

  assert.equal(viewBox, "0 0 300 300");
  assert.match(getAdaptiveSvg(body, viewBox), /viewBox="0 0 300 300"/);
  assert.match(getPngSourceSvg(body, viewBox), /viewBox="0 0 300 300"/);
  assert.match(getSafariPinnedSvg(body, viewBox), /fill="#52e0c4"/);
  assert.equal(getFlatLogo('<path fill="#fff"/>', "#123456"), '<path fill="#123456"/>');
});

test("favicon generation keeps only current assets and marks legacy files obsolete", () => {
  assert.deepEqual(GENERATED_FAVICON_FILES, [
    "android-chrome-192x192.png",
    "android-chrome-512x512.png",
    "apple-touch-icon.png",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "favicon.svg",
    "safari-pinned-tab.svg",
    "site.webmanifest",
  ]);

  assert.deepEqual(
    OBSOLETE_FAVICON_FILES.filter((file) =>
      [
        "android-chrome-256x256.png",
        "apple-touch-icon-180x180.png",
        "browserconfig.xml",
        "favicon-48x48.png",
        "mstile-150x150.png",
      ].includes(file),
    ),
    [
      "android-chrome-256x256.png",
      "apple-touch-icon-180x180.png",
      "browserconfig.xml",
      "favicon-48x48.png",
      "mstile-150x150.png",
    ],
  );
});
