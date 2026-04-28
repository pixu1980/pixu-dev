import { join } from "node:path";

import { ROOT } from "../_constants.js";
import { canPrompt, promptLine } from "../_prompt.js";

async function importChromium() {
  const { chromium } = await import("@playwright/test");
  return chromium;
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

    await page.waitForLoadState("domcontentloaded", { timeout: 10000 }).catch(() => {});
    return page.content();
  } finally {
    await context.close();
  }
}
