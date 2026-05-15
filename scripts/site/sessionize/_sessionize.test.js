// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildLanguagesFromText,
  getLanguageScore,
  getSessionLanguageInfo,
  getSessionizeApiCollection,
  getSessionizeApiLanguages,
  isEnglishTalk,
} from "./_language.js";
import { parseSessionizeApiData } from "./_parse-api.js";
import {
  parseSessionizeEvents,
  parseSessionizeSpeaker,
  parseSessionizeTalks,
} from "./_parse-html.js";

test("Sessionize language helpers identify English talks and IDs", () => {
  assert.deepEqual(getSessionLanguageInfo("https://sessionize.com/s/pixu1980/title/110137"), {
    id: "110137",
    languageCode: "title-110137",
  });
  assert.deepEqual(buildLanguagesFromText("Language: English"), ["EN"]);
  assert.equal(getLanguageScore("en-us", "en"), 4);
  assert.deepEqual(getSessionizeApiLanguages({ language: "Italian" }, "en"), []);
  assert.deepEqual(getSessionizeApiCollection({ sessions: [1] }, ["sessions"]), [1]);
  assert.equal(isEnglishTalk({ languages: ["EN"] }), true);
});

test("Sessionize API parser returns speaker, talks, and events", () => {
  const data = parseSessionizeApiData(
    {
      speakers: [
        {
          fullName: "Emiliano Pisu",
          tagLine: "Frontend Engineer",
          bio: "English bio long enough for parsing.",
          categories: ["CSS"],
        },
      ],
      sessions: [
        {
          id: "1",
          title: "Classless CSS",
          description: "An English abstract about CSS architecture.",
          language: "English",
          url: "https://sessionize.com/s/x/1",
        },
      ],
      events: [{ name: "Roma JS", date: "May 2026", location: "Rome, Italy" }],
    },
    "https://sessionize.com/pixu1980/",
    { name: "Emiliano", topics: ["A11y"] },
    "en",
  );

  assert.equal(data.speaker.name, "Emiliano Pisu");
  assert.equal(data.talks[0].title, "Classless CSS");
  assert.equal(data.events[0].name, "Roma JS");
});

test("Sessionize HTML parser extracts speaker, talks, and events", () => {
  const html = `<h1>Emiliano Pisu</h1><p>Frontend Engineer</p><img alt="Emiliano Pisu" src="/me.jpg"><p>This is an English speaker summary long enough to be accepted by the parser because it has more than eighty characters.</p><h3>Topics</h3><ul><li>CSS</li></ul><h3><a href="/s/pixu1980/classless-is-more/110137">Classless CSS</a> EN</h3><p>An English abstract about classless CSS architecture and semantic HTML for frontend engineers.</p><p>Preferred session duration: 45 minutes</p><p>Technical requirements: Beginner</p><h3><a href="/event">Roma JS</a></h3><p>May 2026 Rome, Italy</p>`;

  assert.equal(parseSessionizeSpeaker(html, {}).name, "Emiliano Pisu");
  assert.equal(
    parseSessionizeTalks(html, "https://sessionize.com/pixu1980/", "en")[0].title,
    "Classless CSS",
  );
  assert.equal(parseSessionizeEvents(html, "https://sessionize.com/pixu1980/")[0].name, "Roma JS");
});
