import ExcelJS from 'exceljs';
import type { Order } from './types';

export type OrderDateRange = { fromUtc: string; toUtcExclusive: string };

export function parseOrderDateRange(from: string | null, to: string | null): OrderDateRange {
  const validDate = (value: string | null): value is string => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '0001-01-01' || value > '9998-12-31') return false;
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  };
  if (!validDate(from) || !validDate(to)) throw new Error('Choose valid From and To dates.');
  if (from > to) throw new Error('From date must be on or before To date.');
  const start = new Date(`${from}T00:00:00+05:30`);
  const end = new Date(`${to}T00:00:00+05:30`);
  end.setUTCDate(end.getUTCDate() + 1);
  return { fromUtc: start.toISOString(), toUtcExclusive: end.toISOString() };
}

export async function createOrdersWorkbook(orders: Order[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sham's Chai";
  const summary = workbook.addWorksheet('Confirmed orders');
  summary.columns = [
    ['Order number', 'orderNumber', 24], ['Order date (IST)', 'createdAt', 25],
    ['Status', 'status', 16], ['Customer name', 'customerName', 24],
    ['Customer email', 'customerEmail', 30], ['Customer phone', 'customerPhone', 20],
    ['Recipient name', 'recipientName', 24], ['Delivery phone', 'deliveryPhone', 20],
    ['Street address', 'streetAddress', 45], ['Landmark', 'landmark', 25],
    ['City', 'city', 20], ['State', 'state', 22], ['Postal code', 'postalCode', 16],
    ['Country', 'country', 16], ['Items (quantity x product / size)', 'items', 55],
    ['Total quantity', 'quantity', 16], ['Subtotal', 'subtotal', 16],
    ['Shipping fee', 'shippingFee', 16], ['Order total', 'totalAmount', 16],
    ['Currency', 'currency', 12], ['Payment status', 'paymentStatus', 18],
    ['Payment method', 'paymentMethod', 18], ['Notes', 'notes', 40],
  ].map(([header, key, width]) => ({ header: String(header), key: String(key), width: Number(width) }));
  const items = workbook.addWorksheet('Order items');
  items.columns = [
    { header: 'Order number', key: 'orderNumber', width: 24 },
    { header: 'Product', key: 'title', width: 36 },
    { header: 'Size / variant', key: 'size', width: 20 },
    { header: 'Quantity', key: 'quantity', width: 14 },
    { header: 'Unit price', key: 'unitPrice', width: 16 },
    { header: 'Item subtotal', key: 'subtotal', width: 18 },
    { header: 'Currency', key: 'currency', width: 12 },
  ];
  for (const order of orders) {
    // Snapshot contact details belong to this delivery; profile details may differ.
    const address = order.shippingAddress || {};
    summary.addRow({
      orderNumber: String(order.orderNumber),
      createdAt: new Date(order.createdAt).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }),
      status: order.status, customerName: order.customerName || '',
      customerEmail: order.customerEmail || '', customerPhone: String(order.customerPhone || ''),
      recipientName: address.recipientName || '', deliveryPhone: String(address.phone || ''),
      streetAddress: address.streetAddress || '', landmark: address.landmark || '',
      city: address.city || '', state: address.state || '', postalCode: String(address.postalCode || ''),
      country: address.country || '',
      items: order.items.map(item => `${item.quantity} x ${item.title} / ${item.size}`).join('\n'),
      quantity: order.items.reduce((total, item) => total + Number(item.quantity), 0),
      subtotal: Number(order.subtotal), shippingFee: Number(order.shippingFee),
      totalAmount: Number(order.totalAmount), currency: order.currency,
      paymentStatus: order.paymentStatus, paymentMethod: order.paymentMethod, notes: order.notes || '',
    });
    for (const item of order.items) {
      items.addRow({ orderNumber: String(order.orderNumber), title: item.title, size: item.size,
        quantity: Number(item.quantity), unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal), currency: order.currency });
    }
  }
  for (const sheet of [summary, items]) {
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF17382F' } };
    sheet.eachRow((row, index) => {
      if (index > 1) row.alignment = { vertical: 'top', wrapText: true };
    });
  }
  // Strings are explicit text cells, preserving +91, leading zeros and formula-like input.
  for (const key of ['customerPhone', 'deliveryPhone', 'postalCode']) summary.getColumn(key).numFmt = '@';
  for (const key of ['subtotal', 'shippingFee', 'totalAmount']) summary.getColumn(key).numFmt = '#,##0.00';
  for (const key of ['unitPrice', 'subtotal']) items.getColumn(key).numFmt = '#,##0.00';
  return workbook.xlsx.writeBuffer();
}
