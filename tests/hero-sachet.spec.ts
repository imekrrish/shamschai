import { test, expect } from '@playwright/test';
import sharp from 'sharp';

// Software WebGL can vary edge antialiasing slightly between identical poses.
async function sameFrame(actual: Buffer, expected: Buffer) {
  const [a, b] = await Promise.all([sharp(actual).raw().toBuffer(), sharp(expected).raw().toBuffer()]);
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference += Math.abs(a[i] - b[i]);
  return difference / a.length < 0.15;
}

// Use a deterministic software GPU in headless Windows runs.
test.use({ launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } });

for (const width of [390, 1440]) {
  test(`original sachet renders and hero links remain usable at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    const hero = page.locator('.home-hero');
    const viewer = page.locator('.matte-pack');
    await expect(hero.locator('.matte-hero-image')).toHaveJSProperty('naturalWidth', 1254);
    await expect(hero.locator('canvas')).toHaveCount(0);
    await viewer.scrollIntoViewIfNeeded();
    await expect(viewer.locator('.sachet-stage')).toHaveClass(/sachet-stage--ready/, { timeout: 20000 });
    await expect(viewer.locator('svg image')).toHaveAttribute('href', '/assets/shams/products/sachet-front.png');
    await expect(viewer.locator('canvas')).toHaveCount(1);
    await page.mouse.move(width * .7, 250);
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
    await hero.screenshot({ path: `test-results/hero-${width}.png` });
    await hero.getByRole('link', { name: 'Discover the blend' }).click();
    await expect(page).toHaveURL(/the-collection/);
    expect(errors).toEqual([]);
  });
}

test('original image remains visible when WebGL cannot start', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      if (String(args[0]).includes('webgl')) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.locator('.sachet-fallback')).toBeVisible();
  await page.waitForTimeout(1000);
  await expect(page.locator('.sachet-stage')).not.toHaveClass(/sachet-stage--ready/);
  await expect(page.locator('.sachet-fallback image')).toHaveAttribute('href', '/assets/shams/products/sachet-front.png');
  await page.locator('.hero-product').screenshot({ path: 'test-results/hero-fallback.png' });
});

test('reduced motion stops rendering; context loss restores the original image', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.sachet-stage')).toHaveClass(/sachet-stage--ready/);
  const canvas = page.locator('.sachet-canvas');
  await expect(page.locator('.hero-product')).toHaveCSS('opacity', '1');
  await page.waitForTimeout(500);
  const resting = await canvas.screenshot();
  await page.mouse.move(1200, 450);
  await page.waitForTimeout(500);
  expect(await sameFrame(await canvas.screenshot(), resting)).toBeTruthy();
  const stage = page.locator('.sachet-stage');
  await stage.focus();
  for (let i = 0; i < 6; i++) await stage.press('ArrowRight');
  await page.waitForTimeout(100);
  expect(await sameFrame(await canvas.screenshot(), resting)).toBeFalsy();
  await canvas.screenshot({ path: 'test-results/hero-back.png' });
  await stage.press('Home');
  await page.waitForTimeout(100);
  expect(await sameFrame(await canvas.screenshot(), resting)).toBeTruthy();
  await page.locator('.sachet-canvas canvas').evaluate(element => {
    element.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
  });
  await expect(page.locator('.sachet-stage')).not.toHaveClass(/sachet-stage--ready/);
  await expect(page.locator('.sachet-fallback')).toHaveCSS('opacity', '1');
});

test('automatic turn can be paused and resumed', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('.sachet-stage')).toHaveClass(/sachet-stage--ready/);
  const canvas = page.locator('.sachet-canvas');
  await page.waitForTimeout(1500);
  const initial = await canvas.screenshot();
  await page.waitForTimeout(5500);
  expect(await sameFrame(await canvas.screenshot(), initial)).toBeFalsy();
  await page.getByRole('button', { name: 'Pause sachet rotation' }).click();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(2500);
  const paused = await canvas.screenshot();
  await page.waitForTimeout(500);
  expect(await sameFrame(await canvas.screenshot(), paused)).toBeTruthy();
  await page.getByRole('button', { name: 'Play sachet rotation' }).click();
  await page.waitForTimeout(1000);
  expect(await sameFrame(await canvas.screenshot(), paused)).toBeFalsy();
});
