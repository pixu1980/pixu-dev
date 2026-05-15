// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getAdaptiveSvg,
  getFlatLogo,
  getLogoBody,
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
  const body = getLogoBody(sourceSvg);

  assert.match(getAdaptiveSvg(body), /prefers-color-scheme: dark/);
  assert.match(getPngSourceSvg(body), /<rect width="300" height="300" rx="54" fill="#f7f3e7"/);
  assert.match(getSafariPinnedSvg(body), /fill="#000000"/);
  assert.equal(getFlatLogo('<path fill="#fff"/>', "#123456"), '<path fill="#123456"/>');
});
