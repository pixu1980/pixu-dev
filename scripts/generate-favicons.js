import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const STATIC = join(ROOT, "static");
const LOGO_SVG = join(ROOT, "src", "assets", "images", "logo.svg");
const LOGO_PNG = join(ROOT, "src", "assets", "images", "logo.png");

const pngIcons = [
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["favicon-48x48.png", 48],
  ["apple-touch-icon.png", 180],
  ["apple-touch-icon-180x180.png", 180],
  ["android-chrome-192x192.png", 192],
  ["android-chrome-256x256.png", 256],
  ["android-chrome-512x512.png", 512],
  ["mstile-150x150.png", 150],
];

function getLogoBody(svg) {
  return svg.replace(/^[\s\S]*?<svg[^>]*>/i, "").replace(/<\/svg>\s*$/i, "");
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

function getAdaptiveSvg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <style>
    .icon-bg { fill: #f7f3e7; }
    .logo-teal { fill: #248f84; }
    .logo-purple { fill: #663399; }
    .logo-ink { fill: #0f172a; }
    @media (prefers-color-scheme: dark) {
      .icon-bg { fill: #080a0f; }
      .logo-teal { fill: #52e0c4; }
      .logo-purple { fill: #b9a7ff; }
      .logo-ink { fill: #f7f3e7; }
    }
  </style>
  <rect class="icon-bg" width="300" height="300" rx="54" />
  ${getThemedLogo(body)}
</svg>
`;
}

function getPngSourceSvg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <rect width="300" height="300" rx="54" fill="#f7f3e7" />
  ${body}
</svg>
`;
}

function getSafariPinnedSvg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  ${getFlatLogo(body)}
</svg>
`;
}

async function writePng(source, name, size) {
  await sharp(Buffer.from(source))
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(join(STATIC, name));
}

async function main() {
  await mkdir(STATIC, { recursive: true });
  const source = await readFile(LOGO_SVG, "utf8");
  const body = getLogoBody(source);
  const adaptiveSvg = getAdaptiveSvg(body);
  const pngSourceSvg = getPngSourceSvg(body);

  await sharp(LOGO_SVG)
    .resize(300, 300, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(LOGO_PNG);

  await writeFile(join(STATIC, "favicon.svg"), adaptiveSvg, "utf8");
  await writeFile(join(STATIC, "safari-pinned-tab.svg"), getSafariPinnedSvg(body), "utf8");

  await Promise.all(pngIcons.map(([name, size]) => writePng(pngSourceSvg, name, size)));

  await writeFile(
    join(STATIC, "browserconfig.xml"),
    `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/mstile-150x150.png" />
      <TileColor>#080a0f</TileColor>
    </tile>
  </msapplication>
</browserconfig>
`,
    "utf8",
  );

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

await main();
