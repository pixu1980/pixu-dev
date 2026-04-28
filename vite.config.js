import { cp, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { DIST, buildSite, getCliBuildOptions } from "./scripts/build.js";

const ROOT = dirname(fileURLToPath(import.meta.url));
const BUILD_OUTPUT = join(DIST, ".vite-build");
const WATCHED_ROOTS = [join(ROOT, "content"), join(ROOT, "src"), join(ROOT, "static")];
const shouldBuildSite = !process.argv.includes("preview");
const cliBuildOptions = getCliBuildOptions();
const isProductionBuild = process.argv.includes("build");

if (shouldBuildSite) {
  await buildSite({
    outDir: DIST,
    publicDir: DIST,
    interactions: isProductionBuild ? cliBuildOptions.interactions : { enabled: false },
  });
}

async function copyIfExists(source, target) {
  try {
    await mkdir(dirname(target), { recursive: true });
    await cp(source, target, { recursive: true, force: true });
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

function isWatchedFile(pathname = "") {
  return WATCHED_ROOTS.some((root) => {
    const rel = relative(root, pathname);
    return rel && !rel.startsWith("..") && !rel.startsWith(".");
  });
}

function resumeGenerator() {
  let rebuildTimer;

  async function rebuild(server) {
    await buildSite({ outDir: DIST, publicDir: DIST, interactions: { enabled: false } });
    server.ws.send({ type: "full-reload" });
  }

  return {
    name: "pixu-resume-generator",
    configureServer(server) {
      server.watcher.add(WATCHED_ROOTS);

      const schedule = (pathname) => {
        if (!isWatchedFile(pathname)) return;
        clearTimeout(rebuildTimer);
        rebuildTimer = setTimeout(() => {
          rebuild(server).catch((error) => {
            server.config.logger.error(error.stack || error.message);
          });
        }, 120);
      };

      server.watcher.on("add", schedule);
      server.watcher.on("change", schedule);
      server.watcher.on("unlink", schedule);
    },
  };
}

function finalizeDistBuild() {
  return {
    name: "pixu-finalize-dist-build",
    apply: "build",
    async closeBundle() {
      await copyIfExists(join(DIST, "data"), join(BUILD_OUTPUT, "data"));
      await copyIfExists(
        join(DIST, "assets", "profile.jpg"),
        join(BUILD_OUTPUT, "assets", "profile.jpg"),
      );
      const tempRoot = await mkdtemp(join(tmpdir(), "pixu-dist-"));
      const tempOutput = join(tempRoot, "site");
      await cp(BUILD_OUTPUT, tempOutput, { recursive: true });
      await rm(DIST, { recursive: true, force: true });
      await cp(tempOutput, DIST, { recursive: true });
      await rm(tempRoot, { recursive: true, force: true });
    },
  };
}

export default defineConfig({
  root: DIST,
  publicDir: false,
  plugins: [resumeGenerator(), finalizeDistBuild()],
  server: {
    host: "0.0.0.0",
    port: 4317,
  },
  preview: {
    host: "0.0.0.0",
    port: 4317,
  },
  build: {
    emptyOutDir: true,
    outDir: resolve(ROOT, "dist/.vite-build"),
  },
});
