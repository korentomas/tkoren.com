import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Bento Grid", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders identity tile with name and bio", async ({ page }) => {
    await expect(page.locator(".identity-name")).toHaveText("Tomas Korenblit");
    await expect(page.locator(".identity-bio")).toBeVisible();
  });

  test("renders social links with accessible labels", async ({ page }) => {
    const github = page.locator('a[aria-label="GitHub"]');
    const linkedin = page.locator('a[aria-label="LinkedIn"]');
    const email = page.locator('a[aria-label="Email"]');

    await expect(github).toBeVisible();
    await expect(linkedin).toBeVisible();
    await expect(email).toBeVisible();
  });

  test("renders blog tiles", async ({ page }) => {
    const tiles = page.locator(".tile--clickable");
    await expect(tiles).toHaveCount(5); // hero + 4 small
  });

  test("blog tiles show type, title, excerpt, and date", async ({ page }) => {
    const hero = page.locator(".tile--hero");
    await expect(hero.locator(".tile-type")).toBeVisible();
    await expect(hero.locator(".tile-title")).toBeVisible();
    await expect(hero.locator(".tile-excerpt")).toBeVisible();
    await expect(hero.locator(".tile-date")).toBeVisible();
  });

  test("tiles are keyboard navigable", async ({ page }) => {
    // Tab to first clickable tile
    await page.keyboard.press("Tab"); // GitHub link
    await page.keyboard.press("Tab"); // LinkedIn
    await page.keyboard.press("Tab"); // Email
    await page.keyboard.press("Tab"); // Hero tile
    const hero = page.locator(".tile--hero");
    await expect(hero).toBeFocused();
  });

  test("bento grid fits within viewport on desktop", async ({ page }) => {
    const bento = page.locator(".bento");
    const box = await bento.boundingBox();
    const viewport = page.viewportSize();
    if (box && viewport) {
      expect(box.height).toBeLessThanOrEqual(viewport.height);
    }
  });
});

test.describe("WCAG Accessibility", () => {
  test("homepage passes axe accessibility checks", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("blog post page passes axe accessibility checks", async ({ page }) => {
    await page.goto("/blog/hello-world");
    // Wait for MDX content to load
    await page.waitForSelector(".post-content p");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
