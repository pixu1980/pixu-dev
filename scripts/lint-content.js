import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const roots = [
  "AGENTS.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "README.md",
  "SECURITY.md",
  "biome.json",
  "content",
  "package.json",
  "playwright.config.cjs",
  "scripts",
  "src",
  "static",
  "vite.config.js",
];

const ignoredDirectories = new Set([".git", ".tokensave", "dist", "node_modules", "output"]);
const checkedExtensions = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".svg",
  ".webmanifest",
  ".xml",
  "",
]);
const forbiddenCharacters = [
  [String.fromCharCode(0x2014), "emdash"],
  [String.fromCharCode(0x201c), "left smart quote"],
  [String.fromCharCode(0x201d), "right smart quote"],
  [String.fromCharCode(0x00ab), "left guillemet"],
  [String.fromCharCode(0x00bb), "right guillemet"],
];
const nonEnglishParserLabels = [
  ["P", "resente"].join(""),
  ["esper", "ienza"].join(""),
  ["istr", "uzione"].join(""),
  ["compet", "enze"].join(""),
  ["Req", "uisiti"].join(""),
  ["Durata", " preferita"].join(""),
];

function getExtension(pathname) {
  const name = pathname.split("/").pop() || "";
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot) : "";
}

async function collectFiles(pathname, files = []) {
  const info = await stat(pathname);

  if (info.isDirectory()) {
    const name = pathname.split("/").pop() || "";
    if (ignoredDirectories.has(name)) return files;

    const entries = await readdir(pathname);
    await Promise.all(entries.map((entry) => collectFiles(join(pathname, entry), files)));
    return files;
  }

  if (checkedExtensions.has(getExtension(pathname))) {
    files.push(pathname);
  }

  return files;
}

function getLine(text, index) {
  return text.slice(0, index).split("\n").length;
}

function checkForbiddenTypography(pathname, text, errors) {
  for (const [character, label] of forbiddenCharacters) {
    const index = text.indexOf(character);
    if (index >= 0) {
      errors.push(`${pathname}:${getLine(text, index)} contains ${label}`);
    }
  }
}

function checkEnglishOnly(pathname, text, errors) {
  if (pathname.endsWith("content/resume.md") && /^\s*-\s+IT\s*$/m.test(text)) {
    errors.push(`${pathname} contains non-English talk language fallback`);
  }

  if (
    pathname.endsWith("scripts/build.js") &&
    nonEnglishParserLabels.some((label) => text.toLowerCase().includes(label.toLowerCase()))
  ) {
    errors.push(`${pathname} contains non-English parser labels`);
  }
}

const files = (
  await Promise.all(
    roots.map((root) =>
      collectFiles(root).catch((error) => {
        if (error.code === "ENOENT") return [];
        throw error;
      }),
    ),
  )
).flat();
const errors = [];

for (const file of files) {
  const text = await readFile(file, "utf8");
  checkForbiddenTypography(file, text, errors);
  checkEnglishOnly(file, text, errors);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Content lint passed for ${files.length} files.`);
