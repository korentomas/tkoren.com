import { test, expect } from "@playwright/test";

test.describe("Blog Post Expansion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("clicking a blog tile expands the post overlay", async ({ page }) => {
    const hero = page.locator(".tile--hero");
    await hero.click();

    // Wait for overlay to appear
    await expect(page.locator(".post-overlay")).toBeVisible();
    await expect(page.locator(".post-title")).toBeVisible();
    await expect(page.locator(".post-content")).toBeVisible();
  });

  test("expanded post shows close button", async ({ page }) => {
    const hero = page.locator(".tile--hero");
    await hero.click();

    const closeBtn = page.locator(".post-close");
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toHaveAttribute("aria-label", "Close post");
  });

  test("close button collapses the post", async ({ page }) => {
    const hero = page.locator(".tile--hero");
    await hero.click();
    await expect(page.locator(".post-overlay")).toBeVisible();

    await page.locator(".post-close").click();
    await expect(page.locator(".post-overlay")).not.toBeVisible();
  });

  test("Escape key closes expanded post", async ({ page }) => {
    await page.locator(".tile--hero").click();
    await expect(page.locator(".post-overlay")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator(".post-overlay")).not.toBeVisible();
  });

  test("URL updates when post is opened", async ({ page }) => {
    await page.locator(".tile--hero").click();
    await expect(page).toHaveURL(/\/blog\//);
  });

  test("URL returns to / when post is closed", async ({ page }) => {
    await page.locator(".tile--hero").click();
    await expect(page).toHaveURL(/\/blog\//);

    await page.locator(".post-close").click();
    // Wait for URL to update
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");
  });

  test("Enter key opens blog tile", async ({ page }) => {
    // Tab to first blog tile
    const hero = page.locator(".tile--hero");
    await hero.focus();
    await page.keyboard.press("Enter");

    await expect(page.locator(".post-overlay")).toBeVisible();
  });
});

test.describe("Direct Blog Route", () => {
  test("direct URL to blog post renders content", async ({ page }) => {
    await page.goto("/blog/hello-world");

    await expect(page.locator(".post-title")).toBeVisible();
    await expect(page.locator(".post-content")).toBeVisible();
  });

  test("has back link to homepage", async ({ page }) => {
    await page.goto("/blog/hello-world");

    const backLink = page.locator('a[href="/"]');
    await expect(backLink).toBeVisible();
  });

  test("has correct meta title", async ({ page }) => {
    await page.goto("/blog/hello-world");
    await expect(page).toHaveTitle(/Starting something new/);
  });
});
