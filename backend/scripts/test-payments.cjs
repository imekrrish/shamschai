// Integration tests use a disposable schema on LOCAL PostgreSQL and a fake Razorpay API.
const assert = require('node:assert/strict');
const { randomUUID, createHmac } = require('node:crypto');
const { spawnSync } = require('node:child_process');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const source = process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL;
if (!source || !['127.0.0.1', 'localhost', '[::1]'].includes(new URL(source).hostname)) throw new Error('Tests require local PostgreSQL.');
const schema = 'razorpay_test_' + randomUUID().replaceAll('-', '');
const url = new URL(source); url.searchParams.set('schema', schema);
process.env.DATABASE_URL = process.env.DATABASE_URL_LOCAL = url.toString();
process.env.APP_ENV = process.env.NODE_ENV = 'test';
process.env.RAZORPAY_KEY_ID = 'rzp_test_fixture';
process.env.RAZORPAY_KEY_SECRET = 'test_api_secret';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret';
process.env.JWT_SECRET = 'test_only_jwt_secret_at_least_32_characters';
process.env.PORT = '0';
const prisma = new PrismaClient({ datasourceUrl: url.toString() });
let server;
const realFetch = global.fetch;
const remoteOrders = new Map(), remotePayments = new Map();
let createdRemote = 0, providerDown = false;
global.fetch = async (url, options) => {
  if (!String(url).startsWith('https://api.razorpay.com/v1/')) return realFetch(url, options);
  if (providerDown) throw new Error('Simulated provider outage');
  assert.equal(options.headers.Authorization, 'Basic ' + Buffer.from('rzp_test_fixture:test_api_secret').toString('base64'));
  const path = String(url).split('/v1/')[1];
  if (path === 'orders' && options.method === 'POST') {
    const body = JSON.parse(options.body);
    assert.equal(body.partial_payment, false);
    assert.equal(body.receipt.length, 36);
    const remote = { ...body, id: 'order_Test' + (++createdRemote) };
    remoteOrders.set(remote.id, remote);
    return Response.json(remote);
  }
  if (path.startsWith('orders/')) {
    const id = path.split('/')[1];
    return Response.json({ items: [...remotePayments.values()].filter(item => item.order_id === id) });
  }
  if (path.startsWith('payments/')) {
    const remote = remotePayments.get(path.split('/')[1]);
    return remote ? Response.json(remote) : Response.json({}, { status: 404 });
  }
  throw new Error('Unexpected provider path: ' + path);
};
let count = 0;
async function check(name, fn) { await fn(); console.log('PASS ' + (++count) + ': ' + name); }
const sign = (body, secret = process.env.RAZORPAY_KEY_SECRET) => createHmac('sha256', secret).update(body).digest('hex');

