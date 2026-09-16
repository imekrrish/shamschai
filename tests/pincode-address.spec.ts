import { test, expect, Page } from '@playwright/test';

const user = { id: 'pin-test', name: 'Test Buyer', email: 'test@example.com' };
const product = { id: 'recipe-01', slug: 'recipe-01', name: 'Masala Chai', variants: [{ weight: '500 g', price: 449, sku: '500', stock: true }], stock: true };
const result = (pincode = '500001', city = 'Hyderabad', state = 'Telangana') => ({ pincode, places: [{ city, state }] });

async function setup(page: Page, account = false) {
  await page.addInitScript(user => {
    localStorage.setItem('shams_user', JSON.stringify(user));
    localStorage.setItem('shams_token', 'test-token');
    localStorage.setItem('shams-cart-v2', JSON.stringify({ quantities: { '500g': 1 }, pending: null }));
  }, user);
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    const data = path.endsWith('/products') ? [product] : path.endsWith('/users/me') ? user
      : path.endsWith('/addresses') ? [] : path.endsWith('/pending-checkout') ? null : { orders: [] };
    return route.fulfill({ json: { success: true, data } });
  });
  await page.goto(account ? '/account' : '/checkout');
  if (account) {
    await page.getByRole('button', { name: /Addresses/ }).click();
    await page.getByRole('button', { name: 'Add New Address' }).click();
  }
  await expect(page.getByLabel('PIN CODE', { exact: true })).toBeVisible();
}

for (const account of [false, true]) {
  test(`PIN fills editable location in ${account ? 'address book' : 'checkout'}`, async ({ page }) => {
    await setup(page, account);
    await page.route('**/locations/pincode/*', route => route.fulfill({ json: result() }));
    await page.getByLabel('PIN CODE', { exact: true }).fill('500001');
    await expect(page.getByLabel('CITY / DISTRICT', { exact: true })).toHaveValue('Hyderabad');
    await expect(page.getByLabel('STATE', { exact: true })).toHaveValue('Telangana');
    await page.getByLabel('CITY / DISTRICT', { exact: true }).fill('Secunderabad');
    await expect(page.getByLabel('CITY / DISTRICT', { exact: true })).toHaveValue('Secunderabad');
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  });
}

test('incomplete PIN avoids lookup and unavailable lookup allows manual entry', async ({ page }) => {
  await setup(page);
  let calls = 0;
  await page.route('**/locations/pincode/*', route => { calls++; return route.fulfill({ status: 503, json: {} }); });
  await page.getByLabel('PIN CODE', { exact: true }).fill('500');
  await page.waitForTimeout(500);
  expect(calls).toBe(0);
  await page.getByLabel('PIN CODE', { exact: true }).fill('500001');
  await expect(page.locator('.address-location-status')).toContainText('unavailable');
  await page.getByLabel('CITY / DISTRICT', { exact: true }).fill('Hyderabad');
  await page.getByLabel('STATE', { exact: true }).fill('Telangana');
  await expect(page.getByLabel('STATE', { exact: true })).toHaveValue('Telangana');
});

test('late lookup does not overwrite location typed by the customer', async ({ page }) => {
  await setup(page);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/locations/pincode/*', async route => { await gate; await route.fulfill({ json: result() }); });
  const request = page.waitForRequest('**/locations/pincode/500001');
  await page.getByLabel('PIN CODE', { exact: true }).fill('500001');
  await request;
  await page.getByLabel('CITY / DISTRICT', { exact: true }).fill('My locality');
  release();
  await expect(page.getByLabel('STATE', { exact: true })).toHaveValue('Telangana');
  await expect(page.getByLabel('CITY / DISTRICT', { exact: true })).toHaveValue('My locality');
});

test('changing PIN ignores the previous request and replaces its location', async ({ page }) => {
  await setup(page);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/locations/pincode/*', async route => {
    if (route.request().url().endsWith('500001')) { await gate; await route.fulfill({ json: result() }).catch(() => {}); }
    else await route.fulfill({ json: result('110001', 'New Delhi', 'Delhi') });
  });
  const request = page.waitForRequest('**/locations/pincode/500001');
  await page.getByLabel('PIN CODE', { exact: true }).fill('500001');
  await request;
  await page.getByLabel('PIN CODE', { exact: true }).fill('110001');
  await expect(page.getByLabel('STATE', { exact: true })).toHaveValue('Delhi');
  release();
  await expect(page.getByLabel('CITY / DISTRICT', { exact: true })).toHaveValue('New Delhi');
});

test('unknown PIN explains manual fallback and multiple districts require a choice', async ({ page }) => {
  await setup(page);
  await page.route('**/locations/pincode/*', route => route.request().url().endsWith('999999')
    ? route.fulfill({ status: 404, json: {} })
    : route.fulfill({ json: { pincode: '500001', places: [{ city: 'District A', state: 'Telangana' }, { city: 'District B', state: 'Telangana' }] } }));
  await page.getByLabel('PIN CODE', { exact: true }).fill('999999');
  await expect(page.locator('.address-location-status')).toContainText('not found');
  await page.getByLabel('PIN CODE', { exact: true }).fill('500001');
  await expect(page.locator('.address-location-status')).toContainText('multiple locations');
  await expect(page.getByLabel('CITY / DISTRICT', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('STATE', { exact: true })).toHaveValue('Telangana');
});
