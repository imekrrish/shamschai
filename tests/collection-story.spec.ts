import { test, expect } from '@playwright/test';
for (const width of [375, 768, 1440]) {
  test(`story and collection align at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/our-story', '/the-collection']) {
      await page.goto(path);
      await expect(page.locator('main h1')).toHaveCount(1);
      await page.evaluate(async () => { await document.fonts.ready; for (const img of document.querySelectorAll('main img')) { img.loading = 'eager'; await img.decode().catch(() => {}); } });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), path).toBeTruthy();
      expect(await page.evaluate(() => [...document.querySelectorAll('main *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).map(e => ({tag:e.tagName, cls:e.className, width:e.getBoundingClientRect().width}))), path).toEqual([]);
    }
    await expect(page.getByRole('link', { name: 'ORDER NOW', exact: true })).toHaveCount(1);
    await page.screenshot({ path: `test-results/collection-${width}.png`, fullPage: true });
    await page.goto('/our-story');
    await page.screenshot({ path: `test-results/story-${width}.png`, fullPage: true });
  });
}
test('waitlist confirms saved signup and recovers from failures', async ({ page }) => {
  let fail = true;
  await page.route('**/api/waitlist', async route => {
    expect(route.request().postDataJSON()).toMatchObject({ email: 'chai@example.com', recipeId: 'recipe-02' });
    await route.fulfill({ status: fail ? 503 : 200, contentType: 'application/json', body: JSON.stringify({ success: !fail }) });
  });
  await page.goto('/the-collection');
  await page.getByLabel('Email address', { exact: true }).fill('chai@example.com');
  await page.getByRole('button', { name: 'Join the waitlist' }).click();
  await expect(page.getByRole('alert')).toContainText("couldn't save");
  fail = false;
  await page.getByRole('button', { name: 'Join the waitlist' }).click();
  await expect(page.locator('.recipe-waitlist-success')).toContainText("You're on the list");
});
