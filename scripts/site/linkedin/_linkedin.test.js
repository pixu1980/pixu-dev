// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import { loadLinkedInData } from "./_load.js";
import { isPlaceholderProfileImage, parseLinkedInProfile } from "./_parse.js";

test("LinkedIn parser extracts JSON-LD profile data and fallback skills", () => {
  const html = `<html><head><meta property="og:title" content="Emiliano Pisu | LinkedIn"><meta property="og:description" content="Hi, I build accessible frontend systems."><meta property="og:image" content="https://example.com/profile.jpg"><script type="application/ld+json">{"@type":"Person","name":"Emiliano Pisu","headline":"Frontend Engineer","description":"English summary for profile","knowsAbout":["CSS"]}</script></head><body><section aria-label="Experience"><ul><li>Senior Engineer Pixu May 2026 Skills: CSS, HTML</li></ul></section></body></html>`;
  const profile = parseLinkedInProfile(html, { name: "Emiliano Pisu", focus: ["A11y"] });

  assert.equal(profile.name, "Emiliano Pisu");
  assert.equal(profile.headline, "Hi, I build accessible frontend systems.");
  assert.equal(profile.profileImage, "https://example.com/profile.jpg");
  assert.equal(profile.skills.includes("CSS"), true);
});

test("LinkedIn loader preserves fallback data when disabled", async () => {
  const data = await loadLinkedInData(
    { enabled: false, profile: "https://linkedin.com/in/pixu1980/" },
    { name: "Pixu", focus: ["CSS"], profileImage: "fallback.jpg" },
  );

  assert.equal(data.status, "fallback");
  assert.equal(data.skills[0], "CSS");
  assert.equal(isPlaceholderProfileImage("https://static.licdn.com/aero-v1/sc/h/foo"), true);
});
