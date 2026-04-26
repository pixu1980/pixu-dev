import { existsSync } from "node:fs";
import { cp, readFile, rm, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fetchResponse } from "../_fetch.js";
import { isExternalUrl } from "../_text.js";
import { ROOT, SRC } from "../_constants.js";
import { ensureDir } from "./_ensure-dir.js";

export async function localizeProfileImage(sourceUrl, publicRoot) {
  if (!sourceUrl || !isExternalUrl(sourceUrl)) return sourceUrl || "";
  try {
    const response = await fetchResponse(sourceUrl, {
      Accept: "image/avif,image/webp,image/png,image/jpeg,*/*",
    });
    const type = response.headers.get("content-type") || "";
    const extension = type.includes("svg")
      ? ".svg"
      : type.includes("png")
        ? ".png"
        : type.includes("webp")
          ? ".webp"
          : type.includes("avif")
            ? ".avif"
            : type.includes("jpeg") || type.includes("jpg")
              ? ".jpg"
              : extname(new URL(sourceUrl).pathname) || ".jpg";
    const bytes = Buffer.from(await response.arrayBuffer());
    await ensureDir(join(publicRoot, "assets"));
    await writeFile(join(publicRoot, "assets", `profile${extension}`), bytes);
    return `assets/profile${extension}`;
  } catch {
    return sourceUrl;
  }
}

export async function copyAssets(outputRoot, publicRoot) {
  await rm(outputRoot, { recursive: true, force: true });
  await ensureDir(join(outputRoot, "styles"));
  await ensureDir(join(outputRoot, "scripts"));
  await cp(join(SRC, "styles"), join(outputRoot, "styles"), { recursive: true });
  await cp(join(SRC, "scripts"), join(outputRoot, "scripts"), { recursive: true });
  if (existsSync(join(SRC, "assets")))
    await cp(join(SRC, "assets"), join(publicRoot, "assets"), { recursive: true });
  if (existsSync(join(ROOT, "static")))
    await cp(join(ROOT, "static"), publicRoot, { recursive: true });
}

export async function readTemplate(pathname) {
  return readFile(pathname, "utf8");
}
