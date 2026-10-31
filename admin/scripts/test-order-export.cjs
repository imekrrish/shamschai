const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const ExcelJS = require('exceljs');
const { NextRequest, NextResponse } = require('next/server');

function load(file, overrides = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => name in overrides ? overrides[name] : require(name), module, module.exports);
  return module.exports;
}

(async () => {
  const helpers = load('src/lib/order-export.ts');
  const range = helpers.parseOrderDateRange('2026-10-01', '2026-10-31');
  assert.deepEqual(range, { fromUtc: '2026-09-30T18:30:00.000Z', toUtcExclusive: '2026-10-31T18:30:00.000Z' });
  const leap = helpers.parseOrderDateRange('2024-02-29', '2024-02-29');
  assert.equal(Date.parse(leap.toUtcExclusive) - Date.parse(leap.fromUtc), 86400000);
  for (const values of [[null, null], ['2026-02-30', '2026-03-01'], ['2026-11-01', '2026-10-01'], ['2026-2-01', '2026-03-01']]) {
    assert.throws(() => helpers.parseOrderDateRange(...values));
  }
  const order = {
    orderNumber: 'SH-001', createdAt: '2026-09-30T18:30:00Z', status: 'CONFIRMED',
    customerName: '=1+1', customerEmail: 'test@example.com', customerPhone: '+919999999999',
    shippingAddress: { recipientName: 'Delivery recipient', phone: '0987654321', streetAddress: '12 Test Street',
      landmark: 'Near park', city: 'Hyderabad', state: 'Telangana', postalCode: '001234', country: 'India' },
    items: [{ title: 'Chai', size: '500 g', quantity: 2, unitPrice: '449', subtotal: '898' },
      { title: 'Chai', size: '1 kg', quantity: 1, unitPrice: '860', subtotal: '860' }],
    subtotal: 1758, shippingFee: 0, totalAmount: 1758, currency: 'INR', paymentStatus: 'PAID', paymentMethod: 'RAZORPAY', notes: '@test',
  };
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await helpers.createOrdersWorkbook([order]));
  const summary = workbook.getWorksheet('Confirmed orders');
  const items = workbook.getWorksheet('Order items');
  const cell = header => summary.getRow(2).getCell(summary.getRow(1).values.indexOf(header));
  assert.equal(summary.rowCount, 2);
  assert.equal(items.rowCount, 3);
  assert.equal(cell('Customer phone').value, '+919999999999');
  assert.equal(cell('Delivery phone').value, '0987654321');
  assert.equal(cell('Postal code').value, '001234');
  assert.equal(cell('Customer name').value, '=1+1');
  assert.equal(cell('Customer name').type, ExcelJS.ValueType.String);
  assert.equal(cell('Order total').value, 1758);
  assert.equal(cell('Total quantity').value, 3);
  assert.match(cell('Order date (IST)').value, /01\/10\/2026/);
  assert.equal(items.getRow(2).getCell(5).type, ExcelJS.ValueType.Number);

  let capturedQuery;
  const live = load('src/lib/live-orders.ts', {
    './db': { queryPostgres: async (sql, params) => { capturedQuery = { sql, params }; return [{ ...order, shippingSnapshot: order.shippingAddress }]; } },
    './admin-api': { number: value => Number(value || 0) },
  });
  await live.liveOrders('CONFIRMED', undefined, range);
  assert.deepEqual(capturedQuery.params, ['CONFIRMED', range.fromUtc, range.toUtcExclusive]);
  assert.match(capturedQuery.sql, /o\."createdAt">=\$2::timestamp/);
  assert.match(capturedQuery.sql, /o\."createdAt"<\$3::timestamp/);

  let denied = false, result = [order], calls = 0;
  const route = load('src/app/api/orders/export/route.ts', {
    '@/lib/admin-api': { requireAdmin: () => denied ? NextResponse.json({}, { status: 401 }) : null },
    '@/lib/live-orders': { liveOrders: async (...args) => { calls++; assert.deepEqual(args, ['CONFIRMED', undefined, range]); return result; } },
    '@/lib/order-export': helpers,
  });
  const request = (query = 'from=2026-10-01&to=2026-10-31') => new NextRequest(`http://localhost/api/orders/export?${query}`);
  denied = true;
  assert.equal((await route.GET(request())).status, 401);
  assert.equal(calls, 0);
  denied = false;
  assert.equal((await route.GET(request('from=invalid'))).status, 400);
  assert.equal(calls, 0);
  result = [];
  assert.equal((await route.GET(request())).status, 404);
  result = [order];
  const response = await route.GET(request());
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Content-Disposition'), /confirmed-orders_2026-10-01_to_2026-10-31.xlsx/);
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  const downloaded = new ExcelJS.Workbook();
  await downloaded.xlsx.load(Buffer.from(await response.arrayBuffer()));
  assert.equal(downloaded.worksheets.length, 2);
  console.log('Order export checks passed: dates, query filters, XLSX round-trip, text safety, auth, validation, empty state and download.');
})().catch(error => { console.error(error); process.exitCode = 1; });
