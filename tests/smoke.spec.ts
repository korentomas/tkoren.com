import { test, expect } from "@playwright/test";

test("/ renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Tomás Korenblit",
  );
});

test("publications and contact links visible", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 2, name: "Publications" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "CV" })).toBeVisible();
  await expect(page.getByRole("link", { name: "GitHub" })).toBeVisible();
});
