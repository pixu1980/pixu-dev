import { mkdir } from "node:fs/promises";

export async function ensureDir(pathname) {
  await mkdir(pathname, { recursive: true });
}
