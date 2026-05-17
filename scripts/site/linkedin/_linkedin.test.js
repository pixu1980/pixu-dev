// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import { loadLinkedInData } from "./_load.js";
import { isPlaceholderProfileImage } from "./_pdf.js";

test("LinkedIn loader preserves fallback data when disabled", async () => {
  const data = await loadLinkedInData(
    { enabled: false, profile: "https://linkedin.com/in/pixu1980/" },
    { name: "Pixu", focus: ["CSS"], profileImage: "fallback.jpg" },
  );

  assert.equal(data.status, "fallback");
  assert.equal(data.skills[0], "CSS");
  assert.equal(data.profileUrl, "https://linkedin.com/in/pixu1980/");
});

test("LinkedIn loader falls back cleanly when the configured PDF is missing", async () => {
  const data = await loadLinkedInData(
    {
      enabled: true,
      pdf: "content/does-not-exist.pdf",
      profile: "https://linkedin.com/in/pixu1980/",
    },
    { name: "Pixu", focus: ["Accessibility systems"], profileImage: "fallback.jpg" },
  );

  assert.equal(data.status, "fallback");
  assert.equal(data.profileUrl, "https://linkedin.com/in/pixu1980/");
  assert.deepEqual(data.skills, ["Accessibility systems"]);
});

test("placeholder LinkedIn profile images stay filtered", () => {
  assert.equal(isPlaceholderProfileImage("https://static.licdn.com/aero-v1/sc/h/foo"), true);
  assert.equal(isPlaceholderProfileImage("https://media.licdn.com/dms/image/abc"), false);
});
