// tests/mbank.spec.ts
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://www.mbank.pl/indywidualny/');
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/kredyty, lokaty, konta bankowe, karty, ubezpieczenia online | mBank.pl/);
});

test('navigates to fundusze from inwestycje i oszczędności', async ({ page }) => {
  await page.goto('https://www.mbank.pl/indywidualny/');

  await page.locator("//p[text()='inwestycje i oszczędności']").click();
  await page.locator("//p[text()='fundusze']").click();

  await expect(page).toHaveURL(/fundusze/i);
});

test('opens product details from product tile', async ({ page }) => {
  await page.goto('https://www.mbank.pl/indywidualny/');

  const productTileCheckButton = page.locator("//*[@data-test-id='ProductTile:Button:Check']");
  await expect(productTileCheckButton).toBeVisible();
  await productTileCheckButton.click();
});
