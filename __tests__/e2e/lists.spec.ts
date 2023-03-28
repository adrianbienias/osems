import { test, expect } from "@playwright/test"
import { cleanDatabase } from "../before-each"

test.beforeEach(async () => {
  await cleanDatabase()
})

test("should navigate to lists page", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { name: /^Lists$/ })).not.toBeVisible()

  await page
    .getByRole("navigation")
    .getByRole("link", { name: /^Lists$/ })
    .click()

  await expect(page.getByRole("heading", { name: /^Lists$/ })).toBeVisible()
})

test("should navigate to page with form for adding lists", async ({ page }) => {
  await page.goto("/lists")

  await expect(
    page.getByRole("heading", { name: /^List details$/ })
  ).not.toBeVisible()
  await expect(
    page.getByRole("heading", { name: /^Confirmation template$/ })
  ).not.toBeVisible()
  await expect(
    page.getByRole("heading", { name: /^Confirmation template preview$/ })
  ).not.toBeVisible()

  await page.getByRole("link", { name: /^Add new list$/ }).click()
  await page.waitForURL("/lists/add")

  await expect(
    page.getByRole("heading", { name: /^List details$/ })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: /^Confirmation template$/ })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: /^Confirmation template preview$/ })
  ).toBeVisible()
})

test("should add a new list", async ({ page }) => {
  await page.goto("/lists/add")

  await expect(
    page.getByRole("heading", { name: /^List signup form$/ })
  ).not.toBeVisible()

  await page.getByLabel("List name").fill("Test list")
  await page.getByRole("button", { name: /^Add new list$/ }).click()
  await page.waitForURL(/\/lists\/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/)

  await expect(
    page.getByRole("heading", { name: /^List signup form$/ })
  ).toBeVisible()
})
