import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, MapPin, Calendar, ShieldCheck, Clock } from 'lucide-react';
import { api, Order } from './utils/api';
import { Eyebrow, money } from './components/ui';
import { openPayment } from './utils/razorpay';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';

export function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const { user } = useAuth();
  const { complete } = useCart();
  const paid = order?.paymentStatus === 'PAID';
  useEffect(() => { if (paid && order) complete(order.id); }, [paid, order?.id, complete]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    async function fetchOrder() {
      if (!orderNumber) { setLoading(false); return; }
      try {
        let found = await api.getOrderById(orderNumber);
        if (found.paymentStatus === 'PENDING') {
          await api.paymentStatus(found.id).catch(() => undefined);
          found = await api.getOrderById(orderNumber);
        }
        if (cancelled) return;
        setOrder(found); setError('');
        if (found.paymentStatus === 'PENDING' && attempts++ < 20) timer = setTimeout(fetchOrder, 3000);
      } catch { if (!cancelled) setError('Unable to load your order. Sign in and check My Orders, or refresh to retry.'); }
      finally { if (!cancelled) setLoading(false); }
    }
    void fetchOrder();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [orderNumber]);

  async function retryPayment() {
    if (!order || paying) return;
    setPaying(true); setError('');
    try {
      await api.paymentStatus(order.id);
      const latest = await api.getOrderById(order.id);
      setOrder(latest);
      if (latest.paymentStatus === 'PAID') return;
      const intent = await api.retryPayment(order.id);
      await openPayment(order.id, intent, user);
      setOrder(await api.getOrderById(order.id));
    } catch (err) { setError(err instanceof Error ? err.message : 'Payment could not be completed.'); }
    finally { setPaying(false); }
  }

  return (
    <section className="confirmation-page section">
      <div className="confirmation-card">
        <div className="confirmation-badge" aria-hidden="true">
          {paid ? <CheckCircle size={52} /> : <Clock size={52} />}
        </div>

        <Eyebrow>{loading ? 'CHECKING ORDER' : paid ? 'PAYMENT CONFIRMED' : order?.paymentStatus === 'REFUNDED' ? 'PAYMENT REFUNDED' : 'ORDER STATUS'}</Eyebrow>
        <h1>
          Thank you for choosing
          <br />
          <em>Sham’s Chai.</em>
        </h1>
        <p className="confirmation-subtitle">
          {paid ? 'Your payment is confirmed. You can track your order in My Orders.' : 'Payment is confirmed only after verification. If you were charged, wait for the status to update before retrying.'}
        </p>

        {loading ? (
          <div className="account-loading">Retrieving order confirmation...</div>
        ) : order ? (
          <div className="confirmation-details">
            <div className="confirmation-meta-bar">
              <div>
                <small>ORDER NUMBER</small>
                <strong>{order.orderNumber}</strong>
              </div>
              <div>
                <small>ESTIMATED DISPATCH</small>
                <strong>{paid && order?.status !== 'CANCELLED' ? 'Within 24-48 hours' : 'Not scheduled'}</strong>
              </div>
              <div>
                <small>PAYMENT STATUS</small>
                <span className={`payment-badge payment-${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus}</span>
              </div>
            </div>

            <div className="confirmation-items">
              <h3>Items in your parcel</h3>
              {order.items.map((item, idx) => (
                <div key={idx} className="confirmation-item-row">
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.size} × {item.quantity}</span>
                  </div>
                  <strong>{money(item.subtotal)}</strong>
                </div>
              ))}

              <div className="confirmation-summary-rows">
                <div>
                  <span>Subtotal</span>
                  <span>{money(order.subtotal)}</span>
                </div>
                <div>
                  <span>Shipping</span>
                  <span>{order.shippingFee === 0 ? 'COMPLIMENTARY' : money(order.shippingFee)}</span>
                </div>
                <div className="confirmation-total-row">
                  <strong>{paid ? 'Total Paid' : 'Order Total'}</strong>
                  <strong>{money(order.totalAmount)}</strong>
                </div>
              </div>
            </div>

            <div className="confirmation-shipping-snapshot">
              <div className="shipping-icon"><MapPin size={20} /></div>
              <div>
                <small>DELIVERING TO</small>
                <strong>{order.shippingSnapshot?.recipientName}</strong>
                <p>
                  {order.shippingSnapshot?.streetAddress}
                  {order.shippingSnapshot?.landmark ? `, Near ${order.shippingSnapshot.landmark}` : ''},<br />
                  {order.shippingSnapshot?.city}, {order.shippingSnapshot?.state} - {order.shippingSnapshot?.postalCode}
                </p>
                <small>Contact: {order.shippingSnapshot?.phone}</small>
              </div>
            </div>
          </div>
        ) : (
          <div className="confirmation-fallback">
            <p>Order confirmation is unavailable. Please check My Orders.</p>
          </div>
        )}

        {error && <p role="alert" className="form-error">{error}</p>}
        {order?.status === 'PENDING' && order.paymentStatus !== 'PAID' && order.paymentStatus !== 'REFUNDED' &&
          <button type="button" className="btn" disabled={paying} onClick={retryPayment}>{paying ? 'Opening payment...' : 'Retry payment'}</button>}
        <div className="confirmation-actions">
          <Link to="/account" className="btn">
            View in My Orders <ArrowRight size={16} />
          </Link>
          <Link to="/products" className="btn btn-secondary">
            Explore More Blends
          </Link>
        </div>

        <div className="confirmation-trust">
          <ShieldCheck size={16} />
          <span>FSSAI Certified Blend · 100% Assam Whole Leaf CTC &amp; Kerala Spices</span>
        </div>
      </div>
    </section>
  );
}
