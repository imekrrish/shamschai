import { test, expect } from '@playwright/test';

test('chai hero renders, pauses and resumes without moving page content', async ({page}) => {
  const errors: string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  const hero=page.locator('.chai-hero');await expect(hero).toHaveClass(/chai-hero--ready/);
  await page.getByRole('button',{name:'Pause chai animation',exact:true}).click();
  await page.waitForTimeout(100);const time=await hero.getAttribute('data-chai-time');
  await page.waitForTimeout(250);expect(await hero.getAttribute('data-chai-time')).toBe(time);
  await page.getByRole('button',{name:'Play chai animation',exact:true}).click();
  await expect.poll(()=>hero.getAttribute('data-chai-time')).not.toBe(time);
  await expect(page.getByRole('link',{name:'Shop the blend'})).toHaveAttribute('href','/the-collection');
  expect(errors).toEqual([]);
});

test('chai hero fits mobile and tablet viewports',async({page})=>{
  for(const width of [320,390,430,768,1024,1440]){
    await page.setViewportSize({width,height:1000});await page.goto('/');
    await expect(page.locator('.chai-hero')).toHaveClass(/chai-hero--ready/);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const box=await page.locator('.chai-hero').boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(width);
  }
});

test('reduced motion renders still and context loss reveals the poster',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await expect(page.locator('.chai-hero')).toHaveClass(/chai-hero--ready/);
  await expect(page.getByRole('button',{name:'Play chai animation',exact:true})).toBeVisible();
  await page.locator('.chai-hero canvas').evaluate(canvas=>(canvas as HTMLCanvasElement).getContext('webgl2')!.getExtension('WEBGL_lose_context')!.loseContext());
  await expect(page.locator('.chai-hero')).not.toHaveClass(/chai-hero--ready/);
  await expect(page.locator('.chai-poster')).toHaveCSS('opacity','1');
  expect(await page.locator('.chai-poster').evaluate(image=>(image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});
