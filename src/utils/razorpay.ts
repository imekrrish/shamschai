import { api, PaymentIntent, PaymentVerification, UserProfile } from './api';

type Result = Omit<PaymentVerification, 'orderId'>;
interface CheckoutInstance { open(): void; close(): void; on(event: 'payment.failed', handler: (response: unknown) => void): void; }
declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => CheckoutInstance; } }

let loader: Promise<void> | undefined;
export function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    const timer = window.setTimeout(() => { script.remove(); loader = undefined; reject(new Error('Payment window took too long to load. Please retry.')); }, 15000);
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => { clearTimeout(timer); if (window.Razorpay) resolve(); else { loader = undefined; reject(new Error('Payment window unavailable.')); } };
    script.onerror = () => { clearTimeout(timer); script.remove(); loader = undefined; reject(new Error('Could not load Razorpay. Check your connection and retry.')); };
    document.head.appendChild(script);
  });
  return loader;
}

/**
 * @param onCaptured Runs the moment Razorpay reports a successful payment and
 *   its window is dismissed, before the verification round-trip. The caller
 *   uses it to put its own confirmation state on screen.
 */
export async function openPayment(orderId: string, intent: PaymentIntent, user: UserProfile | null, onCaptured?: () => void): Promise<void> {
  await loadRazorpay();
  return new Promise((resolve, reject) => {
    let processing = false;
    const checkout = new window.Razorpay!({
      key: intent.keyId, order_id: intent.razorpayOrderId, amount: intent.amount, currency: intent.currency,
      name: "Sham's Chai", description: 'Masala Chai', theme: { color: '#B48A68' },
      prefill: { name: user?.name, email: user?.email, contact: user?.phone },
      // `processing` also covers the programmatic close below, which reaches
      // ondismiss the same way a cancelled payment would.
      modal: { ondismiss: () => { if (!processing) reject(new Error('Payment window closed. Your packs are saved in your cart.')); } },
      handler: async (result: Result) => {
        processing = true;
        // Razorpay already has the money, so its window comes down before we
        // verify rather than after: the payer never waits on a dead screen.
        try { checkout.close(); } catch { /* Razorpay may have closed it already. */ }
        onCaptured?.();
        try {
          const verified = await api.verifyPayment({ ...result, orderId });
          if (verified.paymentStatus !== 'PAID') throw new Error('Payment is awaiting confirmation. Check My Orders before paying again.');
          resolve();
        } catch {
          // A captured payment can outlive a network failure. Never report success locally.
          reject(new Error('Payment confirmation is pending. Your packs are in your cart; do not pay again if your account was debited.'));
        }
      },
    });
    // Razorpay handles failed attempts inside its window and allows another method.
    checkout.open();
  });
}

