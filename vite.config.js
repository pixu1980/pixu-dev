import { cp, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { DIST, buildSite, getCliBuildOptions } from "./scripts/build.js";

const ROOT = dirname(fileURLToPath(import.meta.url));
const BUILD_OUTPUT = join(DIST, ".vite-build");
const WATCHED_ROOTS = [join(ROOT, "content"), join(ROOT, "src"), join(ROOT, "static")];
const LOCAL_HOST = "127.0.0.1";
const shouldBuildSite = !process.argv.includes("preview");
const cliBuildOptions = getCliBuildOptions();
const isProductionBuild = process.argv.includes("build");

if (shouldBuildSite) {
  await buildSite({
    outDir: DIST,
    publicDir: DIST,
    sourcePath: cliBuildOptions.sourcePath,
    useFrontmatterFallbacksOnly: cliBuildOptions.useFrontmatterFallbacksOnly,
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

async function copyProfileAssets() {
  await Promise.all(
    [".jpg", ".png", ".webp", ".avif", ".svg"].map((extension) =>
      copyIfExists(
        join(DIST, "assets", `profile${extension}`),
        join(BUILD_OUTPUT, "assets", `profile${extension}`),
      ),
    ),
  );

  await copyIfExists(
    join(DIST, "assets", "images", "profile.png"),
    join(BUILD_OUTPUT, "assets", "images", "profile.png"),
  );
}

async function replaceDistContents(sourceDir) {
  const tempRoot = await mkdtemp(join(tmpdir(), "pixu-dist-"));
  const tempOutput = join(tempRoot, "site");

  try {
    await cp(sourceDir, tempOutput, { recursive: true });
    await rm(DIST, { recursive: true, force: true });
    await cp(tempOutput, DIST, { recursive: true });
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function buildStagedSite(options = {}) {
  const tempRoot = await mkdtemp(join(tmpdir(), "pixu-build-"));
  const stagedOutput = join(tempRoot, "site");

  try {
    await buildSite({
      outDir: stagedOutput,
      publicDir: stagedOutput,
      sourcePath: options.sourcePath,
      useFrontmatterFallbacksOnly: options.useFrontmatterFallbacksOnly,
      interactions: options.interactions,
    });

    return stagedOutput;
  } catch (error) {
    await rm(tempRoot, { recursive: true, force: true });
    throw error;
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
  let rebuildChain = Promise.resolve();

  async function rebuild(server) {
    const stagedOutput = await buildStagedSite({ interactions: { enabled: false } });

    try {
      await replaceDistContents(stagedOutput);
      server.ws.send({ type: "full-reload" });
    } finally {
      await rm(dirname(stagedOutput), { recursive: true, force: true });
    }
  }

  return {
    name: "pixu-resume-generator",
    configureServer(server) {
      server.watcher.add(WATCHED_ROOTS);

      const schedule = (pathname) => {
        if (!isWatchedFile(pathname)) return;
        clearTimeout(rebuildTimer);
        rebuildTimer = setTimeout(() => {
          rebuildChain = rebuildChain
            .then(() => rebuild(server))
            .catch((error) => {
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
      await copyProfileAssets();
      await replaceDistContents(BUILD_OUTPUT);
    },
  };
}

export default defineConfig({
  root: DIST,
  publicDir: false,
  plugins: [resumeGenerator(), finalizeDistBuild()],
  server: {
    host: LOCAL_HOST,
    port: 4317,
  },
  preview: {
    host: LOCAL_HOST,
    port: 4317,
  },
  build: {
    emptyOutDir: true,
    outDir: resolve(ROOT, "dist/.vite-build"),
    codeSplitting: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: "assets/app.js",
        assetFileNames(assetInfo) {
          return assetInfo.name?.endsWith(".css") ? "assets/app.css" : "assets/[name][extname]";
        },
      },
    },
  },
});
