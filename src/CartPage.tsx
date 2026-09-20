import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useCart, useCartRows, CartSize } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import { api } from './utils/api';
import { money } from './components/ui';
import { BackLink, OrderFlowBar, OrderSteps } from './components/OrderFlow';
import './CartPage.css';

const FREE_SHIPPING_FROM = 500;

export default function CartPage() {
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(!!cart.pending);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!cart.pending || cart.pending.userId !== user?.id) { setChecking(false); return; }
      setChecking(true);
      try {
        const status = await api.paymentStatus(cart.pending.orderId);
        if (cancelled) return;
        if (status.paymentStatus === 'PAID') {
          cart.complete(cart.pending.orderId);
          navigate('/order-confirmation/' + status.orderNumber, { replace: true });
        }
      } catch { if (!cancelled) setError('We could not check your last payment. Refresh before paying again, especially if you were charged.'); }
      finally { if (!cancelled) setChecking(false); }
    }
    void check();
    return () => { cancelled = true; };
  }, [cart.pending?.orderId, user?.id, cart.complete, navigate]);

  const rows = useCartRows();
  const getItemPrice = (size: CartSize) => cart.prices[size] ?? 0;
  const isItemInStock = (size: CartSize) => cart.stockStatus[size] !== false;
  const sizeLabel = (size: CartSize) => cart.labels[size] ?? (size === '1000g' ? '1 kg' : size);

  const subtotal = rows.reduce((sum, size) => sum + (cart.quantities[size] ?? 0) * getItemPrice(size), 0);
  const shipping = subtotal >= FREE_SHIPPING_FROM || subtotal === 0 ? 0 : 50;
  const hasOutOfStockItems = rows.some((size) => (cart.quantities[size] ?? 0) > 0 && !isItemInStock(size));

  return (
    <section className={`cart-page ${cart.count ? '' : 'cart-page-empty'}`}>
      <OrderFlowBar>
        <BackLink to="/the-collection">CONTINUE SHOPPING</BackLink>
        {!!cart.count && <OrderSteps current={1} />}
      </OrderFlowBar>

      <header className="cart-head">
        <div className="eyebrow">YOUR CHAI SHELF</div>
        <h1>Your next <em>cups.</em></h1>
        {!!cart.count && <p className="cart-head-count">{cart.count} {cart.count === 1 ? 'pack' : 'packs'} on the shelf</p>}
      </header>

      {location.state?.message && <p className="cart-notice" role="status">{location.state.message}</p>}
      {error && <p role="alert" className="form-error cart-notice">{error}</p>}
      {hasOutOfStockItems && (
        <div className="cart-notice cart-notice-alert" role="alert">
          <AlertTriangle size={18} aria-hidden="true" />
          <span>One or more items in your cart are currently out of stock. Please remove them before proceeding to checkout.</span>
        </div>
      )}

      {cart.count ? (
        <div className="cart-layout">
          <div className="cart-items">
            <div className="cart-items-head" aria-hidden="true">
              <span>Item</span>
              <span>Total</span>
            </div>

            {rows.filter(size => (cart.quantities[size] ?? 0) > 0).map(size => {
              const inStock = isItemInStock(size);
              const price = getItemPrice(size);

              return (
                <article className={`cart-item ${!inStock ? 'cart-item-oos' : ''}`} key={size}>
                  <img className="cart-item-photo" src="/assets/shams/products/product-lifestyle-v2.png" alt="Sham's Masala Chai sachet beside a glass of chai" />
                  <div className="cart-item-body">
                    <div className="cart-item-line">
                      <div className="cart-item-titles">
                        <h2>Masala Chai</h2>
                        <p className="cart-item-meta">
                          {sizeLabel(size)} · {money(price)} each
                          {!inStock && <span className="cart-oos-tag">Out of stock</span>}
                        </p>
                      </div>
                      <strong className="cart-item-price">{money(price * cart.quantities[size])}</strong>
                    </div>

                    <div className="cart-item-actions">
                      <div className="quantity-control">
                        <button
                          type="button"
                          aria-label={'Remove one ' + size}
                          onClick={() => cart.setQuantity(size, cart.quantities[size] - 1)}
                        >
                          <Minus size={15} />
                        </button>
                        <output aria-label={size + ' quantity'}>{cart.quantities[size]}</output>
                        <button
                          type="button"
                          disabled={!inStock || cart.quantities[size] >= 20}
                          aria-label={'Add one ' + size}
                          onClick={() => cart.setQuantity(size, cart.quantities[size] + 1)}
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="cart-item-remove"
                        aria-label={'Remove ' + size + ' from cart'}
                        onClick={() => cart.setQuantity(size, 0)}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            <Link className="text-link cart-add-more" to="/the-collection">Add another pack</Link>
          </div>

          <aside className="cart-summary" aria-label="Order summary">
            <h2>Today’s pour</h2>
            <p><span>Subtotal</span><strong>{money(subtotal)}</strong></p>
            <p><span>Shipping</span><strong>{shipping ? money(shipping) : 'Complimentary'}</strong></p>
            {shipping > 0 && (
              <p className="cart-ship-hint">Add {money(FREE_SHIPPING_FROM - subtotal)} more for complimentary shipping.</p>
            )}
            <p className="cart-total"><span>Total</span><strong>{money(subtotal + shipping)}</strong></p>
            <button
              className="btn"
              disabled={checking || !!error || hasOutOfStockItems}
              onClick={() => navigate('/checkout')}
            >
              {checking ? 'Checking your order...' : hasOutOfStockItems ? 'Item Out of Stock' : 'Take these to the kettle'} <ArrowRight size={16} />
            </button>
            <small>Your shelf clears once your payment goes through.</small>
            <div className="cart-summary-trust">
              <ShieldCheck size={14} aria-hidden="true" />
              <span>Secure checkout · Dispatch in 24–48 hours</span>
            </div>
          </aside>
        </div>
      ) : (
        <div className="cart-empty">
          <ShoppingBag size={34} aria-hidden="true" />
          <h2>The shelf is waiting.</h2>
          <p>Choose a chai for the next quiet moment.</p>
          <Link to="/the-collection" className="btn">Find your next chai <ArrowRight size={16} /></Link>
        </div>
      )}
    </section>
  );
}
