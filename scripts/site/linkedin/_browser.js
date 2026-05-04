import { join } from "node:path";

import { ROOT } from "../_constants.js";
import { canPrompt, promptLine } from "../_prompt.js";

async function importChromium() {
  const { chromium } = await import("@playwright/test");
  return chromium;
}

function isClosedPage(page) {
  return typeof page?.isClosed === "function" && page.isClosed();
}

export function isPlaywrightTargetClosedError(error) {
  return /target page, context or browser has been closed/i.test(error?.message || "");
}

function getPageUrl(page) {
  try {
    return typeof page?.url === "function" ? page.url() : "";
  } catch {
    return "";
  }
}

function selectActiveProfilePage(context, config) {
  const pages = context.pages().filter((page) => !isClosedPage(page));
  const profileUrl = config?.profile || "";
  const profilePages = pages.filter((page) => {
    const url = getPageUrl(page);
    return url === profileUrl || (profileUrl && url.startsWith(profileUrl));
  });

  return profilePages.at(-1) || pages.at(-1);
}

export async function getContentFromActiveLinkedInPage(context, config) {
  let page;

  try {
    page = selectActiveProfilePage(context, config);
  } catch (error) {
    if (isPlaywrightTargetClosedError(error)) return "";
    throw error;
  }

  if (!page) return "";

  try {
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 }).catch((error) => {
      if (!isPlaywrightTargetClosedError(error)) throw error;
    });
    return await page.content();
  } catch (error) {
    if (isPlaywrightTargetClosedError(error)) return "";
    throw error;
  }
}

export async function fetchLinkedInProfileHtmlWithBrowser(config, options = {}) {
  if (!config?.profile || !canPrompt(options)) return "";

  const chromium = await importChromium();
  const profileDir = options.userDataDir || join(ROOT, ".cache", "linkedin-playwright");
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    viewport: null,
  });

  try {
    const page = context.pages()[0] || (await context.newPage());

    await page.goto(config.profile, {
      waitUntil: "domcontentloaded",
      timeout: options.timeout || 60000,
    });

    await promptLine(
      "LinkedIn browser is open. Log in, open the profile page, then press Enter here to scrape. ",
      options,
    );

    return getContentFromActiveLinkedInPage(context, config);
  } finally {
    await context.close().catch((error) => {
      if (!isPlaywrightTargetClosedError(error)) throw error;
    });
  }
}
