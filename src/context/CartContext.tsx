import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';
import { checkoutFingerprint } from '../utils/checkoutFingerprint';
export const cartSizes = ['500g', '1000g'] as const;
export type CartSize = typeof cartSizes[number];
export type Quantities = Record<CartSize, number>;
export const emptyCart = (): Quantities => ({ '500g': 0, '1000g': 0 });
export const defaultPrices: Record<CartSize, number> = { '500g': 450, '1000g': 850 };
export const defaultStock: Record<CartSize, boolean> = { '500g': true, '1000g': true };
export const cartPrices: Record<CartSize, number> = { ...defaultPrices };

type Pending = { orderId: string; userId: string; quantities: Quantities; fingerprint?: string };
type State = { quantities: Quantities; pending: Pending | null };
type Context = State & {
  count: number;
  prices: Record<CartSize, number>;
  stockStatus: Record<CartSize, boolean>;
  refreshCatalog: () => Promise<void>;
  setQuantity: (size: CartSize, quantity: number) => void;
  replace: (q: Quantities) => void;
  add: (size: CartSize, quantity: number) => void;
  rememberPayment: (pending: Pending) => void;
  complete: (orderId: string) => void;
};
const CartContext = createContext<Context | null>(null);
function clean(value: unknown): Quantities {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return Object.fromEntries(cartSizes.map(size => [size, Number.isFinite(source[size]) ? Math.max(0, Math.min(20, Math.floor(Number(source[size])))) : 0])) as Quantities;
}
function initial(): State {
  try {
    const saved = JSON.parse(localStorage.getItem('shams-cart-v2') || 'null');
    return { quantities: clean(saved?.quantities), pending: typeof saved?.pending?.orderId === 'string' && typeof saved?.pending?.userId === 'string' ? { ...saved.pending, quantities: clean(saved.pending.quantities) } : null };
  } catch { return { quantities: emptyCart(), pending: null }; }
}
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [prices, setPrices] = useState<Record<CartSize, number>>(defaultPrices);
  const [stockStatus, setStockStatus] = useState<Record<CartSize, boolean>>(defaultStock);
  const { user } = useAuth();

  const refreshCatalog = useCallback(async () => {
    try {
      const prod = await api.getProduct('recipe-01');
      if (prod && Array.isArray(prod.variants)) {
        const nextPrices = { ...defaultPrices };
        const nextStock = { ...defaultStock };
        prod.variants.forEach((v: any) => {
          const rawWeight = (v.weight || '').toLowerCase().replace(/\s+/g, '');
          const s = (rawWeight === '1kg' ? '1000g' : rawWeight) as CartSize;
          if (cartSizes.includes(s)) {
            nextPrices[s] = Number(v.price) || defaultPrices[s];
            nextStock[s] = prod.stock !== false && v.stock !== false;
            cartPrices[s] = nextPrices[s];
          }
        });
        setPrices(nextPrices);
        setStockStatus(nextStock);
      }
    } catch {
      // Backend offline, fallback to defaults
    }
  }, []);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void api.getPendingCheckout().then(async order => {
      if (cancelled || !order) return;
      const quantities = clean(Object.fromEntries(order.items.map(item => [item.size, item.quantity])));
      const items = cartSizes.filter(size => quantities[size] > 0).map(size => ({ title: "Sham's Masala Chai", size, unitPrice: Number(order.items.find(item => item.size === size)!.unitPrice), quantity: quantities[size] }));
      const fingerprint = await checkoutFingerprint(items, order.shippingSnapshot, order.notes || '');
      if (cancelled) return;
      setState(current => current.pending || Object.values(current.quantities).some(Boolean) ? current : { quantities, pending: { orderId: order.id, userId: user.id, quantities, fingerprint } });
    }).catch(() => { /* Keep the local cart if recovery is unavailable. */ });
    return () => { cancelled = true; };
  }, [user?.id]);
  useEffect(() => { localStorage.setItem('shams-cart-v2', JSON.stringify(state)); }, [state]);
  const replace = useCallback((quantities: Quantities) => setState(current => ({ ...current, quantities: clean(quantities) })), []);
  const setQuantity = useCallback((size: CartSize, quantity: number) => setState(current => ({ ...current, quantities: clean({ ...current.quantities, [size]: quantity }) })), []);
  const add = useCallback((size: CartSize, quantity: number) => setState(current => ({ ...current, quantities: clean({ ...current.quantities, [size]: current.quantities[size] + quantity }) })), []);
  const rememberPayment = useCallback((pending: Pending) => setState(current => ({ ...current, pending })), []);
  const complete = useCallback((orderId: string) => setState(current => {
    if (current.pending?.orderId !== orderId) return current;
    const purchased = current.pending.quantities;
    return { pending: null, quantities: Object.fromEntries(cartSizes.map(size => [size, Math.max(0, current.quantities[size] - purchased[size])])) as Quantities };
  }), []);
  return <CartContext.Provider value={{ ...state, count: Object.values(state.quantities).reduce((a, b) => a + b, 0), prices, stockStatus, refreshCatalog, replace, setQuantity, add, rememberPayment, complete }}>{children}</CartContext.Provider>;
}
export function useCart() { const value = useContext(CartContext); if (!value) throw new Error('Cart provider missing'); return value; }

