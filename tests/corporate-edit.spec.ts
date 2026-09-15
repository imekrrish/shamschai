import { test, expect } from '@playwright/test';
for (const width of [375, 768, 1440]) test(`corporate and edit layouts ${width}`, async ({page}) => {
  await page.setViewportSize({width,height:900});
  for (const path of ['/corporate','/the-edit']) {
    await page.goto(path);
    await page.evaluate(async()=>{await document.fonts.ready;for(const img of document.querySelectorAll('main img')){img.loading='eager';await img.decode().catch(()=>{});}});
    await expect(page.locator('main h1')).toHaveCount(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),path).toBeTruthy();
    expect(await page.locator('main img').evaluateAll(imgs=>imgs.every(img=>(img as HTMLImageElement).naturalWidth>0))).toBeTruthy();
    await page.screenshot({path:`test-results/${path.slice(1)}-${width}.png`,fullPage:true});
  }
});
test('Edit filters show relevant stories without empty sections',async({page})=>{
  await page.goto('/the-edit');
  await expect(page.getByRole('button',{name:'THE DROP',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'THE RITUAL',exact:true}).click();
  await expect(page.locator('.journal-new-card')).toHaveCount(1);
  await expect(page.locator('.journal-new-grid')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'THE RITUAL',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'ALL STORIES'}).click();
  await expect(page.locator('.journal-new-card')).toHaveCount(7);
});
test('corporate enquiry prepares a reviewable email draft',async({page})=>{
  await page.goto('/corporate');
  await page.getByLabel('Your name').fill('Test Person');
  await page.getByLabel('Company',{exact:true}).fill('Example & Co');
  await page.getByLabel('Email address',{exact:true}).fill('test@example.com');
  await page.getByLabel('Anything else?').fill('100 gifts for Bengaluru');
  await page.getByRole('button',{name:'Prepare email enquiry'}).click();
  await expect(page.getByRole('status')).toContainText('ready to send');
  const href=await page.getByRole('link',{name:'Open email draft'}).getAttribute('href');
  expect(decodeURIComponent(href!)).toContain('Company: Example & Co');
  expect(decodeURIComponent(href!)).toContain('100 gifts for Bengaluru');
  await page.getByLabel('Company',{exact:true}).fill('Updated company');
  await expect(page.getByRole('link',{name:'Open email draft'})).toHaveCount(0);
});
