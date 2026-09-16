import {test,expect} from '@playwright/test';

const routes=['/','/products','/products/masala-chai','/collections','/collections/family-packs','/our-story','/founder','/brew-guide','/gifting','/where-to-buy','/journal','/journal/chai-in-the-rain','/journal/every-home','/journal/unofficial-rules','/journal/ginger-or-elaichi','/contact','/faq','/search?q=masala','/checkout','/refund-policy','/not-a-page'];
for(const width of [375,390,430,768,1024,1440]){
  test(`routes, images and layout at ${width}px`,async({page})=>{
    test.setTimeout(120000);
    await page.setViewportSize({width,height:900});
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    for(const route of routes){
      await page.goto(route);
      await expect(page.locator('main h1')).toHaveCount(1);
      await page.evaluate(async()=>{for(const img of document.querySelectorAll('main img')){img.loading='eager';await img.decode().catch(()=>{})}});
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow on ${route}`).toBeTruthy();
      expect(await page.locator('main img').evaluateAll(imgs=>imgs.every(img=>(img as HTMLImageElement).naturalWidth>0)),`images on ${route}`).toBeTruthy();
      await expect(page.locator('.image-unavailable')).toHaveCount(0);
    }
    expect(errors).toEqual([]);
  });
}

test('original front and back packaging is used in the gallery',async({page})=>{
  await page.goto('/products/masala-chai');
  await expect(page.locator('.pdp-main-photo img')).toHaveAttribute('src','/assets/shams/products/sachet-front.png');
  await page.getByRole('button',{name:'Back of pack'}).click();
  await expect(page.locator('.pdp-main-photo img')).toHaveAttribute('src','/assets/shams/products/sachet-back.png');
});

test('selected size and quantity reach the WhatsApp order with customer details',async({page})=>{
  await page.goto('/products/masala-chai');
  await page.getByRole('radio',{name:'500 g',exact:true}).check();
  await page.getByRole('button',{name:'Increase quantity'}).click();
  await page.getByRole('button',{name:'Increase quantity'}).click();
  await page.getByRole('link',{name:'Order on WhatsApp',exact:true}).first().click();
  await expect(page).toHaveURL(/size=500g&quantity=3/);
  await expect(page.locator('.pack-choice').filter({hasText:'500g'}).locator('output')).toHaveText('3');
  await page.getByLabel('FULL NAME').fill('Test Customer');
  await page.getByLabel('PHONE NUMBER').fill('9000000000');
  await page.getByLabel('DELIVERY ADDRESS').fill('123 Test Road');
  await page.getByLabel('CITY',{exact:true}).fill('Hyderabad');
  await page.getByLabel('STATE',{exact:true}).fill('Telangana');
  await page.getByLabel('PIN CODE').fill('500070');
  await page.getByRole('button',{name:'CONTINUE ON WHATSAPP'}).click();
  await expect(page.getByRole('alert')).toContainText('refund policy');
  await page.getByRole('checkbox').check();
  await page.evaluate(()=>{(window as any).__opened='';window.open=((url:string)=>{(window as any).__opened=url;return null}) as typeof window.open});
  await page.getByRole('button',{name:'CONTINUE ON WHATSAPP'}).click();
  const opened=await page.evaluate(()=>(window as any).__opened);
  const url=new URL(opened);expect(url.hostname).toBe('wa.me');expect(url.pathname).toBe('/919000303897');
  const message=url.searchParams.get('text')!;
  expect(message).toContain('Product: Sham’s Masala Chai');expect(message).toContain('Size: 500g · Quantity: 3');expect(message).toContain('Name: Test Customer');expect(message).toContain('PIN code: 500070');
});

test('mobile navigation traps focus, closes with Escape and unlocks scroll',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  const trigger=page.getByRole('button',{name:'Open navigation'});
  await trigger.click();await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(()=>document.body.style.overflow)).toBe('hidden');
  for(let i=0;i<14;i++){await page.keyboard.press('Tab');expect(await page.evaluate(()=>!!document.activeElement?.closest('dialog'))).toBeTruthy()}
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();await expect(trigger).toBeFocused();
  expect(await page.evaluate(()=>document.body.style.overflow)).toBe('');
  await trigger.click();await page.getByRole('dialog').getByRole('link',{name:'Brew Guide'}).click();await expect(page).toHaveURL(/brew-guide/);await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('reduced motion stops the marquee and reveals content',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  expect(await page.locator('.marquee-track').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  await expect(page.locator('h1')).toBeVisible();
});

test('valid routes have meaningful window titles and do not show Page Not Found', async ({ page }) => {
  const routesToCheck = [
    { path: '/', expected: 'Sham’s Chai | Indian Masala Chai' },
    { path: '/the-idea', expected: 'The Idea Behind Shams | Sham’s Chai' },
    { path: '/the-collection', expected: 'The Shams Collection | Sham’s Chai' },
    { path: '/the-edit', expected: 'The Shams Edit | Sham’s Chai' },
    { path: '/corporate', expected: 'Corporate Gifting & Wholesale | Sham’s Chai' },
    { path: '/cart', expected: 'Your Cart | Sham’s Chai' },
    { path: '/products', expected: 'Shop Masala Chai | Sham’s Chai' },
    { path: '/products/recipe-01', expected: 'Recipe 01 Masala Chai — Ingredients & Packs | Sham’s Chai' },
    { path: '/recipe-feedback', expected: 'Packaging Tasting Feedback | Sham’s Chai' },
    { path: '/our-story', expected: 'Our Story | Sham’s Chai' },
  ];

  for (const { path, expected } of routesToCheck) {
    await page.goto(path);
    await expect(page).not.toHaveTitle(/Page Not Found/);
    await expect(page).toHaveTitle(expected);
  }

  // Verify that genuine 404 routes still show Page Not Found
  await page.goto('/unknown-random-route');
  await expect(page).toHaveTitle(/Page Not Found/);
});

