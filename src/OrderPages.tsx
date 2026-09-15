import { FormEvent, useMemo, useState, useEffect, useRef } from 'react';
import { ArrowRight, Check, ChevronLeft, Minus, Plus, ShieldCheck, CreditCard, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eyebrow, money } from './components/ui';
import { products } from './data/products';
import { useAuth } from './context/AuthContext';
import { api, Address } from './utils/api';
import { loadRazorpay, openPayment } from './utils/razorpay';
import { useCart } from './context/CartContext';
import { checkoutFingerprint } from './utils/checkoutFingerprint';

const sizes = ['200g', '500g', '1000g'] as const;
type Size = typeof sizes[number];

const sizePrices: Record<Size, number> = {
  '200g': 349,
  '500g': 799,
  '1000g': 1499,
};

export function Checkout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const cart = useCart();

  const initial = sizes.includes(params.get('size') as Size) ? (params.get('size') as Size) : '200g';
  const requested = Number(params.get('quantity') || 1);
  const initialQuantity = Number.isFinite(requested) ? Math.max(1, Math.min(20, Math.floor(requested))) : 1;

  const [quantities, setQuantities] = useState<Record<Size, number>>(() =>
    Object.fromEntries(sizes.map((size) => [size, params.has('size') && size === initial ? initialQuantity : cart.count ? cart.quantities[size] : size === initial ? initialQuantity : 0])) as Record<Size, number>
  );
  useEffect(() => { cart.replace(quantities); }, [quantities, cart.replace]);

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [useNewAddress, setUseNewAddress] = useState(false);

  // Form fields for address
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');

  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);

  // Load saved addresses if user is logged in
  useEffect(() => {
    if (isAuthenticated) {
      api.getAddresses().then((addrs) => {
        setSavedAddresses(addrs);
        const def = addrs.find((a) => a.isDefault) || addrs[0];
        if (def) {
          setSelectedAddressId(def.id);
          setUseNewAddress(false);
        } else {
          setUseNewAddress(true);
        }
      }).catch(console.warn);
    } else {
      setUseNewAddress(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  const totalPacks = useMemo(() => Object.values(quantities).reduce((sum, qty) => sum + qty, 0), [quantities]);
  const subtotal = useMemo(
    () => sizes.reduce((sum, size) => sum + quantities[size] * (cart.prices ? cart.prices[size] : sizePrices[size]), 0),
    [quantities, cart.prices]
  );
  const shippingFee = subtotal >= 500 || subtotal === 0 ? 0 : 50;
  const grandTotal = subtotal + shippingFee;

  const change = (size: Size, delta: number) => {
    if (delta > 0 && cart.stockStatus && !cart.stockStatus[size]) {
      setError(`${size} pack is currently out of stock.`);
      return;
    }
    setError('');
    setQuantities((current) => ({
      ...current,
      [size]: Math.max(0, Math.min(20, current[size] + delta)),
    }));
  };

  const [showAddressConfirm, setShowAddressConfirm] = useState(false);

  const resolveCurrentAddress = () => {
    if (!useNewAddress && selectedAddressId !== 'new') {
      const found = savedAddresses.find((a) => a.id === selectedAddressId);
      if (found) return found;
    }
    return {
      recipientName: name,
      phone,
      streetAddress: address,
      landmark: landmark || undefined,
      city,
      state,
      postalCode: pincode,
      country: 'India',
    };
  };

  async function executeOrderPlacement() {
    if (submitting.current) return;
    if (!isAuthenticated) { navigate('/login?redirect=/checkout'); return; }
    submitting.current = true;
    setIsSubmitting(true);
    setError('');

    try {
      // Build order items
      const items = sizes
        .filter((s) => quantities[s] > 0)
        .map((s) => ({
          title: "Sham's Masala Chai",
          size: s,
          unitPrice: cart.prices ? cart.prices[s] : sizePrices[s],
          quantity: quantities[s],
        }));

      let orderPayload: any = {
        items,
        notes: notes || undefined,
        paymentMethod: 'RAZORPAY',
      };

      if (!useNewAddress && selectedAddressId !== 'new') {
        orderPayload.shippingAddressId = selectedAddressId;
      } else {
        orderPayload.newAddress = {
          recipientName: name,
          phone,
          streetAddress: address,
          landmark: landmark || undefined,
          city,
          state,
          postalCode: pincode,
          country: 'India',
        };
      }

      // Keep the same request ID across retries and reloads, including uncertain network failures.
      const fingerprint = await checkoutFingerprint(items, resolveCurrentAddress(), notes || '');
      const storageKey = 'shams_checkout_' + user!.id;
      let saved: { fingerprint: string; requestId: string } | null = null;
      try { saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null'); } catch { /* Start a new checkout if storage is invalid. */ }
      const requestId = saved?.fingerprint === fingerprint ? saved.requestId : cart.pending?.userId === user!.id && cart.pending.fingerprint === fingerprint ? cart.pending.orderId : crypto.randomUUID();
      sessionStorage.setItem(storageKey, JSON.stringify({ fingerprint, requestId }));
      await loadRazorpay();
      const { order, paymentIntent } = await api.createOrder({ ...orderPayload, requestId });
      cart.rememberPayment({ orderId: order.id, userId: user!.id, quantities: { ...quantities }, fingerprint });
      cart.complete(order.id);
      if (order.paymentStatus !== 'PAID') {
        if (!paymentIntent) throw new Error('This order cannot be paid. Please check My Orders.');
        await openPayment(order.id, paymentIntent, user);
      }
      sessionStorage.removeItem(storageKey);
      cart.complete(order.id);
      navigate('/order-confirmation/' + order.orderNumber);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to place order. Please check details and try again.');
      setIsSubmitting(false);
      setShowAddressConfirm(false);
      navigate('/cart', { state: { message: err.message || 'Checkout was interrupted. Your packs are saved in your cart.' } });
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login?redirect=/checkout'); return; }
    if (totalPacks < 1) {
      setError('Please choose at least one pack of chai.');
      return;
    }
    for (const s of sizes) {
      if (quantities[s] > 0 && cart.stockStatus && !cart.stockStatus[s]) {
        setError(`Sham's Masala Chai (${s}) is currently out of stock. Please remove it from your selection.`);
        return;
      }
    }
    if (!agreed) {
      setError('Please accept the refund and replacement policy before continuing.');
      return;
    }

    // If using new address, validate required fields before opening confirmation
    if (useNewAddress || selectedAddressId === 'new') {
      if (!name.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
        setError('Please fill in all required delivery address fields.');
        return;
      }
    }

    setError('');
    setShowAddressConfirm(true);
  }

  const currentAddress = resolveCurrentAddress();

  return (
    <section className="checkout-page section">
      <div className="checkout-heading">
        <Link to="/products/masala-chai" className="checkout-back">
          <ChevronLeft /> BACK TO THE BLEND
        </Link>
        <Eyebrow>ONE LAST POUR</Eyebrow>
        <h1>
          Your chai,
          <br />
          <em>packed with care.</em>
        </h1>
        <p>
          Select your pack sizes, confirm delivery details, and place your order directly through our secure checkout.
        </p>

        {!isAuthenticated && (
          <div className="checkout-auth-banner">
            <span>Already have an account?</span>
            <Link to="/login?redirect=/checkout" className="btn btn-sm btn-outline">
              Sign In for Faster Checkout
            </Link>
          </div>
        )}

        <div className="checkout-trust">
          <ShieldCheck />
          <span>
            <b>Encrypted In-App Checkout</b>
            <small>Complimentary pan-India delivery on orders above ₹500.</small>
          </span>
        </div>
      </div>

      <form className="checkout-form" onSubmit={submit}>
        {/* Step 01: Packs */}
        <div className="checkout-section">
          <span className="checkout-step">01</span>
          <div>
            <h2>Choose your packs</h2>
            <p>Select the quantity you need in each handcrafted size.</p>
          </div>
        </div>

        <div className="pack-chooser">
          {sizes.map((size) => {
            const isOos = cart.stockStatus && !cart.stockStatus[size];
            const currentPrice = cart.prices ? cart.prices[size] : sizePrices[size];
            return (
              <div 
                className={`${quantities[size] ? 'pack-choice active' : 'pack-choice'} ${isOos ? 'pack-choice-oos' : ''}`} 
                key={size}
                style={isOos ? { opacity: 0.8 } : undefined}
              >
                <div>
                  <span>SHAM'S MASALA CHAI</span>
                  <strong>{size}</strong>
                  <span className="pack-price-tag">{money(currentPrice)}</span>
                  {isOos && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 mt-1 inline-block">
                      Sold Out
                    </span>
                  )}
                </div>
                <div className="quantity-control" aria-label={`${size} quantity`}>
                  <button
                    type="button"
                    onClick={() => change(size, -1)}
                    aria-label={`Remove one ${size} pack`}
                    disabled={quantities[size] === 0}
                  >
                    <Minus />
                  </button>
                  <output aria-live="polite">{quantities[size]}</output>
                  <button
                    type="button"
                    onClick={() => change(size, 1)}
                    aria-label={`Add one ${size} pack`}
                    disabled={isOos || quantities[size] >= 20}
                    style={isOos ? { cursor: 'not-allowed', opacity: 0.4 } : undefined}
                  >
                    <Plus />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step 02: Delivery Details */}
        <div className="checkout-section details-title">
          <span className="checkout-step">02</span>
          <div>
            <h2>Delivery details</h2>
            <p>Where should we deliver your freshly blended chai?</p>
          </div>
        </div>

        {isAuthenticated && savedAddresses.length > 0 && (
          <div className="saved-addresses-selector">
            <label className="selector-title">SELECT SAVED ADDRESS</label>
            <div className="saved-addr-options">
              {savedAddresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`saved-addr-label ${!useNewAddress && selectedAddressId === addr.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="address-choice"
                    checked={!useNewAddress && selectedAddressId === addr.id}
                    onChange={() => {
                      setSelectedAddressId(addr.id);
                      setUseNewAddress(false);
                    }}
                  />
                  <div>
                    <strong>
                      {addr.recipientName} {addr.isDefault && <small>(Default)</small>}
                    </strong>
                    <p>
                      {addr.streetAddress}, {addr.city} - {addr.postalCode}
                    </p>
                    <small>Phone: {addr.phone}</small>
                  </div>
                </label>
              ))}

              <label className={`saved-addr-label ${useNewAddress ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="address-choice"
                  checked={useNewAddress}
                  onChange={() => setUseNewAddress(true)}
                />
                <div>
                  <strong>+ Enter a different address</strong>
                  <p>Ship to another location or gift recipient</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {useNewAddress && (
          <div className="field-grid">
            <label>
              FULL NAME
              <input
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Recipient name"
              />
            </label>
            <label>
              PHONE NUMBER
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
              />
            </label>
            <label className="wide">
              DELIVERY ADDRESS
              <textarea
                name="address"
                autoComplete="street-address"
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/flat number, apartment name, street and locality"
              />
            </label>
            <label>
              LANDMARK <small>OPTIONAL</small>
              <input
                name="landmark"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Nearby landmark"
              />
            </label>
            <label>
              CITY
              <input
                name="city"
                autoComplete="address-level2"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </label>
            <label>
              STATE
              <input
                name="state"
                autoComplete="address-level1"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </label>
            <label>
              PIN CODE
              <input
                name="pincode"
                inputMode="numeric"
                autoComplete="postal-code"
                required
                pattern="[0-9]{6}"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="6 digits"
              />
            </label>
          </div>
        )}

        <div className="full-input-group">
          <label htmlFor="checkout-notes">
            ORDER NOTES <small>OPTIONAL</small>
          </label>
          <input
            id="checkout-notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special delivery instructions, gift message, etc."
          />
        </div>

        {/* Step 03: Payment Method */}
        <div className="checkout-section details-title">
          <span className="checkout-step">03</span>
          <div>
            <h2>Payment Method</h2>
            <p>Pay securely through Razorpay.</p>
          </div>
        </div>

        <div className="payment-method-selector">
          <label className="payment-method-card selected">
            <input type="radio" name="payment-method" defaultChecked />
            <CreditCard size={20} />
            <div>
              <strong>Razorpay ? UPI, Cards & Netbanking</strong>
              <small>Choose from the payment methods available in the secure payment window.</small>
            </div>
          </label>
        </div>

        {/* Order Price Summary */}
        <div className="checkout-cost-breakdown">
          <div className="cost-row">
            <span>Subtotal ({totalPacks} {totalPacks === 1 ? 'pack' : 'packs'})</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="cost-row">
            <span>Shipping</span>
            <span>{shippingFee === 0 ? <strong className="complimentary">FREE</strong> : money(shippingFee)}</span>
          </div>
          {shippingFee > 0 && (
            <p className="shipping-hint">Add ₹{500 - subtotal} more for Complimentary Free Shipping!</p>
          )}
          <div className="cost-row total-cost-row">
            <strong>TOTAL PAYABLE</strong>
            <strong>{money(grandTotal)}</strong>
          </div>
        </div>

        <label className="policy-check">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>
            I have read and agree to the <Link to="/return-refund-policy" target="_blank">Return, Refund &amp; Cancellation Policy</Link>.
          </span>
        </label>

        {error && (
          <div className="form-error auth-error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="checkout-submit">
          <div>
            <span>TOTAL AMOUNT</span>
            <strong>{money(grandTotal)}</strong>
          </div>
          <button className="btn order-submit-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'SETTING YOUR ORDER...' : 'MAKE THIS CUP YOURS'} <ArrowRight />
          </button>
        </div>

        <p className="checkout-fineprint">
          Instant confirmation. Once confirmed, you will receive real-time order status and tracking in your account dashboard.
        </p>
      </form>

      {/* First-Time / New Order Address Confirmation Modal */}
      {showAddressConfirm && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
          <div className="address-confirm-modal">
            <div className="modal-icon-badge">
              <MapPin size={28} />
            </div>
            <Eyebrow>VERIFY DELIVERY DETAILS</Eyebrow>
            <h2 id="confirm-modal-title">Confirm Your Delivery Address</h2>
            <p className="modal-subtitle">
              Please double-check your shipping details so we can deliver your freshly packed chai without delay.
            </p>

            <div className="confirm-address-box">
              <div className="confirm-field">
                <small>RECIPIENT NAME</small>
                <strong>{currentAddress.recipientName}</strong>
              </div>
              <div className="confirm-field">
                <small>PHONE NUMBER</small>
                <strong>{currentAddress.phone}</strong>
              </div>
              <div className="confirm-field">
                <small>SHIPPING ADDRESS</small>
                <p>
                  {currentAddress.streetAddress}
                  {currentAddress.landmark ? `, Near ${currentAddress.landmark}` : ''},<br />
                  {currentAddress.city}, {currentAddress.state} — <strong>{currentAddress.postalCode}</strong>
                </p>
              </div>
              <div className="confirm-field order-total-preview">
                <small>ORDER TOTAL</small>
                <strong>{money(grandTotal)}</strong>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn confirm-pay-btn"
                onClick={executeOrderPlacement}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'PLACING YOUR ORDER...' : `CONFIRM ADDRESS & PAY ${money(grandTotal)}`} <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddressConfirm(false)}
                disabled={isSubmitting}
              >
                Edit / Change Address
              </button>
            </div>

            <small className="modal-trust-footnote">
              <ShieldCheck size={14} /> Packed fresh on order · Dispatch within 24–48 hours
            </small>
          </div>
        </div>
      )}
    </section>
  );
}

export function RefundPolicy() {
  return (
    <section className="policy-page">
      <div className="policy-hero">
        <Eyebrow>CUSTOMER CARE</Eyebrow>
        <h1>
          Refund &amp;
          <br />
          <em>replacement policy.</em>
        </h1>
        <p>Simple, fair and written for a consumable artisanal food product.</p>
      </div>

      <article className="policy-copy">
        <p className="policy-lead">
          Because tea is a freshly packed food product, we cannot accept returns or exchanges for a change of mind once an order has been dispatched.
        </p>

        <h2>Damaged, incorrect or missing items</h2>
        <p>
          If your order arrives damaged, unsealed, incorrect or incomplete, please reach out directly through your account dashboard or email us at{' '}
          <a href="mailto:support@shamschai.com">support@shamschai.com</a> within 48 hours of delivery. Please include your order number and clear photos of the outer package and affected item.
        </p>

        <h2>When a refund or replacement applies</h2>
        <p>
          After reviewing the details, our customer care team will arrange an immediate replacement or process a full refund to your original payment method. Please keep the product and outer carton until your request is resolved.
        </p>

        <h2>Order Cancellations</h2>
        <p>
          You may cancel an order directly from your <Link to="/account">Customer Account</Link> anytime before dispatch. Once dispatched, transit is underway and the order cannot ordinarily be cancelled. If Sham's cannot fulfil an accepted order, any amount paid will be returned in full within 3–5 banking days.
        </p>

        <h2>Refund timing</h2>
        <p>
          Approved refunds are initiated to the original payment method. Bank or card processing times may take 3–5 business days to reflect in your account statement.
        </p>

        <div className="policy-note">
          <Check />
          <div>
            <b>Need help with an order?</b>
            <p>Our customer support team is here for you every day.</p>
            <Link className="text-link" to="/contact">
              CONTACT SUPPORT <ArrowRight />
            </Link>
          </div>
        </div>

        <small>Last updated: September 2026</small>
      </article>
    </section>
  );
}
