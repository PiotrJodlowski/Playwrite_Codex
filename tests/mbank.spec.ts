// tests/mbank.spec.ts
import { test, expect } from '@playwright/test';
const MBANK_SFI_ENDPOINT = 'https://www.mbank.pl/api/sfi/0660.json';

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

  await page.locator("//p[text()='inwestycje i oszczędności']").click();
  await page.locator("//p[text()='fundusze']").click();

  const productTileCheckButton = page.locator("//*[@data-test-id='ProductTile:Button:Check']").first();
  await expect(productTileCheckButton).toBeVisible();
  await productTileCheckButton.click();
  const promotionLabel = page.getByText('skorzystaj z promocji', { exact: false }).first();
  await expect(promotionLabel).toBeVisible();
});

test('mbank SFI 0660 endpoint returns expected top-level schema', async ({ request }) => {
  const response = await request.get(MBANK_SFI_ENDPOINT);

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');

  const body = await response.json();

  expect(body).toMatchObject({
    funId: '0660',
    currency: 'PLN',
  });

  expect(typeof body.id).toBe('string');
  expect(typeof body.shortName).toBe('string');
  expect(typeof body.longName).toBe('string');
  expect(typeof body.successFee === 'string' || body.successFee === null).toBe(true);
  expect(typeof body.firstPurchaseMinAmount).toBe('number');
  expect(typeof body.secondPurchaseMinAmount).toBe('number');
  expect(typeof body.fixedCostOfManagement).toBe('number');
  expect(typeof body.minBuyoutPrice).toBe('number');
  expect(typeof body.policy).toBe('string');
  expect(typeof body.globalLink).toBe('string');

  expect(body.kidFile).toEqual(
    expect.objectContaining({
      name: expect.any(String),
      mime: 'application/pdf',
      url: expect.stringMatching(/^https:\/\/.+/),
      publicUrl: expect.stringMatching(/^https:\/\/.+/),
    })
  );

  if (body.prospectFile) {
    expect(body.prospectFile).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        mime: 'application/pdf',
        url: expect.stringMatching(/^https:\/\/.+/),
        publicUrl: expect.stringMatching(/^https:\/\/.+/),
      })
    );
  }

  expect(body.risk).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
      scale: expect.any(Number),
    })
  );

  expect(body.perspective).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
    })
  );

  expect(body.category).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      key: expect.any(String),
      value: expect.any(String),
      color: expect.any(String),
    })
  );

  expect(body.umbrella).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
    })
  );

  expect(body.company).toEqual(
    expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
    })
  );

  if (body.company.paymentFile) {
    expect(body.company.paymentFile).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        mime: 'application/pdf',
        url: expect.stringMatching(/^https:\/\/.+/),
        publicUrl: expect.stringMatching(/^https:\/\/.+/),
      })
    );
  }
});

test('mbank SFI 0660 endpoint returns rates with consistent schema', async ({ request }) => {
  const response = await request.get(MBANK_SFI_ENDPOINT);

  expect(response.ok()).toBeTruthy();

  const body = await response.json();

  expect(Array.isArray(body.rates)).toBe(true);
  expect(body.rates.length).toBeGreaterThan(0);

  for (const rate of body.rates.slice(0, 20)) {
    expect(typeof rate.date).toBe('number');
    expect(typeof rate.id).toBe('number');
    expect(typeof rate.value).toBe('number');
    expect(rate.value).toBeGreaterThan(0);

    expect(typeof rate.yield1d).toBe('number');
    expect(typeof rate.yield1m).toBe('number');
    expect(typeof rate.yield3m).toBe('number');
    expect(typeof rate.yield6m).toBe('number');
    expect(typeof rate.yield12m).toBe('number');
    expect(typeof rate.yield3y).toBe('number');
    expect(typeof rate.yield5y).toBe('number');
    expect(typeof rate.yieldMax).toBe('number');
  }
});
