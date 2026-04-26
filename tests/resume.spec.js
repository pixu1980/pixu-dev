// @ts-check
import { test, expect } from "@playwright/test";

async function getBuildData(page) {
  const response = await page.request.get("/data/resume.json");
  expect(response.ok()).toBe(true);
  return response.json();
}

async function getTopLevelSections(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("main > section[data-section]")).map((section) => ({
      id: section.id,
      heading: section.querySelector("h2")?.textContent?.trim() || "",
    })),
  );
}

async function getNavTargets(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-nav-link]"))
      .map((link) => link.getAttribute("href")?.slice(1) || "")
      .filter(Boolean),
  );
}

async function getLayoutDiagnostics(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const blocks = [
      document.querySelector("[data-site-header]"),
      document.querySelector("[data-hero]"),
      ...Array.from(document.querySelectorAll("main > section[data-section]")).slice(0, 4),
      document.querySelector("[data-site-footer]"),
    ].filter(Boolean);

    return {
      overflow: root.scrollWidth - root.clientWidth,
      emptyHeadings: Array.from(document.querySelectorAll("h1, h2, h3")).filter(
        (heading) => !heading.textContent?.trim(),
      ).length,
      outOfBounds: blocks
        .map((block) => {
          const rect = block.getBoundingClientRect();
          return {
            id: block.id || block.getAttribute("data-section") || block.tagName.toLowerCase(),
            left: rect.left,
            right: rect.right,
            scrollWidth: block.scrollWidth,
            clientWidth: block.clientWidth,
          };
        })
        .filter(
          (entry) =>
            entry.left < -2 ||
            entry.right > root.clientWidth + 2 ||
            entry.scrollWidth - entry.clientWidth > 2,
        )
        .map((entry) => entry.id),
    };
  });
}