(async () => {
  const pushed = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'), 'db', 'push', '--skip-generate'], { env: process.env, encoding: 'utf8' });
  if (pushed.status !== 0) throw new Error('Could not initialize disposable test schema. No production database is used.');
  const { PaymentService } = require('../dist/services/payment.service');
  const { OrderService } = require('../dist/services/order.service');
  const { verifySignature, priceItems } = require('../dist/services/payment-security');
  const { AuthService } = require('../dist/services/auth.service');
  const user = await prisma.user.create({ data: { email: randomUUID() + '@test.invalid', name: 'Test Buyer' } });
  const other = await prisma.user.create({ data: { email: randomUUID() + '@test.invalid', name: 'Other Buyer' } });
  const payload = () => ({ requestId: randomUUID(), items: [{ title: 'TAMPERED', size: '200g', quantity: 1, unitPrice: 1 }], newAddress: { recipientName: 'Test Buyer', phone: '9999999999', streetAddress: 'Test Street', city: 'Hyderabad', state: 'Telangana', postalCode: '500001', country: 'India' } });
  let first;
  await check('server catalogue overrides browser prices and titles', async () => {
    first = await OrderService.createOrder(user.id, payload());
    assert.equal(Number(first.order.totalAmount), 399);
    assert.equal(first.order.items[0].title, "Sham's Masala Chai");
    assert.equal(first.paymentIntent.amount, 39900);
  });
  await check('invalid, fractional, oversized and duplicate quantities rejected', async () => {
    for (const quantity of [0, -1, 1.5, 21, NaN]) assert.throws(() => priceItems([{ size: '200g', quantity }]));
    assert.throws(() => priceItems([{ size: '__proto__', quantity: 1 }]));
    assert.throws(() => priceItems([{ size: '200g', quantity: 1 }, { size: '200g', quantity: 1 }]));
  });
  await check('concurrent checkout submissions create one merchant and provider order', async () => {
    const data = payload(), before = createdRemote;
    const results = await Promise.all([OrderService.createOrder(user.id, data), OrderService.createOrder(user.id, data)]);
    assert.equal(results[0].order.id, results[1].order.id);
    assert.equal(results[0].paymentIntent.razorpayOrderId, results[1].paymentIntent.razorpayOrderId);
    assert.equal(createdRemote - before, 1);
  });
  await check('retry id cannot be reused with changed contents or another customer', async () => {
    const data = payload(); await OrderService.createOrder(user.id, data);
    await assert.rejects(OrderService.createOrder(other.id, data), /changed/);
    data.items[0].quantity = 2;
    await assert.rejects(OrderService.createOrder(user.id, data), /changed/);
  });
  await check('new address becoming saved after reload preserves checkout identity', async () => {
    const data = payload();
    const first = await OrderService.createOrder(user.id, data);
    const retry = { ...data, newAddress: undefined, shippingAddressId: first.order.shippingAddressId };
    const second = await OrderService.createOrder(user.id, retry);
    assert.equal(first.order.id, second.order.id);
    assert.equal(first.paymentIntent.razorpayOrderId, second.paymentIntent.razorpayOrderId);
  });
  await check('address ownership is enforced', async () => {
    const data = payload(); delete data.newAddress; data.shippingAddressId = first.order.shippingAddressId;
    await assert.rejects(OrderService.createOrder(other.id, data), /valid delivery address/);
  });
  await check('provider outage leaves order pending and retry reuses merchant order', async () => {
    const data = payload(); providerDown = true;
    await assert.rejects(OrderService.createOrder(user.id, data), /could not be reached/);
    assert.equal((await prisma.order.findUniqueOrThrow({ where: { id: data.requestId } })).paymentStatus, 'PENDING');
    providerDown = false;
    assert.equal((await OrderService.createOrder(user.id, data)).order.id, data.requestId);
  });
  const reference = first.paymentIntent.razorpayOrderId;
  const paymentId = 'pay_TestFirst';
  const remote = { id: paymentId, order_id: reference, amount: 39900, currency: 'INR', status: 'authorized', captured: false, amount_refunded: 0 };
  remotePayments.set(paymentId, remote);
  const verification = { orderId: first.order.id, razorpay_order_id: reference, razorpay_payment_id: paymentId, razorpay_signature: sign(reference + '|' + paymentId) };
  await check('malformed signatures and signed wrong bytes rejected', async () => {
    assert.equal(verifySignature('a', 'x', 'secret'), false);
    assert.equal(verifySignature('b', sign('a'), process.env.RAZORPAY_KEY_SECRET), false);
    await assert.rejects(PaymentService.verify(user.id, { ...verification, razorpay_signature: '0'.repeat(64) }), /signature/);
  });
  await check('cross-account payment verification and status access rejected', async () => {
    await assert.rejects(PaymentService.verify(other.id, verification), /not found/);
    await assert.rejects(PaymentService.getPaymentStatusForOrder(first.order.id, other.id), /not found/);
    await assert.rejects(PaymentService.initiateOrderPayment(first.order.id, other.id), /not found/);
  });
  await check('authorized payment is not considered paid', async () => {
    assert.equal((await PaymentService.verify(user.id, verification)).paymentStatus, 'PENDING');
  });
  await check('wrong amount, currency or provider order cannot settle', async () => {
    for (const changed of [{ amount: 1 }, { currency: 'USD' }, { order_id: 'order_Other' }]) {
      remotePayments.set(paymentId, { ...remote, ...changed, status: 'captured', captured: true });
      await assert.rejects(PaymentService.verify(user.id, verification), /match|different order/);
    }
    remotePayments.set(paymentId, remote);
  });
  await check('captured payment atomically confirms order; duplicate verification is safe', async () => {
    remote.status = 'captured'; remote.captured = true;
    const results = await Promise.all([PaymentService.verify(user.id, verification), PaymentService.verify(user.id, verification)]);
    assert.equal(results[0].paymentStatus, 'PAID');
    assert.equal(results[1].orderStatus, 'CONFIRMED');
    assert.equal(await prisma.payment.count({ where: { orderId: first.order.id } }), 1);
  });
  await check('customer history lists paid orders but hides interrupted checkouts', async () => {
    const history = await OrderService.getUserOrders(user.id);
    assert.ok(history.orders.some(item => item.id === first.order.id));
    assert.ok(history.orders.every(item => ['PAID', 'REFUNDED'].includes(item.paymentStatus)));
    assert.equal(history.pagination.totalOrders, history.orders.length);
    assert.ok(await prisma.order.count({ where: { userId: user.id, paymentStatus: 'PENDING' } }) > 0);
  });
  await check('cart recovery stops after the latest checkout is paid', async () => {
    const buyer = await prisma.user.create({ data: { email: randomUUID() + '@test.invalid', name: 'Cart Buyer' } });
    const checkout = await OrderService.createOrder(buyer.id, payload());
    assert.equal((await OrderService.getPendingCheckout(buyer.id)).id, checkout.order.id);
    await prisma.order.update({ where: { id: checkout.order.id }, data: { paymentStatus: 'PAID', status: 'CONFIRMED' } });
    assert.equal(await OrderService.getPendingCheckout(buyer.id), null);
    assert.equal(await OrderService.getPendingCheckout(other.id), null);
  });
  await check('legacy dummy orders cannot be used for live checkout', async () => {
    const old = await OrderService.createOrder(user.id, payload());
    await prisma.order.update({ where: { id: old.order.id }, data: { paymentMethod: 'DUMMY' } });
    await assert.rejects(PaymentService.initiateOrderPayment(old.order.id, user.id), /legacy/);
  });
  await check('paid order cannot open another checkout', async () => {
    await assert.rejects(PaymentService.initiateOrderPayment(first.order.id, user.id), /no longer/);
  });
  const event = Buffer.from(JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: paymentId } } } }));
  await check('webhook uses raw bytes and separate secret', async () => {
    await assert.rejects(PaymentService.webhook(event, sign(event)), /signature/);
    await assert.rejects(PaymentService.webhook(Buffer.concat([event, Buffer.from(' ')]), sign(event, process.env.RAZORPAY_WEBHOOK_SECRET)), /signature/);
    await PaymentService.webhook(event, sign(event, process.env.RAZORPAY_WEBHOOK_SECRET));
    await PaymentService.webhook(event, sign(event, process.env.RAZORPAY_WEBHOOK_SECRET));
  });
  await check('delayed capture cannot regress shipped order status', async () => {
    await prisma.order.update({ where: { id: first.order.id }, data: { status: 'SHIPPED' } });
    await PaymentService.webhook(event, sign(event, process.env.RAZORPAY_WEBHOOK_SECRET));
    assert.equal((await prisma.order.findUniqueOrThrow({ where: { id: first.order.id } })).status, 'SHIPPED');
  });
  await check('full refund syncs and replayed capture cannot undo refund', async () => {
    remote.status = 'refunded'; remote.amount_refunded = remote.amount;
    await PaymentService.webhook(event, sign(event, process.env.RAZORPAY_WEBHOOK_SECRET));
    assert.equal((await PaymentService.getPaymentStatusForOrder(first.order.id, user.id)).paymentStatus, 'REFUNDED');
    remote.status = 'captured';
    await PaymentService.webhook(event, sign(event, process.env.RAZORPAY_WEBHOOK_SECRET));
    assert.equal((await PaymentService.getPaymentStatusForOrder(first.order.id, user.id)).paymentStatus, 'REFUNDED');
  });
  await check('status reconciliation recovers capture when browser callback/webhook is missed', async () => {
    const data = await OrderService.createOrder(user.id, payload());
    remotePayments.set('pay_Recovery', { id: 'pay_Recovery', order_id: data.paymentIntent.razorpayOrderId, amount: 39900, currency: 'INR', status: 'captured', captured: true });
    assert.equal((await PaymentService.getPaymentStatusForOrder(data.order.id, user.id, true)).paymentStatus, 'PAID');
  });
  await check('cancellation cannot fabricate a refund or race an issued checkout', async () => {
    await assert.rejects(OrderService.cancelOrder(user.id, first.order.id), /customer care/);
  });
  await check('unverified Google profile cannot create a session', async () => {
    await assert.rejects(AuthService.googleAuth({ email: user.email }), /unavailable/);
  });
  ({ server } = require('../dist/server'));
  await new Promise(resolve => server.listening ? resolve() : server.once('listening', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  await check('HTTP dummy payment endpoint is unavailable and verify requires authentication', async () => {
    const token = require('jsonwebtoken').sign({ id: user.id, email: user.email, role: 'CUSTOMER', name: user.name }, process.env.JWT_SECRET);
    const res = await realFetch(base + '/api/payments/dummy/process', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: first.order.id, simulateSuccess: true }) });
    assert.equal(res.status, 404);
    assert.equal((await realFetch(base + '/api/payments/verify', { method: 'POST' })).status, 401);
  });
  await check('HTTP webhook preserves raw bytes before JSON parsing', async () => {
    const response = await realFetch(base + '/api/payments/webhook', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Razorpay-Signature': sign(event, process.env.RAZORPAY_WEBHOOK_SECRET) }, body: event });
    assert.equal(response.status, 200);
  });
  console.log(count + ' payment integration checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  global.fetch = realFetch;
  if (server) await new Promise(resolve => server.close(resolve));
  const shared = require('../dist/config/prisma').default;
  await shared.$disconnect();
  if (!/^razorpay_test_[a-f0-9]{32}$/.test(schema)) throw new Error('Unsafe test schema');
  await prisma.$executeRawUnsafe('DROP SCHEMA IF EXISTS "' + schema + '" CASCADE');
  await prisma.$disconnect();
});

