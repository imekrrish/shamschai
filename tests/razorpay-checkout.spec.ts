import { test, expect, Page } from '@playwright/test';

const user = { id: 'buyer-test', name: 'Test Buyer', email: 'buyer@example.com' };
const address = { id: 'address-test', recipientName: 'Test Buyer', phone: '9999999999', streetAddress: 'Test Street', city: 'Hyderabad', state: 'Telangana', postalCode: '500001', country: 'India', isDefault: true };
const initialOrder = { id: '4bc26947-22a2-42ce-abcd-0b1088b24f84', orderNumber: 'ORD-TEST', status: 'PENDING', paymentStatus: 'PENDING', paymentMethod: 'RAZORPAY', subtotal: 450, shippingFee: 50, totalAmount: 500, currency: 'INR', createdAt: new Date().toISOString(), shippingSnapshot: address, items: [{ title: "Sham's Masala Chai", size: '500g', quantity: 1, unitPrice: 450, subtotal: 450 }] };

// The storefront reads its catalogue from the API, so the fixture serves it.
const catalogProduct = {
  id: 'recipe-01', slug: 'recipe-01', name: "Sham's Masala Chai", recipeNumber: 'RECIPE 01', code: '001',
  variantNameSlot: 'Masala Chai', personality: '', cup: '', mood: '', moment: '', whyThisRecipe: '',
  subtitle: 'It\u2019s a modern woman\u2019s recipe',
  description: 'Aromatic black tea leaves blended with handpicked spices for a bold, warming cup of masala chai.',
  category: 'The Collection', images: ['/assets/shams/products/product-lifestyle-v2.png'],
  variants: [{ weight: '500 g', price: 450, sku: 'SH-RECIPE-01-500', stock: true }, { weight: '1 kg', price: 850, sku: 'SH-RECIPE-01-1000', stock: true }],
  flavourNotes: ['BLACK TEA', 'CARDAMOM', 'BLACK PEPPER'],
  ingredients: ['Black Tea Leaves', 'Clove', 'Cinnamon', 'Cardamom', 'Nutmeg', 'Black Pepper'],
  brewInstructions: ['Boil 150 ml water.', 'Add 1 tsp Masala Chai.', 'Add sugar to taste.', 'Add milk as desired.', 'Simmer 3\u20135 minutes.', 'Strain & enjoy hot.'],
  profile: { tea: '', masala: '', aroma: '', body: '', finish: '' },
  chartScores: { teaStrength: 0, masala: 0, aroma: 0, body: 0, finish: 0 },
  stock: true, featured: true,
};

async function setup(page: Page, mode: 'paid' | 'dismiss' | 'unverified' | 'offline', seedCart = true) {
  let order = { ...initialOrder };
  const requestIds: string[] = [];
  await page.addInitScript(({ user, mode, seedCart }) => {
    localStorage.setItem('shams_user', JSON.stringify(user));
    localStorage.setItem('shams_token', 'test-token');
    if (seedCart) localStorage.setItem('shams-cart-v2', JSON.stringify({ quantities: { '500g': 1, '1000g': 0 }, pending: null }));
    (window as any).__rzpEvents = [];
    (window as any).Razorpay = class {
      constructor(public options: any) {}
      open() {
        if (mode === 'dismiss') this.options.modal.ondismiss();
        else this.options.handler({ razorpay_order_id: 'order_Test', razorpay_payment_id: 'pay_Test', razorpay_signature: 'a'.repeat(64) });
      }
      // Razorpay reaches ondismiss on a programmatic close as well, so the
      // fixture does too: closing on success must not read as an abandonment.
      close() {
        (window as any).__rzpEvents.push('close');
        this.options.modal.ondismiss();
      }
    };
  }, { user, mode, seedCart });
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    const ok = (data: unknown) => route.fulfill({ json: { success: true, data } });
    if (path === '/api/products') return ok([catalogProduct]);
    if (path.startsWith('/api/products/')) return ok(catalogProduct);
    if (path.endsWith('/users/me')) return ok(user);
    if (path.endsWith('/addresses')) return ok([address]);
    if (path === '/api/orders/pending-checkout') return ok(null);
    if (path === '/api/orders' && route.request().method() === 'POST') {
      requestIds.push(route.request().postDataJSON().requestId);
      if (mode === 'offline') return route.fulfill({ status: 503, json: { success: false, message: 'Backend unavailable' } });
      return ok({ order, paymentIntent: { keyId: 'rzp_test_fixture', razorpayOrderId: 'order_Test', amount: 39900, currency: 'INR' } });
    }
    if (path.endsWith('/payments/verify')) {
      if (mode === 'unverified') return route.fulfill({ status: 503, json: { success: false, message: 'Verification unavailable' } });
      order = { ...order, status: 'CONFIRMED', paymentStatus: 'PAID' };
      return ok({ paymentStatus: 'PAID', orderStatus: 'CONFIRMED' });
    }
    if (path.includes('/payments/order/')) return ok({ paymentStatus: order.paymentStatus });
    if (path === '/api/orders') return ok({ orders: [order] });
    if (path.includes('/api/orders/')) return ok(order);
    return route.fulfill({ status: 404, json: { success: false } });
  });
  return requestIds;
}

async function submit(page: Page) {
  await page.getByRole('button', { name: 'MAKE THIS CUP YOURS' }).click();
  await page.getByRole('button', { name: /CONFIRM ADDRESS & PAY/ }).click();
}

