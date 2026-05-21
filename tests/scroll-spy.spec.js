// @ts-check
import { test, expect } from "@playwright/test";

test.describe("scroll-spy", () => {
  test("nav click keeps aria-current in sync during smooth scroll", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "desktop only");

    await page.goto("/", { waitUntil: "domcontentloaded" });

    const portfolioLink = page.locator('[data-nav-link][href="#portfolio"]');
    await portfolioLink.click();

    await expect(portfolioLink).toHaveAttribute("aria-current", "", { timeout: 5000 });
  });

  test("nav link aria-current updates after scroll to section", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "desktop only");

    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Scroll to portfolio using browser's scrollIntoViewIfNeeded (more reliable)
    const portfolioSection = page.locator("[data-content] > section#portfolio");
    await portfolioSection.scrollIntoViewIfNeeded();

    // Wait for IntersectionObserver to trigger
    await page.waitForTimeout(500);

    // Verify aria-current is set
    const portfolioLink = page.locator('[data-nav-link][href="#portfolio"]');
    await expect(portfolioLink).toHaveAttribute("aria-current", "");

    // Verify other links don't have aria-current
    const otherLinks = page.locator('[data-nav-link]:not([href="#portfolio"])');
    const count = await otherLinks.count();
    for (let i = 0; i < count; i++) {
      const link = otherLinks.nth(i);
      await expect(link).not.toHaveAttribute("aria-current");
    }
  });

  test("nav link aria-current updates when scrolling to different section", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "desktop only");

    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Scroll to portfolio
    const portfolioSection = page.locator("[data-content] > section#portfolio");
    await portfolioSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const portfolioLink = page.locator('[data-nav-link][href="#portfolio"]');
    await expect(portfolioLink).toHaveAttribute("aria-current", "");

    // Now scroll to speaking
    const speakingSection = page.locator("[data-content] > section#speaking");
    await speakingSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const speakingLink = page.locator('[data-nav-link][href="#speaking"]');
    await expect(speakingLink).toHaveAttribute("aria-current", "");

    // Portfolio link should no longer have aria-current
    await expect(portfolioLink).not.toHaveAttribute("aria-current");
  });
});
