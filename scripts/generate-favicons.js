import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const STATIC = join(ROOT, "static");
const LOGO_SVG = join(ROOT, "src", "assets", "images", "logo.svg");
const LOGO_PNG = join(ROOT, "src", "assets", "images", "logo.png");

const GENERATED_FAVICON_FILES = Object.freeze([
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
  "apple-touch-icon.png",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "favicon.svg",
  "safari-pinned-tab.svg",
  "site.webmanifest",
]);

const LEGACY_FAVICON_FILES = Object.freeze([
  "android-chrome-192x192.png",
  "android-chrome-256x256.png",
  "android-chrome-512x512.png",
  "apple-touch-icon-114x114-precomposed.png",
  "apple-touch-icon-114x114.png",
  "apple-touch-icon-120x120-precomposed.png",
  "apple-touch-icon-120x120.png",
  "apple-touch-icon-144x144-precomposed.png",
  "apple-touch-icon-144x144.png",
  "apple-touch-icon-152x152-precomposed.png",
  "apple-touch-icon-152x152.png",
  "apple-touch-icon-180x180-precomposed.png",
  "apple-touch-icon-180x180.png",
  "apple-touch-icon-57x57-precomposed.png",
  "apple-touch-icon-57x57.png",
  "apple-touch-icon-60x60-precomposed.png",
  "apple-touch-icon-60x60.png",
  "apple-touch-icon-72x72-precomposed.png",
  "apple-touch-icon-72x72.png",
  "apple-touch-icon-76x76-precomposed.png",
  "apple-touch-icon-76x76.png",
  "apple-touch-icon-precomposed.png",
  "apple-touch-icon.png",
  "browserconfig.xml",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "favicon-48x48.png",
  "favicon.ico",
  "favicon.svg",
  "mstile-150x150.png",
  "safari-pinned-tab.svg",
  "site.webmanifest",
]);

const OBSOLETE_FAVICON_FILES = Object.freeze(
  LEGACY_FAVICON_FILES.filter((name) => !GENERATED_FAVICON_FILES.includes(name)),
);

const pngIcons = [
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["apple-touch-icon.png", 180],
  ["android-chrome-192x192.png", 192],
  ["android-chrome-512x512.png", 512],
];

function getLogoBody(svg) {
  return svg.replace(/^[\s\S]*?<svg[^>]*>/i, "").replace(/<\/svg>\s*$/i, "");
}

function getLogoViewBox(svg) {
  const match = svg.match(/viewBox\s*=\s*"([^"]+)"/i);
  return match?.[1] || "0 0 300 300";
}

function getThemedLogo(body) {
  return body
    .replaceAll('fill="#52e0c4"', 'class="logo-teal"')
    .replaceAll('fill="#639"', 'class="logo-purple"')
    .replaceAll('fill="#0f172a"', 'class="logo-ink"');
}

function getFlatLogo(body, fill = "#000000") {
  return body.replaceAll(/fill="[^"]+"/g, `fill="${fill}"`);
}

function getAdaptiveSvg(body, viewBox = "0 0 300 300") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  ${body}
</svg>
`;
}

function getPngSourceSvg(body, viewBox = "0 0 300 300") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  ${body}
</svg>
`;
}

function getSafariPinnedSvg(body, viewBox = "0 0 300 300") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  ${body}
</svg>
`;
}

export async function writePng(source, name, size) {
  await sharp(Buffer.from(source))
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(join(STATIC, name));
}

export async function removeObsoleteFavicons() {
  await Promise.all(OBSOLETE_FAVICON_FILES.map((name) => rm(join(STATIC, name), { force: true })));
}

export async function generateFavicons() {
  await mkdir(STATIC, { recursive: true });
  await removeObsoleteFavicons();
  const source = await readFile(LOGO_SVG, "utf8");
  const body = getLogoBody(source);
  const viewBox = getLogoViewBox(source);
  const adaptiveSvg = getAdaptiveSvg(body, viewBox);
  const pngSourceSvg = getPngSourceSvg(body, viewBox);

  await sharp(LOGO_SVG)
    .resize(300, 300, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(LOGO_PNG);

  await writeFile(join(STATIC, "favicon.svg"), adaptiveSvg, "utf8");
  await writeFile(join(STATIC, "safari-pinned-tab.svg"), getSafariPinnedSvg(body, viewBox), "utf8");

  await Promise.all(pngIcons.map(([name, size]) => writePng(pngSourceSvg, name, size)));

  await writeFile(
    join(STATIC, "site.webmanifest"),
    `${JSON.stringify(
      {
        name: "pixu.dev",
        short_name: "pixu.dev",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        theme_color: "#080a0f",
        background_color: "#f7f3e7",
        start_url: "/",
        display: "standalone",
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  await generateFavicons();
}

export {
  GENERATED_FAVICON_FILES,
  OBSOLETE_FAVICON_FILES,
  getAdaptiveSvg,
  getFlatLogo,
  getLogoBody,
  getLogoViewBox,
  getPngSourceSvg,
  getSafariPinnedSvg,
  getThemedLogo,
};
