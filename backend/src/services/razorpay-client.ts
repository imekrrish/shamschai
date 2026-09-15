import { paymentError } from './payment-security';
export function razorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !/^rzp_(test|live)_/.test(keyId) || !secret) throw paymentError('Online payments are not configured yet. Please try again later.', 503);
  return { keyId, secret };
}
export async function razorpayRequest<T>(path: string, body?: unknown): Promise<T> {
  const { keyId, secret } = razorpayConfig();
  let response: globalThis.Response;
  try {
    response = await fetch('https://api.razorpay.com/v1/' + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { Authorization: 'Basic ' + Buffer.from(keyId + ':' + secret).toString('base64'), 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(12000),
    });
  } catch { throw paymentError('Payment provider could not be reached. Retry this order; do not pay again if you were charged.', 503); }
  if (!response.ok) throw paymentError('Payment provider request failed. Please try again shortly.', 502);
  return response.json() as Promise<T>;
}
export interface RazorpayPayment { id: string; order_id: string | null; amount: number; currency: string; status: string; captured: boolean; amount_refunded?: number; }

