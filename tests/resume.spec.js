// @ts-check
import { test, expect } from "@playwright/test";

async function getTopLevelSections(page) {
  await page.waitForLoadState("domcontentloaded");

  const sections = page.locator("[data-content] > section[data-section]");
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
      ...Array.from(document.querySelectorAll("[data-content] > section[data-section]")).slice(
        0,
        4,
      ),
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

async function getResponsiveModalMetrics(locator) {
  return locator.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    const gap = Number.parseFloat(style.rowGap || style.gap || "0") || 0;
    const maxBlockSize = Number.parseFloat(style.maxBlockSize || "0") || 0;
    const minBlockSize = Number.parseFloat(style.minBlockSize || "0") || 0;
    const naturalHeight =
      (Number.parseFloat(style.paddingTop) || 0) +
      (Number.parseFloat(style.paddingBottom) || 0) +
      Array.from(node.children).reduce((sum, child) => {
        if (!(child instanceof HTMLElement)) return sum;
        if (child.matches("[data-container]")) return sum + child.scrollHeight;
        return sum + child.getBoundingClientRect().height;
      }, 0) +
      Math.max(0, node.children.length - 1) * gap;

    return {
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      expectedHeight: Math.min(naturalHeight, maxBlockSize),
      height: rect.height,
      maxBlockSize,
      minBlockSize,
      naturalHeight,
      overflowY: style.overflowY,
      scrollHeight: node.scrollHeight,
      width: rect.width,
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
          getEffectiveOpacity() >= 0.88
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
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  test("renders identity and semantic structure", async ({ page }) => {
    await expect(page).toHaveTitle(/Emiliano Pisu/);
    await expect(page.locator("#hero-title")).toHaveText(/Emiliano Pisu/);
    await expect(page.locator("[data-motto]")).toHaveCount(1);
    await expect(page.locator("[data-portrait] figcaption strong")).toHaveCount(1);
    await expect(page.locator("[data-scroll-spy] nav")).toBeAttached();
    await expect(page.locator("main")).toBeAttached();
    await expect(page.locator("footer[data-footer]")).toBeAttached();
    await expect(page.locator("#hero-title")).toHaveCount(1);
  });

  test("navigation mirrors rendered sections", async ({ page }) => {
    const sections = await getTopLevelSections(page);
    const navTargets = await getNavTargets(page);

    expect(sections.length).toBeGreaterThan(4);
    expect(navTargets).toEqual(["profile", ...sections.map((section) => section.id)]);
    expect(sections.map((section) => section.id)).not.toContain("education");
    expect(navTargets).not.toContain("education");
    expect(sections.map((section) => section.heading)).toContain("Portfolio");
    expect(sections.map((section) => section.heading)).toContain("Public Speaking");
  });

  test("about stays concise and skills owns six synthesized clusters", async ({ page }) => {
    await expect(page.locator('section#about [data-generated="linkedin-profile"]')).toHaveCount(0);
    await expect(page.locator('section#about [data-panel="principle"]')).toHaveCount(0);

    const clusters = page.locator('section#skills [data-panel="skill-cluster"]');
    await expect(clusters).toHaveCount(6);
    await expect(clusters.first().locator("h3")).toHaveText("AI Product and Engineering");
    expect(await page.locator("section#skills [data-tags] li").count()).toBeGreaterThan(5);

    const htmlContent = await page.evaluate(() => ({
      skillSummaries: Array.from(
        document.querySelectorAll('section#skills [data-panel="skill-cluster"] p'),
      ).map((node) => node.textContent?.trim() || ""),
      talkSummaries: Array.from(
        document.querySelectorAll('[data-generated="sessionize-talk"] [data-summary-text]'),
      ).map((node) => node.textContent?.trim() || ""),
    }));

    expect(
      [...htmlContent.skillSummaries, ...htmlContent.talkSummaries].some((value) =>
        /(\.\.\.|…)$/.test(value),
      ),
    ).toBe(false);

    const spacing = await page.evaluate(() => {
      const skillGrid = document.querySelector("[data-skill-grid]");
      const firstCluster = document.querySelector('[data-panel="skill-cluster"]');
      const tags = firstCluster?.querySelector("[data-tags]");

      return {
        cardGap: Number.parseFloat(getComputedStyle(firstCluster).gap || "0"),
        cardPadding: Number.parseFloat(getComputedStyle(firstCluster).paddingTop || "0"),
        gridGap: Number.parseFloat(getComputedStyle(skillGrid).gap || "0"),
        tagGap: Number.parseFloat(getComputedStyle(tags).gap || "0"),
      };
    });

    expect(spacing.gridGap).toBeGreaterThanOrEqual(12);
    expect(spacing.cardGap).toBeGreaterThanOrEqual(12);
    expect(spacing.cardPadding).toBeGreaterThanOrEqual(18);
    expect(spacing.tagGap).toBeGreaterThanOrEqual(10);
  });

  test("contact renders headline, methods, and links", async ({ page }) => {
    const contactPanel = page.locator('[data-section="contact"] [data-panel="contact"]');
    const chips = page.locator('[data-section="contact"] [data-chip-list] [data-chip]');
    const links = page.locator('[data-section="contact"] [data-chip-list] [data-link]');
    const calendar = page.locator("#my-cal-inline-15-min-coffee-chat");

    await expect(page.locator("section#contact")).toHaveCount(1);
    await expect(contactPanel).toBeVisible();

    // Contact methods (email, phone, location)
    const chipCount = await chips.count();
    expect(chipCount).toBeGreaterThanOrEqual(3);

    // Contact links (external profiles) - inside chip-list
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThanOrEqual(3);

    // Calendar widget
    await expect(calendar).toHaveCount(1);

    // Verify headline and summary text
    await expect(contactPanel).toContainText("Available for");
    await expect(contactPanel).toContainText("AI engineering");
  });

  test("teaser cards open responsive detail popovers across viewports", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("data-item-details-ready", "true");

    await expect(page.locator("[data-summary-text]").first()).toBeVisible();

    const experienceTrigger = page
      .locator('[data-item-detail-trigger][data-detail-kind="experience"]:visible')
      .first();
    const experiencePopover = page.locator('[data-item-detail="experience"]').first();

    await expect(experienceTrigger).toBeVisible();
    await expect(experiencePopover).toHaveAttribute("popover", "auto");
    await expect(experiencePopover).toBeHidden();

    await experienceTrigger.click();
    await expect(experiencePopover).toBeVisible();

    const experiencePopoverBox = await getResponsiveModalMetrics(experiencePopover);
    const viewport = page.viewportSize();

    expect(experiencePopoverBox.maxBlockSize).toBeLessThanOrEqual(
      (viewport?.height || 0) * 0.8 + 1,
    );
    expect(experiencePopoverBox.minBlockSize).toBe(0);
    expect(experiencePopoverBox.height).toBeLessThanOrEqual((viewport?.height || 0) * 0.8 + 1);
    expect(
      Math.abs(experiencePopoverBox.height - experiencePopoverBox.expectedHeight),
    ).toBeLessThanOrEqual(16);
    expect(Math.abs(experiencePopoverBox.centerX - (viewport?.width || 0) / 2)).toBeLessThan(12);
    expect(Math.abs(experiencePopoverBox.centerY - (viewport?.height || 0) / 2)).toBeLessThan(12);

    await page.keyboard.press("Escape");
    await expect(experiencePopover).toBeHidden();
    await expect(experienceTrigger).toBeFocused();

    await experienceTrigger.click();
    await expect(experiencePopover).toBeVisible();

    const experienceBackdropPoint = await experiencePopover.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        x: Math.max(8, Math.floor(rect.left / 2)),
        y: Math.max(8, Math.floor(rect.top / 2)),
      };
    });

    await page.mouse.click(experienceBackdropPoint.x, experienceBackdropPoint.y);
    await expect(experiencePopover).toBeHidden();

    await experienceTrigger.click();
    await expect(experiencePopover).toBeVisible();

    await experiencePopover.locator("[data-popover-close]").click();
    await expect(experienceTrigger).toBeFocused();

    const firstTalk = page.locator('[data-generated="sessionize-talk"]').first();
    await expect(firstTalk.locator("[data-summary-text]")).toHaveCount(1);
    await expect(firstTalk.locator("[data-summary-text]")).toBeVisible();
    await expect(firstTalk.locator('[data-item-detail="talk"]')).toHaveCount(0);
    await expect(
      firstTalk.locator('[data-item-detail-trigger][data-detail-kind="talk"]'),
    ).toHaveCount(0);
    await expect(firstTalk.locator("[data-talk-actions] [data-link]")).toHaveCount(3);

    const firstEvent = page.locator('[data-generated="sessionize-event"]').first();
    await expect(
      firstEvent.locator('[data-item-detail-trigger][data-detail-kind="event"]'),
    ).toHaveCount(0);
    await expect(firstEvent.locator('[data-item-detail="event"]')).toHaveCount(0);
    await expect(firstEvent.locator("[data-event-detail]")).toBeVisible();
  });

  test("experience keeps full-width summary and extended modal detail", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("data-item-details-ready", "true");

    const firstExperience = page.locator("[data-timeline-item]").first();
    const summary = firstExperience.locator('[data-timeline-item-summary="experience"]');
    const detail = firstExperience.locator('[data-timeline-item-detail="experience"]');
    const trigger = firstExperience
      .locator('[data-item-detail-trigger][data-detail-kind="experience"]:visible')
      .first();

    await expect(summary).toBeVisible();
    await expect(summary.locator("h3")).toBeVisible();
    await expect(detail).toHaveAttribute("popover", "auto");
    await expect(detail).toBeHidden();
    await expect(trigger).toBeVisible();

    const experienceLayout = await firstExperience.evaluate((node) => {
      const summary = node.querySelector('[data-timeline-item-summary="experience"]');
      const nodeRect = node.getBoundingClientRect();
      const summaryRect = summary?.getBoundingClientRect();

      return {
        itemWidth: nodeRect.width,
        summaryWidth: summaryRect?.width || 0,
      };
    });

    expect(experienceLayout.summaryWidth).toBeGreaterThan(experienceLayout.itemWidth * 0.55);

    await trigger.click();
    await expect(detail).toBeVisible();
    await expect(detail.locator("[data-popover-header]")).toBeVisible();
    const detailContainer = detail.locator("[data-container]");
    await expect(detailContainer).toBeVisible();
    const detailScrollMetrics = await detailContainer.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        overflowY: style.overflowY,
        scrollHeight: node.scrollHeight,
      };
    });
    expect(detailScrollMetrics.overflowY).toBe("auto");
    expect(detailScrollMetrics.scrollHeight).toBeGreaterThan(0);
    expect(await detail.locator("p").count()).toBeGreaterThan(1);
  });

  test("mobile popover controls stay compact and timeline cards drop separators", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "mobile contract");

    const metrics = await page.evaluate(() => {
      const firstTimeline = document.querySelector("[data-timeline-item]");
      const triggerNodes = Array.from(document.querySelectorAll("[data-item-detail-trigger]"));

      return {
        timelineBorderBottomWidth: Number.parseFloat(
          getComputedStyle(firstTimeline).borderBottomWidth || "0",
        ),
        triggerMetrics: triggerNodes.map((node) => {
          const rect = node.getBoundingClientRect();
          const parentRect = node.parentElement?.getBoundingClientRect();

          return {
            parentWidth: parentRect?.width || 0,
            width: rect.width,
          };
        }),
      };
    });

    expect(metrics.timelineBorderBottomWidth).toBeLessThanOrEqual(1);

    for (const trigger of metrics.triggerMetrics) {
      expect(trigger.width).toBeLessThan(trigger.parentWidth - 16);
    }

    const experienceTrigger = page
      .locator('[data-item-detail-trigger][data-detail-kind="experience"]')
      .first();
    const experiencePopover = page.locator('[data-item-detail="experience"]').first();
    const closeButton = experiencePopover.locator("[data-popover-close]");

    await experienceTrigger.click();
    await expect(experiencePopover).toBeVisible();
    await expect(closeButton).toHaveText("X");

    const closeMetrics = await page.evaluate(() => {
      const header = document.querySelector(
        '[data-item-detail="experience"] [data-popover-header]',
      );
      const close = document.querySelector('[data-item-detail="experience"] [data-popover-close]');
      const headerRect = header?.getBoundingClientRect();
      const closeRect = close?.getBoundingClientRect();

      return {
        rightGap: headerRect && closeRect ? Math.abs(headerRect.right - closeRect.right) : 999,
        topGap: headerRect && closeRect ? Math.abs(closeRect.top - headerRect.top) : 999,
      };
    });

    expect(closeMetrics.rightGap).toBeLessThanOrEqual(20);
    expect(closeMetrics.topGap).toBeLessThanOrEqual(20);

    await closeButton.click();
    await expect(experiencePopover).toBeHidden();

    const displayPreferences = page.locator("[data-header-tools] > display-preferences-popover");
    const displayPreferencesToggle = displayPreferences.locator("[data-toggle]");
    const displayPreferencesPanel = displayPreferences.locator("[data-panel]");

    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });

    await displayPreferencesToggle.click({ force: true });
    await expect(displayPreferencesPanel).toBeVisible();

    const displayClose = displayPreferencesPanel.locator("[data-panel-close]");
    await expect(displayClose).toHaveCount(1);
    await expect(displayClose).toHaveText("X");

    const sharedCloseMetrics = await page.evaluate(() => {
      const experienceClose = document.querySelector(
        '[data-item-detail="experience"] [data-popover-close]',
      );
      const displayCloseNode = document.querySelector(
        "display-preferences-popover [data-panel] [data-panel-close]",
      );

      if (!(experienceClose instanceof HTMLElement) || !(displayCloseNode instanceof HTMLElement)) {
        return null;
      }

      const experienceStyle = getComputedStyle(experienceClose);
      const displayStyle = getComputedStyle(displayCloseNode);

      return {
        experienceBorderRadius: experienceStyle.borderRadius,
        experienceHeight: experienceStyle.height,
        experienceWidth: experienceStyle.width,
        displayBorderRadius: displayStyle.borderRadius,
        displayHeight: displayStyle.height,
        displayWidth: displayStyle.width,
      };
    });

    expect(sharedCloseMetrics).not.toBeNull();
    expect(sharedCloseMetrics?.displayWidth).toBe(sharedCloseMetrics?.experienceWidth);
    expect(sharedCloseMetrics?.displayHeight).toBe(sharedCloseMetrics?.experienceHeight);
    expect(sharedCloseMetrics?.displayBorderRadius).toBe(
      sharedCloseMetrics?.experienceBorderRadius,
    );
  });

  test("build no longer exposes runtime resume json", async ({ page }) => {
    const requests = [];
    page.on("request", (request) => {
      requests.push(new URL(request.url()).pathname);
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });
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
    const talkSummary = firstTalk.locator("[data-summary-text]");
    const talkLinks = firstTalk.locator("[data-talk-actions] [data-link]");
    const firstEvent = page.locator('[data-generated="sessionize-event"]').first();

    expect(await page.locator('[data-generated="sessionize-talk"]').count()).toBeGreaterThanOrEqual(
      8,
    );
    expect(await page.locator('[data-generated="sessionize-event"]').count()).toBeGreaterThan(0);
    expect(await page.locator("[data-related-repo]").count()).toBeGreaterThan(0);
    await expect(page.locator('[data-section="speaking"] [data-speaking-recap]')).toBeVisible();
    await expect(talkSummary).toHaveCount(1);
    await expect(talkSummary).toBeVisible();
    await expect(firstTalk.locator("[data-talk-actions]")).toHaveCount(1);
    await expect(firstEvent.locator("[data-event-detail]")).toHaveCount(1);
    await expect(firstEvent.locator('[data-item-detail="event"]')).toHaveCount(0);
    await expect(talkLinks).toHaveText(["Sessionize", "GitHub", "Slides"]);

    const hrefs = await talkLinks.evaluateAll((links) =>
      links.map((link) => link.getAttribute("href") || ""),
    );
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

    const relValues = await page.evaluate(() => {
      const links = Array.from(
        document.querySelectorAll(
          ':is([data-content], [data-footer], [data-header]) a[target="_blank"]',
        ),
      );
      return links.map((link) => ({
        href: link.getAttribute("href") || "",
        rel: (link.getAttribute("rel") || "").toLowerCase(),
      }));
    });

    expect(relValues.length).toBeGreaterThan(0);
    for (const link of relValues) {
      expect(link.rel).toContain("noopener");
      expect(link.rel).toContain("noreferrer");
    }
  });

  test("display preferences popover updates the document accent color", async ({
    page,
    isMobile,
  }) => {
    const popover = page.locator("[data-header-tools] > display-preferences-popover");
    const toggle = popover.locator("[data-toggle]");
    const panel = popover.locator("[data-panel]");

    await expect(popover).toBeVisible();
    await expect(toggle).toBeVisible();
    await expect(panel).toBeHidden();

    await toggle.click({ force: true });
    await expect(panel).toBeVisible();
    if (isMobile) {
      await expect(panel.locator("[data-panel-close]")).toHaveCount(1);
      await expect(panel.locator("[data-panel-close]")).toBeVisible();
    } else {
      await expect(panel.locator("[data-panel-close]")).toBeHidden();
    }
    await expect(popover.locator('input[name="radiusPreset"]')).toHaveCount(3);
    await expect(popover.locator('input[name="reduceMotion"]')).toHaveCount(1);
    await expect(popover.locator('input[name="reduceAnimations"]')).toHaveCount(0);
    await expect(popover.locator('input[name="reduceTransparency"]')).toHaveCount(1);
    await expect(popover.locator('input[name="increaseContrast"]')).toHaveCount(1);
    await expect(popover.locator('select[name="fontScale"]')).toHaveCount(1);
    await expect(popover.locator('select[name="headingFont"]')).toHaveCount(1);
    await expect(popover.locator('select[name="bodyFont"]')).toHaveCount(1);
    await expect(popover.locator('select[name="codeFont"]')).toHaveCount(1);

    const selector = popover.locator("accent-color-selector");
    await expect(selector.locator('input[type="radio"]')).toHaveCount(5);

    const selectorMetrics = await page.evaluate(() => {
      const panelNode = document.querySelector("display-preferences-popover [data-panel]");
      const selectorNode = document.querySelector(
        "display-preferences-popover accent-color-selector",
      );
      const selectorParentNode = selectorNode?.parentElement || null;
      const swatchNode = document.querySelector(
        'display-preferences-popover accent-color-selector [data-option="purple"] [data-swatch]',
      );
      const titleNode = document.querySelector("display-preferences-popover [data-group-title] h3");
      const checklistNode = document.querySelector("display-preferences-popover [data-checklist]");
      const selectorParentStyle = selectorParentNode ? getComputedStyle(selectorParentNode) : null;
      const selectorParentContentWidth = selectorParentNode
        ? selectorParentNode.clientWidth -
          Number.parseFloat(selectorParentStyle?.paddingLeft || "0") -
          Number.parseFloat(selectorParentStyle?.paddingRight || "0")
        : 0;

      return {
        groupTitleSize: Number.parseFloat(getComputedStyle(titleNode).fontSize || "0"),
        panelWidth: panelNode?.getBoundingClientRect().width || 0,
        selectorParentContentWidth,
        selectorWidth: selectorNode?.getBoundingClientRect().width || 0,
        swatchSize: swatchNode?.getBoundingClientRect().width || 0,
        checklistGap: Number.parseFloat(getComputedStyle(checklistNode).gap || "0"),
      };
    });

    expect(selectorMetrics.selectorWidth).toBeGreaterThanOrEqual(
      selectorMetrics.selectorParentContentWidth - 2,
    );
    expect(selectorMetrics.swatchSize).toBeGreaterThanOrEqual(34);
    expect(selectorMetrics.groupTitleSize).toBeGreaterThanOrEqual(21);
    expect(selectorMetrics.checklistGap).toBeGreaterThanOrEqual(13);

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

    if (!isMobile) {
      await page.locator("[data-mark]").click({ force: true });
      await expect(panel).toBeHidden();

      await toggle.click({ force: true });
      await expect(panel).toBeVisible();
    }

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();

    await toggle.click({ force: true });
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test("display preferences uses native popover and mobile full-screen layout", async ({
    page,
    isMobile,
  }) => {
    const popover = page.locator("[data-header-tools] > display-preferences-popover");
    const toggle = popover.locator("[data-toggle]");
    const panel = popover.locator("[data-panel]");

    await toggle.click();
    await expect(panel).toHaveAttribute("popover", "auto");
    await expect(panel).toBeVisible();
    if (isMobile) {
      await expect(panel.locator("[data-panel-close]")).toHaveCount(1);
      await expect(panel.locator("[data-panel-close]")).toBeVisible();
    } else {
      await expect(panel.locator("[data-panel-close]")).toBeHidden();
    }

    const panelBox = await panel.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        height: rect.height,
        position: getComputedStyle(node).position,
        width: rect.width,
      };
    });

    if (isMobile) {
      expect(Math.round(panelBox.width || 0)).toBe(page.viewportSize()?.width);
      expect(Math.round(panelBox.height || 0)).toBeGreaterThanOrEqual(
        (page.viewportSize()?.height || 0) - 4,
      );
    } else {
      expect(panelBox.position).toBe("fixed");
      expect(Math.round(panelBox.width || 0)).toBeLessThan(page.viewportSize()?.width || 0);
    }

    await page.keyboard.press("Escape");
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

  test("long live-data sections reveal while scrolling", async ({ page }) => {
    const portfolioSection = page.locator('[data-section="portfolio"]').first();
    await expect(portfolioSection).toBeAttached();
    await portfolioSection.scrollIntoViewIfNeeded();
    await expect(portfolioSection).toHaveAttribute("data-visible", "true");

    const speakingSection = page.locator('[data-section="speaking"]').first();
    await expect(speakingSection).toBeAttached();
    await speakingSection.scrollIntoViewIfNeeded();
    await expect(speakingSection).toHaveAttribute("data-visible", "true");
    await expect(speakingSection.locator("[data-speaking-recap]")).toBeVisible();
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

    expect(opacity.about).toBeGreaterThanOrEqual(0.88);
    expect(opacity.portfolio).toBeGreaterThanOrEqual(0.88);
    expect(opacity.speaking).toBeGreaterThanOrEqual(0.88);
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
    await expect(nav.locator('[data-nav-link][href="#profile"]')).toHaveText("Profile");
    await expect(nav.locator("[data-nav-link]").first()).toHaveAttribute("href", "#profile");

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
