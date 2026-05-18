// @ts-check
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import { findLinkedInPdfPath, parseLinkedInPdfText } from "./_pdf.js";

test("LinkedIn PDF locator prefers configured file and falls back to content/profile.pdf", async () => {
  const root = await mkdtemp(join(tmpdir(), "pixu-linkedin-pdf-"));

  try {
    const contentDir = join(root, "content");
    const configured = join(contentDir, "linkedin-export.pdf");
    const fallback = join(contentDir, "profile.pdf");

    await mkdir(contentDir, { recursive: true });
    await writeFile(configured, Buffer.from("pdf"));
    await writeFile(fallback, Buffer.from("pdf"));

    assert.equal(await findLinkedInPdfPath({ pdf: configured }, { contentDir }), configured);
    assert.equal(await findLinkedInPdfPath({}, { contentDir }), fallback);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("LinkedIn PDF parser extracts summary, experience, education, and skills", () => {
  const parsed = parseLinkedInPdfText(
    `Emiliano Pisu
Senior Frontend Engineer · AI Product Engineer
Rome, Italy
Summary
Design engineer focused on accessible systems, lean frontend architecture, and mentoring teams.
Experience
Senior Frontend Engineer
Pixu Dev
May 2024 - Present
Remote
Leading design systems and frontend architecture across products.
Frontend Development Lead
MONK Software s.r.l.
Sept 2022 - Feb 2025
Rome, Italy
Led framework and design-system delivery.
Education
Sapienza Universita di Roma
Computer Science
2000 - 2005
Skills
Accessibility
Design Systems
CSS
JavaScript`,
    { name: "Fallback Name", focus: ["Frontend mentoring"] },
  );

  assert.equal(parsed.name, "Emiliano Pisu");
  assert.match(parsed.headline, /Senior Frontend Engineer/);
  assert.match(parsed.summary, /accessible systems/);
  assert.equal(parsed.experience.length, 2);
  assert.equal(parsed.experience[0]?.title, "Senior Frontend Engineer");
  assert.equal(parsed.experience[0]?.organization, "Pixu Dev");
  assert.equal(parsed.education[0]?.title, "Sapienza Universita di Roma");
  assert.deepEqual(parsed.skills.slice(0, 4), [
    "Accessibility",
    "Design Systems",
    "CSS",
    "JavaScript",
  ]);
});

test("LinkedIn PDF parser normalizes Italian labels and keeps selected sections parseable", () => {
  const parsed = parseLinkedInPdfText(
    `Top Skills
Architettura delle soluzioni
Sviluppo Web
Istruzione in aula
Experience
MONK Software
Frontend Development Lead & Mentor
September 2022 - February 2025
Roma, Lazio, Italia
Led framework and design-system delivery.
Education
I.T.I.S. Giuseppe Armellini
Perito Tecnico Industriale spec. Informatica, Informatica
1995 - 2001`,
    {},
    { profile: "https://linkedin.com/in/pixu1980/" },
  );

  assert.deepEqual(parsed.skills, [
    "Solution architecture",
    "Web development",
    "Classroom training",
  ]);
  assert.equal(parsed.experience[0]?.organization, "MONK Software");
  assert.equal(parsed.experience[0]?.location, "Rome, Latium, Italy");
  assert.equal(parsed.education[0]?.subtitle, "Industrial Technical Diploma, Computer Science");
});

test("LinkedIn PDF parser ignores false date lines and joins broken organization names", () => {
  const parsed = parseLinkedInPdfText(
    `Experience
Zucchetti Software s.r.l.
Mid Frontend Developer
2005 - 2007 (2 years)
Rome
SitePainter and Corporate Portal projects development
S.I.S.I. Informatica 2000 s.r.l. - Gruppo FIT (Federazione Italiana
Tabaccai)
Junior Full-stack Developer
2001 - 2002 (1 year)
Rome
Windows-based application developer
Education
School
2001 - 2005`,
    {},
  );

  assert.equal(parsed.experience.length, 2);
  assert.equal(parsed.experience[0]?.title, "Mid Frontend Developer");
  assert.equal(parsed.experience[1]?.organization.includes("S.I.S.I. Informatica 2000"), true);
  assert.equal(parsed.experience[1]?.organization.includes("Tabaccai)"), true);
});

test("LinkedIn PDF parser ignores lowercase summary tails before the next header", () => {
  const parsed = parseLinkedInPdfText(
    `Experience
to various devices and screen sizes
Assist Digital
Senior UI/UX Engineer & Mentor
April 2019 - September 2022
Rome
Built products.
Education
School
2001 - 2005`,
    {},
  );

  assert.equal(parsed.experience[0]?.organization, "Assist Digital");
});

test("LinkedIn PDF parser keeps organization lines ending with company abbreviations", () => {
  const parsed = parseLinkedInPdfText(
    `Experience
RealVirtual s.r.l.
Senior Frontend Engineer
September 2012 - April 2013
Anagni
Built CMS tools.
Education
School
2001 - 2005`,
    {},
  );

  assert.equal(parsed.experience[0]?.organization, "RealVirtual s.r.l.");
});

test("LinkedIn PDF parser ignores non-organization prefix lines in multi-line headers", () => {
  const parsed = parseLinkedInPdfText(
    `Experience
SitePainter and Corporate Portal projects development
Sistemi 2000 s.r.l.
Mid Frontend Developer
2005 - 2005 (less than a year)
Rome
Various projects maintenance
Education
School
2001 - 2005`,
    {},
  );

  assert.equal(parsed.experience[0]?.title, "Mid Frontend Developer");
  assert.equal(parsed.experience[0]?.organization, "Sistemi 2000 s.r.l.");
});

test("LinkedIn PDF parser preserves multiline experience summary paragraphs", () => {
  const parsed = parseLinkedInPdfText(
    `Experience
Senior Frontend Engineer
Pixu Dev
May 2024 - Present
Rome
Project: Section Framework
Client: Internal
Role: Tech Lead
Built from scratch
with vanilla technologies.
Description: Maintained delivery quality.
Education
School
2001 - 2005`,
    {},
  );

  assert.match(
    parsed.experience[0]?.summary || "",
    /Project: Section Framework\n\nClient: Internal/,
  );
  assert.match(
    parsed.experience[0]?.summary || "",
    /Built from scratch with vanilla technologies\./,
  );
  assert.match(
    parsed.experience[0]?.summary || "",
    /\n\nDescription: Maintained delivery quality\./,
  );
});
