import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';
import { cartPrices, cartSizes, useCart, CartSize } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import { api } from './utils/api';
import { money } from './components/ui';
import './CartPage.css';

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

  const getItemPrice = (size: CartSize) => (cart.prices ? cart.prices[size] : cartPrices[size]) || 349;
  const isItemInStock = (size: CartSize) => !cart.stockStatus || cart.stockStatus[size];

  const subtotal = cartSizes.reduce((sum, size) => sum + cart.quantities[size] * getItemPrice(size), 0);
  const shipping = subtotal >= 500 || subtotal === 0 ? 0 : 50;
  const hasOutOfStockItems = cartSizes.some((size) => cart.quantities[size] > 0 && !isItemInStock(size));

  return (
    <section className="cart-page">
      <div className="eyebrow">YOUR CHAI SHELF</div>
      <h1>Your next <em>cups.</em></h1>
      {location.state?.message && <p className="cart-notice" role="status">{location.state.message}</p>}
      {error && <p role="alert" className="form-error">{error}</p>}
      {hasOutOfStockItems && (
        <div className="cart-notice flex items-center gap-2 text-rose-800 bg-rose-50 border border-rose-200 p-3 rounded-xl mb-4" role="alert">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>One or more items in your cart are currently out of stock. Please remove them before proceeding to checkout.</span>
        </div>
      )}
      {cart.count ? (
        <div className="cart-layout">
          <div className="cart-items">
            {cartSizes.filter(size => cart.quantities[size] > 0).map(size => {
              const inStock = isItemInStock(size);
              const price = getItemPrice(size);

              return (
                <article className={`cart-item ${!inStock ? 'cart-item-oos' : ''}`} key={size}>
                  <img src="/assets/shams/products/product-lifestyle-v2.png" alt="Sham's Masala Chai sachet beside a glass of chai" />
                  <div>
                    <h2>Masala Chai</h2>
                    <p>
                      {size} · {money(price)} each
                      {!inStock && (
                        <span className="ml-2 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block">
                          Out of stock
                        </span>
                      )}
                    </p>
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
                  </div>
                  <div className="cart-item-total">
                    <strong>{money(price * cart.quantities[size])}</strong>
                    <button 
                      type="button" 
                      aria-label={'Remove ' + size + ' from cart'} 
                      onClick={() => cart.setQuantity(size, 0)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          <aside className="cart-summary">
            <h2>Today’s pour</h2>
            <p><span>Subtotal</span><strong>{money(subtotal)}</strong></p>
            <p><span>Shipping</span><strong>{shipping ? money(shipping) : 'Complimentary'}</strong></p>
            <p className="cart-total"><span>Total</span><strong>{money(subtotal + shipping)}</strong></p>
            <button 
              className="btn" 
              disabled={checking || !!error || hasOutOfStockItems} 
              onClick={() => navigate('/checkout')}
            >
              {checking ? 'Checking your order...' : hasOutOfStockItems ? 'Item Out of Stock' : 'Take these to the kettle'} <ArrowRight size={16} />
            </button>
            <small>Your shelf clears when your order is created.</small>
          </aside>
        </div>
      ) : (
        <div className="cart-empty">
          <ShoppingBag size={38} />
          <h2>The shelf is waiting.</h2>
          <p>Choose a chai for the next quiet moment.</p>
          <Link to="/the-collection" className="btn">Find your next chai <ArrowRight size={16} /></Link>
        </div>
      )}
      {!!cart.count && <Link className="text-link" to="/the-collection">Add another pack</Link>}
    </section>
  );
}
