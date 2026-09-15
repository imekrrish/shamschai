import { queryPostgres } from './db';
import { number } from './admin-api';

const base = `SELECT o.*, u.name AS "customerName", u.email AS "customerEmail", u.phone AS "customerPhone", COALESCE(json_agg(json_build_object('id', oi.id, 'title', oi.title, 'size', oi.size, 'unitPrice', oi."unitPrice", 'quantity', oi.quantity, 'subtotal', oi.subtotal)) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items FROM orders o JOIN users u ON u.id=o."userId" LEFT JOIN order_items oi ON oi."orderId"=o.id`;
const map = (order: any) => ({ ...order, subtotal: number(order.subtotal), shippingFee: number(order.shippingFee), totalAmount: number(order.totalAmount), discount: 0, shippingAddress: order.shippingSnapshot, items: order.items || [] });

export async function liveOrders(status?: string, search?: string) {
  const terms: string[] = []; const values: string[] = [];
  if (status) { values.push(status); terms.push(`o.status=$${values.length}`); }
  if (search) { values.push(`%${search}%`); terms.push(`(o."orderNumber" ILIKE $${values.length} OR u.name ILIKE $${values.length} OR u.email ILIKE $${values.length})`); }
  const rows = await queryPostgres(`${base}${terms.length ? ` WHERE ${terms.join(' AND ')}` : ''} GROUP BY o.id,u.id ORDER BY o."createdAt" DESC`, values);
  return rows.map(map);
}

export async function liveOrder(id: string) { return (await liveOrders()).find(order => order.id === id || order.orderNumber === id) || null; }