test('successful checkout waits for server verification and shows paid order', async ({ page }) => {
  const ids = await setup(page, 'paid');
  await page.goto('/checkout');
  await submit(page);
  await expect(page).toHaveURL(/order-confirmation\/ORD-TEST/);
  await expect(page.getByText('PAYMENT CONFIRMED', { exact: true })).toBeVisible();
  expect(ids).toHaveLength(1);
});

test('the payment window closes before verification and the wait happens on our own screen', async ({ page }) => {
  await setup(page, 'paid');
  // Hold verification open so the gap between "paid" and "confirmed" is observable.
  await page.route('**/payments/verify', async route => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await route.fulfill({ json: { success: true, data: { paymentStatus: 'PAID', orderStatus: 'CONFIRMED' } } });
  });
  await page.goto('/checkout');
  await submit(page);
  await expect(page.locator('.payment-confirming')).toBeVisible();
  await expect(page.getByText('Payment received')).toBeVisible();
  // Closed already, and the dismissal it triggers is not mistaken for a cancellation.
  expect(await page.evaluate(() => (window as any).__rzpEvents)).toEqual(['close']);
  // The screen is held until verification lands, then hands over to the receipt.
  await expect(page).toHaveURL(/order-confirmation\/ORD-TEST/);
});

for (const mode of ['offline', 'dismiss', 'unverified'] as const) {
  test(mode + ' never produces a paid confirmation and reuses request id', async ({ page }) => {
    const ids = await setup(page, mode);
    await page.goto('/checkout');
    await submit(page);
    await expect(page).toHaveURL(/cart/);
    await expect(page.locator('.cart-notice')).toBeVisible();
    await expect(page.getByRole('status', { name: '500g quantity' })).toHaveText('1');
    await page.reload();
    await page.getByRole('button', { name: 'Take these to the kettle' }).click();
    await submit(page);
    await expect(page).toHaveURL(/cart/);
    await expect(page.locator('.cart-notice')).toBeVisible();
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBe(ids[1]);
  });
}

test('pending order is never labelled paid and exposes recovery', async ({ page }) => {
  await setup(page, 'dismiss');
  await page.goto('/order-confirmation/ORD-TEST');
  await expect(page.getByRole('button', { name: 'Retry payment' })).toBeVisible();
  await expect(page.getByText('PAYMENT CONFIRMED', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Not scheduled')).toBeVisible();
});

test('unavailable order cannot claim confirmation', async ({ page }) => {
  await setup(page, 'offline');
  await page.route('**/api/orders/ORD-MISSING', route => route.fulfill({ status: 404, json: { success: false } }));
  await page.goto('/order-confirmation/ORD-MISSING');
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByText('PAYMENT CONFIRMED', { exact: true })).toHaveCount(0);
});

test('offline login never fabricates an authenticated session', async ({ page }) => {
  await page.route('**/api/auth/login', route => route.fulfill({ status: 503, json: { success: false, message: 'Service unavailable' } }));
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'EMAIL ADDRESS', exact: true }).fill('buyer@example.com');
  await page.locator('input[type=password]').fill('test-password');
  await page.locator('.auth-card button[type=submit]').click();
  await expect(page.getByText('Service unavailable')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('shams_token'))).toBeNull();
});



test('cart persists selected packs and quantity changes through refresh', async ({ page }) => {
  await setup(page, 'dismiss', false);
  await page.goto('/products/recipe-01');
  await page.getByRole('button', { name: 'ADD TO CART' }).click();
  await expect(page).toHaveURL(/cart/);
  await page.getByRole('button', { name: 'Add one 500g', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('status', { name: '500g quantity' })).toHaveText('2');
  await expect(page.getByRole('link', { name: 'Cart, 2 items' })).toBeVisible();
  await page.getByRole('button', { name: 'Take these to the kettle' }).click();
  await expect(page.locator('[aria-label="500g quantity"] output')).toHaveText('2');
});

test('a failed payment leaves the packs in the cart', async ({ page }) => {
  await setup(page, 'dismiss');
  await page.goto('/checkout');
  await submit(page);
  await expect(page).toHaveURL(/cart/);
  await expect(page.getByRole('status', { name: '500g quantity' })).toHaveText('1');
  await expect(page.getByRole('link', { name: 'Cart, 1 items' })).toBeVisible();
});

test('paid checkout clears purchased packs from cart', async ({ page }) => {
  await setup(page, 'paid');
  await page.goto('/checkout');
  await submit(page);
  await expect(page).toHaveURL(/order-confirmation/);
  await page.getByRole('link', { name: 'Cart, 0 items' }).click();
  await expect(page.getByText('The shelf is waiting.')).toBeVisible();
});

test('unpaid attempts stay out of customer order history', async ({ page }) => {
  await setup(page, 'dismiss');
  await page.goto('/account');
  await expect(page.getByText('No orders placed yet')).toBeVisible();
  await expect(page.locator('.order-number')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Cancel Order' })).toHaveCount(0);
});


test('latest interrupted checkout can restore an empty cart after signing in', async ({ page }) => {
  await setup(page, 'dismiss');
  await page.route('**/api/orders/pending-checkout', route => route.fulfill({ json: { success: true, data: initialOrder } }));
  await page.goto('/cart');
  await expect(page.getByRole('status', { name: '500g quantity' })).toHaveText('1');
  await expect(page.getByRole('button', { name: 'Take these to the kettle' })).toBeEnabled();
});


test('cart stays usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page, 'dismiss', false);
  await page.goto('/products/recipe-01');
  await page.getByRole('button', { name: 'ADD TO CART' }).click();
  await expect(page.getByRole('button', { name: 'Take these to the kettle' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
  await page.screenshot({ path: 'test-results/cart-mobile.png', fullPage: true });
});
