// @ts-check
import { test, expect } from "@playwright/test";

async function getTopLevelSections(page) {
  await page.waitForLoadState("domcontentloaded");

  const sections = page.locator("main > section[data-section]");
  await expect(sections.first()).toBeAttached();

  const count = await sections.count();
  const items = [];

  for (let index = 0; index < count; index += 1) {
    const section = sections.nth(index);
    items.push({
      id: (await section.getAttribute("id")) || "",
      heading: ((await section.locator("h2").textContent()) || "").trim(),
    });
  }

  return items;
}

async function getNavTargets(page) {
  await page.waitForLoadState("domcontentloaded");

  const links = page.locator("[data-nav-link]");
  await expect(links.first()).toBeAttached();

  const count = await links.count();
  const targets = [];

  for (let index = 0; index < count; index += 1) {
    const href = await links.nth(index).getAttribute("href");
    const target = href?.slice(1) || "";
    if (target) targets.push(target);
  }

  return targets;
}

async function getLayoutDiagnostics(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const blocks = [
      document.querySelector("[data-header]"),
      document.querySelector("[data-hero]"),
      ...Array.from(document.querySelectorAll("main > section[data-section]")).slice(0, 4),
      document.querySelector("[data-footer]"),
    ].filter(Boolean);

    return {
      overflow: root.scrollWidth - root.clientWidth,
      emptyHeadings: Array.from(document.querySelectorAll("h1, h2, h3")).filter(
        (heading) => !heading.textContent?.trim(),
      ).length,
      headingsWithMargins: Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
        .filter((heading) => {
          const style = getComputedStyle(heading);
          return (
            Number.parseFloat(style.marginBlockStart) || Number.parseFloat(style.marginBlockEnd)
          );
        })
        .map((heading) => heading.textContent?.trim() || heading.tagName.toLowerCase()),
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

async function getStickyRevealOpacity(page) {
  return page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";

    const waitForFrame = () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });

    const targets = {
      about: '[data-section="about"] [data-about-story]',
      portfolio: '[data-section="portfolio"] [data-portfolio-summary]',
      speaking: '[data-section="speaking"] [data-speaking-recap]',
    };
    const opacityBySection = {};

    for (const [name, selector] of Object.entries(targets)) {
      window.scrollTo({ top: 0, behavior: "instant" });
      await waitForFrame();

      const target = document.querySelector(selector);
      if (!target) {
        opacityBySection[name] = 0;
        continue;
      }

      const stickyTop = Number.parseFloat(getComputedStyle(target).top) || 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - stickyTop;
      window.scrollTo({ top: Math.max(0, targetTop), behavior: "instant" });

      const getEffectiveOpacity = () => {
        let effectiveOpacity = 1;
        for (
          let current = target;
          current && current.nodeType === Node.ELEMENT_NODE;
          current = current.parentElement
        ) {
          effectiveOpacity *= Number(getComputedStyle(current).opacity);
        }

        return effectiveOpacity;
      };

      for (let frame = 0; frame < 30; frame += 1) {
        await waitForFrame();
        if (
          Math.abs(target.getBoundingClientRect().top - stickyTop) <= 2 &&
          getEffectiveOpacity() >= 0.97
        ) {
          break;
        }
      }

      opacityBySection[name] = getEffectiveOpacity();
    }

    return opacityBySection;
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
    await expect(page.locator("footer[data-footer]")).toBeAttached();
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("navigation mirrors rendered sections", async ({ page }) => {
    const sections = await getTopLevelSections(page);
    const navTargets = await getNavTargets(page);

    expect(sections.length).toBeGreaterThan(4);
    expect(navTargets).toEqual(["top", ...sections.map((section) => section.id)]);
    expect(sections.map((section) => section.id)).not.toContain("education");
    expect(navTargets).not.toContain("education");
    expect(sections.map((section) => section.heading)).toContain("Portfolio");
    expect(sections.map((section) => section.heading)).toContain("Public Speaking");
  });

  test("about absorbs contact and LinkedIn snapshot data", async ({ page }) => {
    await expect(
      page.locator('main > section#about [data-generated="linkedin-profile"]'),
    ).toBeVisible();
    await expect(page.locator("main > section#contact")).toHaveCount(0);
    await expect(page.locator('main > section#about [data-panel="contact"]')).toBeVisible();
    await expect(page.locator("main > section#about [data-chip]")).toHaveCount(3);
    expect(
      await page.locator("main > section#experience [data-timeline-item]").count(),
    ).toBeGreaterThan(5);
  });

  test("build no longer exposes runtime resume json", async ({ page }) => {
    const requests = [];
    page.on("request", (request) => {
      requests.push(new URL(request.url()).pathname);
    });

    await page.reload();
    expect(requests.includes("/data/resume.json")).toBe(false);

    const portrait = page.locator("[data-portrait] img");
    const src = await portrait.getAttribute("src");
    expect(src).toBeTruthy();
    expect((await page.request.get(src || "")).ok()).toBe(true);
  });

  test("portfolio renders GitHub public repositories and visual stats", async ({ page }) => {
    await expect(page.locator('[data-section="portfolio"] [data-stat]')).toHaveCount(4);
    expect(await page.locator('[data-generated="github-repo"]').count()).toBeGreaterThanOrEqual(6);
    const renderedRepoNames = await page
      .locator('[data-generated="github-repo"] h3')
      .allTextContents();
    expect(renderedRepoNames.every((name) => !name.startsWith("talk-"))).toBe(true);
    expect(
      await page.locator('[data-section="portfolio"] [data-language-row]').count(),
    ).toBeGreaterThan(0);
  });

  test("public speaking renders Sessionize talks, events, and related repos", async ({ page }) => {
    const firstTalk = page.locator('[data-generated="sessionize-talk"]').first();

    expect(await page.locator('[data-generated="sessionize-talk"]').count()).toBeGreaterThanOrEqual(
      8,
    );
    expect(await page.locator('[data-generated="sessionize-event"]').count()).toBeGreaterThan(0);
    expect(await page.locator("[data-related-repo]").count()).toBeGreaterThan(0);
    await expect(page.locator('[data-section="speaking"] [data-speaking-recap]')).toBeVisible();
    await expect(firstTalk.locator("footer [data-link]")).toHaveText([
      "Sessionize",
      "GitHub",
      "Slides",
    ]);

    const hrefs = await firstTalk
      .locator("footer [data-link]")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href") || ""));
    expect(hrefs[0]).toMatch(/^https:\/\/sessionize\.com\//);
    expect(hrefs[1]).toMatch(/^https:\/\/github\.com\/pixu1980\/talk-/);
    expect(hrefs[2]).toMatch(/^https:\/\/pixu1980\.github\.io\/talk-.*\/$/);
  });

  test("external links are safe and no theme vendor UI remains", async ({ page }) => {
    await expect(page.locator("[data-theme-select], #theme-select")).toHaveCount(0);
    await expect(page.locator("[data-theme-stylesheet]")).toHaveCount(0);
    await expect(page.locator("color-scheme-selector")).toHaveAttribute("role", "radiogroup");
    await expect(page.locator("[data-header-tools] > accent-color-selector")).toHaveCount(0);
    await expect(page.locator("[data-header-tools] > display-preferences-popover")).toHaveCount(1);

    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      await expect(externalLinks.nth(index)).toHaveAttribute("rel", /noopener/);
      await expect(externalLinks.nth(index)).toHaveAttribute("rel", /noreferrer/);
    }
  });

  test("display preferences popover updates the document accent color", async ({ page }) => {
    const popover = page.locator("[data-header-tools] > display-preferences-popover");
    const toggle = popover.locator("button");
    const panel = popover.locator('[role="dialog"]');

    await expect(popover).toBeVisible();
    await expect(toggle).toBeVisible();
    await expect(panel).toBeHidden();

    await toggle.click();
    await expect(panel).toBeVisible();
    await expect(popover.locator('input[name="radiusPreset"]')).toHaveCount(3);
    await expect(popover.locator('input[name="reduceMotion"]')).toHaveCount(1);
    await expect(popover.locator('input[name="reduceAnimations"]')).toHaveCount(1);
    await expect(popover.locator('input[name="reduceTransparency"]')).toHaveCount(1);
    await expect(popover.locator('input[name="increaseContrast"]')).toHaveCount(1);
    await expect(popover.locator('select[name="fontScale"]')).toHaveCount(1);
    await expect(popover.locator('select[name="headingFont"]')).toHaveCount(1);
    await expect(popover.locator('select[name="bodyFont"]')).toHaveCount(1);
    await expect(popover.locator('select[name="codeFont"]')).toHaveCount(1);

    const selector = popover.locator("accent-color-selector");
    await expect(selector.locator('input[type="radio"]')).toHaveCount(5);
    await selector.locator('[data-option="purple"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-accent", "purple");
    await expect(selector.locator('[data-option="purple"] [data-swatch]')).toHaveCSS(
      "background-image",
      "none",
    );

    await selector.locator('[data-option="blue"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-accent", "blue");

    await popover.locator('input[name="reduceMotion"]').check();
    await expect(page.locator("html")).toHaveAttribute("data-reduce-motion", "true");

    await popover.locator('label[for$="radius-square"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-radius-preset", "square");

    await popover.locator('select[name="fontScale"]').selectOption("110%");
    expect(await page.locator("html").evaluate((node) => node.style.fontSize)).toBe("110%");

    await page.locator("[data-mark]").click({ force: true });
    await expect(panel).toBeHidden();

    await toggle.click();
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test("color scheme selector updates the document scheme", async ({ page }) => {
    const selector = page.locator("color-scheme-selector");
    await expect(selector.locator('input[type="radio"]')).toHaveCount(3);
    await selector.locator('[data-option="dark"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-color-scheme", "dark");
  });

  test("custom elements handle skip, pointer, and scroll progress behavior", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "desktop pointer contract");

    const skipLink = page.locator("skip-link");
    const pointerGlow = page.locator("pointer-glow");
    const scrollProgress = page.locator("scroll-progress");

    await expect(skipLink).toHaveAttribute("role", "link");
    await skipLink.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();

    await page.mouse.move(120, 140);
    await expect(pointerGlow).toHaveAttribute("data-ready", "true");
    await expect(pointerGlow).toHaveCSS("--x", "120px");
    await expect(pointerGlow).toHaveCSS("--y", "140px");

    await page.evaluate(() => window.scrollTo({ top: 800, behavior: "instant" }));
    await expect(scrollProgress).toHaveAttribute("aria-hidden", "true");
    await expect(scrollProgress).toHaveCSS("width", `${page.viewportSize()?.width}px`);
    expect(
      await scrollProgress.evaluate((node) => Math.round(node.getBoundingClientRect().width)),
    ).toBe(page.viewportSize()?.width);
    expect(
      await scrollProgress.evaluate((node) => Math.round(node.getBoundingClientRect().height)),
    ).toBeGreaterThanOrEqual(4);
    const metrics = await scrollProgress.evaluate((node) => ({
      beforeHeight: Math.round(parseFloat(getComputedStyle(node, "::before").height || "0")),
      beforeWidth: Math.round(parseFloat(getComputedStyle(node, "::before").width || "0")),
      beforeTransform: getComputedStyle(node, "::before").transform,
      progressValue: Number(
        getComputedStyle(node).getPropertyValue("--scroll-progress-value") || 0,
      ),
    }));
    expect(metrics.beforeWidth).toBe(page.viewportSize()?.width);
    expect(metrics.beforeHeight).toBeGreaterThanOrEqual(4);
    const scaleX =
      Number.parseFloat(metrics.beforeTransform.match(/matrix\(([^,]+)/)?.[1] || "0") || 0;
    expect(scaleX).toBeGreaterThan(0);
    expect(scaleX).toBeLessThanOrEqual(1);
    expect(metrics.progressValue).toBeGreaterThan(0);
    expect(metrics.progressValue).toBeLessThanOrEqual(1);
  });

  test("desktop header controls share one visual height", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "desktop contract");

    await page.waitForLoadState("networkidle");
    await expect(page.locator("[data-header-tools] > *").first()).toBeAttached();

    const heights = await page
      .locator("[data-header-tools] > *")
      .evaluateAll((items) =>
        items
          .filter((item) => getComputedStyle(item).display !== "none")
          .map((item) => Math.round(item.getBoundingClientRect().height)),
      );

    expect(new Set(heights).size).toBe(1);
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
    const portfolioSection = page.locator('[data-section="portfolio"]').first();
    await expect(portfolioSection).toBeAttached();
    await portfolioSection.scrollIntoViewIfNeeded();
    await expect(portfolioSection).toHaveAttribute("data-visible", "true");

    const speakingSection = page.locator('[data-section="speaking"]').first();
    await expect(speakingSection).toBeAttached();
    await speakingSection.scrollIntoViewIfNeeded();
    await expect(speakingSection).toHaveAttribute("data-visible", "true");
    await expect(speakingSection.locator("[data-event-strip]")).toHaveAttribute("data-reveal", "");
  });

  test("public speaking lead content is readable at section entry", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "desktop contract");

    await page.locator('[data-nav-link][href="#speaking"]').click();
    await expect(page.locator('[data-nav-link][href="#speaking"]')).toHaveAttribute(
      "aria-current",
      "",
    );

    const speakerOpacity = Number(
      await page
        .locator('[data-section="speaking"] [data-speaking-recap]')
        .evaluate((node) => getComputedStyle(node).opacity),
    );
    const firstTalkOpacity = Number(
      await page
        .locator('[data-section="speaking"] [data-talk]')
        .first()
        .evaluate((node) => getComputedStyle(node).opacity),
    );

    expect(speakerOpacity).toBeGreaterThanOrEqual(0.97);
    expect(firstTalkOpacity).toBeGreaterThanOrEqual(0.99);
  });

  test("sticky reveal panels are fully readable when they pin", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "desktop contract");

    const opacity = await getStickyRevealOpacity(page);

    expect(opacity.about).toBeGreaterThanOrEqual(0.97);
    expect(opacity.portfolio).toBeGreaterThanOrEqual(0.97);
    expect(opacity.speaking).toBeGreaterThanOrEqual(0.97);
  });

  test("desktop layout stays inside viewport and active nav follows scroll", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "desktop contract");

    const diagnostics = await getLayoutDiagnostics(page);
    expect(diagnostics.overflow).toBeLessThanOrEqual(1);
    expect(diagnostics.emptyHeadings).toBe(0);
    expect(diagnostics.headingsWithMargins).toEqual([]);
    expect(diagnostics.outOfBounds).toEqual([]);

    await page.locator('[data-nav-link][href="#portfolio"]').click();
    await expect(page.locator('[data-nav-link][href="#portfolio"]')).toHaveAttribute(
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
    await expect(nav.locator('[data-nav-link][href="#top"]')).toHaveText("Home");
    await expect(nav.locator("[data-nav-link]").first()).toHaveAttribute("href", "#top");

    await page.keyboard.press("Escape");
    await expect(nav).not.toBeVisible();
    await expect(toggle).toBeFocused();

    const diagnostics = await getLayoutDiagnostics(page);
    expect(diagnostics.overflow).toBeLessThanOrEqual(1);
    expect(diagnostics.outOfBounds).toEqual([]);
  });

  test("hero signal panel uses layout gap instead of heading margins", async ({ page }) => {
    const signalPanel = page.locator("[data-signal-panel]");
    await expect(signalPanel).toBeAttached();

    const gap = await signalPanel.evaluate((node) => getComputedStyle(node).gap);
    expect(Number.parseFloat(gap)).toBeGreaterThan(0);
  });
});
