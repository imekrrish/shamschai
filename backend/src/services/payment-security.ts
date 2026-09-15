import { createHmac, timingSafeEqual } from 'node:crypto';
import { ProductService } from './product.service';

export function paymentError(message: string, statusCode = 400) { return Object.assign(new Error(message), { statusCode }); }
export function verifySignature(body: string | Buffer, signature: string, secret: string) {
  if (!secret || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  return timingSafeEqual(createHmac('sha256', secret).update(body).digest(), Buffer.from(signature, 'hex'));
}
export const prices: Readonly<Record<string, number>> = Object.freeze({ '200g': 349, '500g': 799, '1000g': 1499 });
export function priceItems(items: { size: string; quantity: number }[]) {
  if (!items.length || items.length > 3) throw paymentError('Choose between one and three pack sizes.');
  const seen = new Set<string>();
  return items.map(item => {
    if (!Object.hasOwn(prices, item.size) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20 || seen.has(item.size)) throw paymentError('Invalid pack size or quantity.');
    seen.add(item.size);
    const unitPrice = prices[item.size];
    return { title: "Sham's Masala Chai", size: item.size, quantity: item.quantity, unitPrice, subtotal: unitPrice * item.quantity };
  });
}

export async function priceItemsFromDb(items: { size: string; quantity: number; title?: string }[]) {
  if (!items.length || items.length > 5) throw paymentError('Choose between one and five pack sizes.');
  const seen = new Set<string>();

  const pricedItems = [];
  for (const item of items) {
    const normSize = ProductService.normalizeSize(item.size);
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20 || seen.has(normSize)) {
      throw paymentError('Invalid pack size or quantity.');
    }
    seen.add(normSize);

    const variantInfo = await ProductService.getVariant('recipe-01', item.size);
    if (!variantInfo) {
      if (Object.hasOwn(prices, normSize)) {
        const unitPrice = prices[normSize];
        pricedItems.push({
          title: item.title || "Sham's Masala Chai",
          size: normSize,
          quantity: item.quantity,
          unitPrice,
          subtotal: unitPrice * item.quantity,
        });
        continue;
      }
      throw paymentError(`Pack size ${item.size} is not available.`);
    }

    if (!variantInfo.inStock) {
      throw paymentError(`${variantInfo.productName} (${variantInfo.variant?.weight || item.size}) is currently out of stock.`, 400);
    }

    const unitPrice = variantInfo.price;
    pricedItems.push({
      title: item.title || variantInfo.productName || "Sham's Masala Chai",
      size: normSize,
      quantity: item.quantity,
      unitPrice,
      subtotal: unitPrice * item.quantity,
    });
  }

  return pricedItems;
}

export function validatePayment(payment: { order_id: string | null; amount: number; currency: string }, reference: string, amount: number, currency: string) {
  if (payment.order_id !== reference || !Number.isSafeInteger(payment.amount) || payment.amount !== Math.round(amount * 100) || payment.currency !== currency) throw paymentError('Payment does not match this order.');
}

