import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useCatalog } from './CatalogContext';
import { api } from '../utils/api';
import { checkoutFingerprint } from '../utils/checkoutFingerprint';

/**
 * A cart key is a normalised pack weight — "500g", "1000g", "250g". The set of
 * keys is whatever the admin has published on the product, never a fixed list,
 * so a new variant works without a code change.
 */
export type CartSize = string;
export type Quantities = Record<CartSize, number>;

/** Matches the backend's ProductService.normalizeSize so both agree on a key. */
export const normalizeSize = (weight: string) => {
  const cleaned = String(weight || '').toLowerCase().replace(/\s+/g, '');
  return cleaned.replace(/^(\d+(?:\.\d+)?)kg$/, (_, kg: string) => `${Number(kg) * 1000}g`);
};

export const emptyCart = (): Quantities => ({});

type Pending = { orderId: string; userId: string; quantities: Quantities; fingerprint?: string };
type State = { quantities: Quantities; pending: Pending | null };
type Context = State & {
  count: number;
  /** Published pack sizes, in catalogue order. */
  sizes: CartSize[];
  prices: Record<CartSize, number>;
  stockStatus: Record<CartSize, boolean>;
  labels: Record<CartSize, string>;
  setQuantity: (size: CartSize, quantity: number) => void;
  replace: (q: Quantities) => void;
  add: (size: CartSize, quantity: number) => void;
  rememberPayment: (pending: Pending) => void;
  complete: (orderId: string) => void;
};
const CartContext = createContext<Context | null>(null);

/** Keeps every key the basket holds, clamped to a sane quantity. */
function clean(value: unknown): Quantities {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const out: Quantities = {};
  for (const [size, quantity] of Object.entries(source)) {
    const n = Number(quantity);
    if (!Number.isFinite(n)) continue;
    const clamped = Math.max(0, Math.min(20, Math.floor(n)));
    if (clamped > 0) out[normalizeSize(size)] = clamped;
  }
  return out;
}

function initial(): State {
  try {
    const saved = JSON.parse(localStorage.getItem('shams-cart-v2') || 'null');
    return {
      quantities: clean(saved?.quantities),
      pending: typeof saved?.pending?.orderId === 'string' && typeof saved?.pending?.userId === 'string'
        ? { ...saved.pending, quantities: clean(saved.pending.quantities) }
        : null,
    };
  } catch { return { quantities: emptyCart(), pending: null }; }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const { chai } = useCatalog();
  const { user } = useAuth();

  // Pack sizes, prices and availability all come from the published product.
  const { sizes, prices, stockStatus, labels } = useMemo(() => {
    const variants = chai?.variants ?? [];
    const sizes: CartSize[] = [];
    const prices: Record<CartSize, number> = {};
    const stockStatus: Record<CartSize, boolean> = {};
    const labels: Record<CartSize, string> = {};
    for (const variant of variants) {
      const size = normalizeSize(variant.weight);
      if (!size || sizes.includes(size)) continue;
      sizes.push(size);
      prices[size] = variant.price;
      stockStatus[size] = chai?.stock !== false && variant.stock !== false;
      labels[size] = variant.weight;
    }
    return { sizes, prices, stockStatus, labels };
  }, [chai]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void api.getPendingCheckout().then(async order => {
      if (cancelled || !order) return;
      const quantities = clean(Object.fromEntries(order.items.map(item => [item.size, item.quantity])));
      const items = Object.entries(quantities).map(([size, quantity]) => ({
        title: "Sham's Masala Chai",
        size,
        unitPrice: Number(order.items.find(item => normalizeSize(item.size) === size)?.unitPrice ?? 0),
        quantity,
      }));
      const fingerprint = await checkoutFingerprint(items, order.shippingSnapshot, order.notes || '');
      if (cancelled) return;
      setState(current => current.pending || Object.values(current.quantities).some(Boolean)
        ? current
        : { quantities, pending: { orderId: order.id, userId: user.id, quantities, fingerprint } });
    }).catch(() => { /* Keep the local cart if recovery is unavailable. */ });
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => { localStorage.setItem('shams-cart-v2', JSON.stringify(state)); }, [state]);

  const replace = useCallback((quantities: Quantities) => setState(current => ({ ...current, quantities: clean(quantities) })), []);
  const setQuantity = useCallback((size: CartSize, quantity: number) => setState(current => ({ ...current, quantities: clean({ ...current.quantities, [size]: quantity }) })), []);
  const add = useCallback((size: CartSize, quantity: number) => setState(current => ({ ...current, quantities: clean({ ...current.quantities, [size]: (current.quantities[size] || 0) + quantity }) })), []);
  const rememberPayment = useCallback((pending: Pending) => setState(current => ({ ...current, pending })), []);
  const complete = useCallback((orderId: string) => setState(current => {
    if (current.pending?.orderId !== orderId) return current;
    const purchased = current.pending.quantities;
    const remaining: Quantities = {};
    for (const [size, quantity] of Object.entries(current.quantities)) {
      const left = quantity - (purchased[size] || 0);
      if (left > 0) remaining[size] = left;
    }
    return { pending: null, quantities: remaining };
  }), []);

  const count = Object.values(state.quantities).reduce((a, b) => a + b, 0);

  return <CartContext.Provider value={{ ...state, count, sizes, prices, stockStatus, labels, replace, setQuantity, add, rememberPayment, complete }}>{children}</CartContext.Provider>;
}

export function useCart() { const value = useContext(CartContext); if (!value) throw new Error('Cart provider missing'); return value; }

/** Sizes to render: what is published, plus anything already in the basket. */
export function useCartRows() {
  const { sizes, quantities } = useCart();
  return useMemo(() => {
    const rows = [...sizes];
    for (const size of Object.keys(quantities)) if (!rows.includes(size)) rows.push(size);
    return rows;
  }, [sizes, quantities]);
}