test.describe("resume page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders identity and semantic structure", async ({ page }) => {
    await expect(page).toHaveTitle(/Emiliano Pisu/);
    await expect(page.locator("h1")).toHaveText(/Emiliano Pisu/);
    await expect(page.locator("[data-role]")).toContainText(
      /Emiliano Pisu|Senior (Design|Frontend) Engineer/,
    );
    await expect(page.locator("[data-site-rail] nav")).toBeAttached();
    await expect(page.locator("main")).toBeAttached();
    await expect(page.locator("footer[data-site-footer]")).toBeAttached();
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("navigation mirrors rendered sections", async ({ page }) => {
    const sections = await getTopLevelSections(page);
    const navTargets = await getNavTargets(page);

    expect(sections.length).toBeGreaterThan(4);
    expect(navTargets).toEqual(sections.map((section) => section.id));
    expect(sections.map((section) => section.heading)).toContain("Portfolio");
    expect(sections.map((section) => section.heading)).toContain("Public Speaking");
  });

  test("about absorbs contact and LinkedIn snapshot data", async ({ page }) => {
    const data = await getBuildData(page);

    await expect(
      page.locator('main > section#about [data-generated="linkedin-profile"]'),
    ).toBeVisible();
    await expect(page.locator("main > section#contact")).toHaveCount(0);
    await expect(page.locator('main > section#about [data-panel="contact"]')).toBeVisible();
    await expect(page.locator("main > section#about [data-chip]")).toHaveCount(3);

    expect(data.linkedin.experience.length).toBeGreaterThan(5);
    expect(data.linkedin.education.length).toBeGreaterThanOrEqual(3);
    expect(data.linkedin.skills.length).toBeGreaterThanOrEqual(4);
  });

  test("build-time data file includes source payloads", async ({ page }) => {
    const data = await getBuildData(page);

    expect(data.profile.name).toBeTruthy();
    expect(data.profile.image).toBeTruthy();
    expect(data.github.repos.length).toBeGreaterThan(0);
    expect(data.sessionize.talks.length).toBeGreaterThan(0);
    expect(["live", "fallback"]).toContain(data.profile.sourceStatus.github);
    expect(["live", "fallback"]).toContain(data.profile.sourceStatus.sessionize);
    expect(["live", "fallback"]).toContain(data.profile.sourceStatus.linkedin);
  });

  test("portfolio renders GitHub public repositories and visual stats", async ({ page }) => {
    const data = await getBuildData(page);
    const expectedMinimum = data.github.status === "fallback" ? 4 : 10;

    await expect(page.locator('[data-section="projects"] [data-stat]')).toHaveCount(4);
    expect(await page.locator('[data-generated="github-repo"]').count()).toBe(
      data.github.portfolioRepos.length,
    );
    expect(data.github.portfolioRepos.every((repo) => !repo.name.startsWith("talk-"))).toBe(true);
    const renderedRepoNames = await page
      .locator('[data-generated="github-repo"] h3')
      .allTextContents();
    expect(renderedRepoNames.every((name) => !name.startsWith("talk-"))).toBe(true);
    expect(data.github.repos.length).toBeGreaterThanOrEqual(expectedMinimum);
    expect(data.github.languages.length).toBeGreaterThan(0);
  });

  test("public speaking renders Sessionize talks, events, and related repos", async ({ page }) => {
    const data = await getBuildData(page);
    const expectedMinimum = data.sessionize.status === "fallback" ? 4 : 10;

    expect(await page.locator('[data-generated="sessionize-talk"]').count()).toBe(
      data.sessionize.talks.length,
    );
    expect(data.sessionize.talks.length).toBeGreaterThanOrEqual(expectedMinimum);
    expect(await page.locator('[data-generated="sessionize-event"]').count()).toBeGreaterThan(0);
    expect(await page.locator("[data-related-repo]").count()).toBeGreaterThan(0);
    await expect(page.locator('[data-generated="sessionize-talk"]').first()).toContainText(
      "See on Sessionize",
    );
    await expect(page.locator('[data-generated="sessionize-talk"]').first()).toContainText(
      "See on GitHub",
    );
  });

  test("external links are safe and no theme vendor UI remains", async ({ page }) => {
    await expect(page.locator("[data-theme-select], #theme-select")).toHaveCount(0);
    await expect(page.locator("[data-theme-stylesheet]")).toHaveCount(0);
    await expect(page.locator("color-scheme-selector")).toHaveAttribute("role", "radiogroup");
    await expect(page.locator("accent-color-selector")).toHaveAttribute("role", "radiogroup");

    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      await expect(externalLinks.nth(index)).toHaveAttribute("rel", /noopener/);
      await expect(externalLinks.nth(index)).toHaveAttribute("rel", /noreferrer/);
    }
  });

  test("accent color selector updates the document accent pair", async ({ page }) => {
    const selector = page.locator("accent-color-selector");
    await expect(selector.locator('input[type="radio"]')).toHaveCount(5);
    await selector.locator('[data-option="lavender-mint"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-accent", "lavender-mint");
    await expect(selector.locator('[data-option="lavender-mint"] [data-swatch]')).toHaveCSS(
      "filter",
      /saturate/,
    );

    await selector.locator('[data-option="sea-glass"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-accent", "sea-glass");
  });

  test("color scheme selector updates the document scheme", async ({ page }) => {
    const selector = page.locator("color-scheme-selector");
    await expect(selector.locator('input[type="radio"]')).toHaveCount(3);
    await selector.locator('[data-option="dark"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "dark");
  });

  test("Contact link in header scrolls to contact panel", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "desktop contract - scroll behavior differs on mobile");

    await expect(page.locator("skip-link")).toBeVisible();
    await expect(page.locator("scroll-progress")).toBeAttached();
    await expect(page.locator("pointer-glow")).toBeAttached();

    const contactLink = page.locator('a[data-header-action][href="#contact"]');
    await expect(contactLink).toHaveText("Contact");

    const contactPanel = page.locator('[data-panel="contact"]');
    await expect(contactPanel).toBeAttached();

    await contactLink.click();
    await expect(contactPanel).toBeInViewport({ timeout: 10000 });
  });

  test("long live-data sections reveal while scrolling", async ({ page }) => {
    const projectsSection = page.locator('[data-section="projects"]').first();
    await expect(projectsSection).toBeAttached();
    await projectsSection.scrollIntoViewIfNeeded();
    await expect(projectsSection).toHaveAttribute("data-visible", "true");

    const speakingSection = page.locator('[data-section="talks-speaking"]').first();
    await expect(speakingSection).toBeAttached();
    await speakingSection.scrollIntoViewIfNeeded();
    await expect(speakingSection).toHaveAttribute("data-visible", "true");
    await expect(speakingSection.locator("[data-event-strip]")).toHaveAttribute("data-reveal", "");
  });

  test("desktop layout stays inside viewport and active nav follows scroll", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "desktop contract");

    const diagnostics = await getLayoutDiagnostics(page);
    expect(diagnostics.overflow).toBeLessThanOrEqual(1);
    expect(diagnostics.emptyHeadings).toBe(0);
    expect(diagnostics.outOfBounds).toEqual([]);

    await page.locator('[data-nav-link][href="#projects"]').click();
    await expect(page.locator('[data-nav-link][href="#projects"]')).toHaveAttribute(
      "aria-current",
      "",
    );
  });

  test("mobile navigation opens, closes, and keeps layout stable", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile contract");

    const toggle = page.locator("[data-nav-toggle]");
    const nav = page.locator("[data-nav]");

    await expect(toggle).toBeVisible();
    await expect(nav).not.toBeVisible();
    await toggle.click();
    await expect(nav).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(nav).not.toBeVisible();
    await expect(toggle).toBeFocused();

    const diagnostics = await getLayoutDiagnostics(page);
    expect(diagnostics.overflow).toBeLessThanOrEqual(1);
    expect(diagnostics.outOfBounds).toEqual([]);
  });
});
