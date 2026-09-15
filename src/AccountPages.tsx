import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { api, Address, Order } from './utils/api';
import { Eyebrow, money } from './components/ui';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string | number>) => void;
        };
      };
    };
  }
}

export function AuthPage({ initialMode = 'login' }: { initialMode?: 'login' | 'register' }) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleButton = useRef<HTMLDivElement>(null);

  const { login, register, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, navigate, redirect]);

  useEffect(() => {
    const clientId = __GOOGLE_CLIENT_ID__;
    if (!clientId || !googleButton.current) return;

    const render = () => {
      const google = window.google;
      if (!google || !googleButton.current) return;
      google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          setError('');
          setLoading(true);
          try {
            await loginWithGoogle(credential);
            navigate(redirect, { replace: true });
          } catch (err: any) {
            setError(err.message || 'Google sign-in could not be completed.');
          } finally {
            setLoading(false);
          }
        },
      });
      google.accounts.id.renderButton(googleButton.current, { type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', width: 320 });
    };

    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]');
    if (existing) {
      existing.addEventListener('load', render);
      render();
      return () => existing.removeEventListener('load', render);
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.dataset.googleIdentity = 'true';
    script.addEventListener('load', render);
    document.head.appendChild(script);
    return () => script.removeEventListener('load', render);
  }, [loginWithGoogle, navigate, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        await register(name, email, password, phone);
      }
      navigate(redirect, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page section">
      <div className="auth-card">
        <div className="auth-header">
          <Eyebrow>SHAM’S CHAI ACCOUNT</Eyebrow>
          <h1>
            {mode === 'login' ? 'Welcome back to' : 'Join the table at'}
            <br />
            <em>Sham’s Chai.</em>
          </h1>
          <p>
            {mode === 'login'
              ? 'Sign in to track orders, manage addresses and enjoy seamless checkout.'
              : 'Create an account to save your delivery addresses and track fresh chai deliveries.'}
          </p>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={mode === 'login' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => {
              setMode('login');
              setError('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'auth-tab active' : 'auth-tab'}
            onClick={() => {
              setMode('register');
              setError('');
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="form-error auth-error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <label>
                FULL NAME
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Radhika Sharma"
                  required
                />
              </label>
              <label>
                PHONE NUMBER <small>OPTIONAL</small>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                />
              </label>
            </>
          )}

          <label>
            EMAIL ADDRESS
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            PASSWORD
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </label>

          <button className="btn auth-submit" type="submit" disabled={loading}>
            {loading ? 'PLEASE WAIT...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            <ArrowRight size={16} />
          </button>
        </form>

        {__GOOGLE_CLIENT_ID__ && (
          <div className="google-signin">
            <span>OR</span>
            <div ref={googleButton} aria-label="Continue with Google" />
          </div>
        )}

        <div className="auth-footer-note">
          <ShieldCheck size={16} />
          <span>Your information is encrypted, private and never shared.</span>
        </div>
      </div>
    </section>
  );
}

export function AccountPage() {
  const { user, logout, updateProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');

  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // New address state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    recipientName: '',
    phone: '',
    streetAddress: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    addressType: 'HOME' as 'HOME' | 'WORK' | 'OTHER',
    isDefault: false,
  });

  // Edit profile state
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate('/login?redirect=/account', { replace: true });
      return;
    }

    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
    }

    async function loadData() {
      try {
        const orderData = await api.getUserOrders();
        setOrders((orderData.orders || []).filter(order => ['PAID', 'REFUNDED'].includes(order.paymentStatus)));
        setOrdersError('');
      } catch (err) {
        console.error('Failed to load orders:', err);
        setOrdersError('Could not load your orders. Please refresh before placing another order.');
      } finally {
        setLoadingOrders(false);
      }

      try {
        const addressData = await api.getAddresses();
        setAddresses(addressData || []);
      } catch (err) {
        console.error('Failed to load addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    }

    loadData();
  }, [isAuthenticated, user, navigate]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createAddress(addressForm);
      setAddresses((prev) => {
        if (created.isDefault) {
          return [created, ...prev.map((a) => ({ ...a, isDefault: false }))];
        }
        return [created, ...prev];
      });
      setShowAddAddress(false);
      setAddressForm({
        recipientName: '',
        phone: '',
        streetAddress: '',
        landmark: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        addressType: 'HOME',
        isDefault: false,
      });
    } catch (err: any) {
      alert(err.message || 'Could not save address.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to remove this address?')) return;
    try {
      await api.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Could not delete address.');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await api.setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }))
      );
    } catch (err: any) {
      alert(err.message || 'Could not update default address.');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ name: profileName, phone: profilePhone });
      setProfileMessage('Profile updated successfully.');
      setTimeout(() => setProfileMessage(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Could not update profile.');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <section className="account-page section">
      <div className="account-container">
        {/* Profile Card Header */}
        <div className="account-header">
          <div className="account-avatar" aria-hidden="true">
            {(user as any).avatar ? (
              <img src={(user as any).avatar} alt={user.name} className="account-avatar-img" />
            ) : (
              user.name ? user.name.charAt(0).toUpperCase() : 'S'
            )}
          </div>
          <div className="account-title-area">
            <Eyebrow>CUSTOMER DASHBOARD</Eyebrow>
            <h1>{user.name || 'Dear Chai Lover'}</h1>
            <p className="account-meta">
              <span>{user.email}</span>
              {user.phone && <span>· {user.phone}</span>}
            </p>
          </div>
          <button className="btn btn-secondary logout-btn" onClick={logout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Dashboard Navigation Tabs */}
        <nav className="account-nav" aria-label="Account navigation">
          <button
            className={activeTab === 'orders' ? 'account-nav-btn active' : 'account-nav-btn'}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={18} />
            <span>Orders ({orders.length})</span>
          </button>
          <button
            className={activeTab === 'addresses' ? 'account-nav-btn active' : 'account-nav-btn'}
            onClick={() => setActiveTab('addresses')}
          >
            <MapPin size={18} />
            <span>Addresses ({addresses.length})</span>
          </button>
          <button
            className={activeTab === 'profile' ? 'account-nav-btn active' : 'account-nav-btn'}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            <span>Profile Settings</span>
          </button>
        </nav>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="account-tab-content">
            <div className="section-head-flex">
              <div>
                <h2>Your Chai Orders</h2>
                <p>Track your fresh masala chai parcels and past order history.</p>
              </div>
              <Link to="/products/masala-chai" className="btn btn-sm">
                Order Fresh Chai <ArrowRight size={14} />
              </Link>
            </div>

            {loadingOrders ? (
              <div className="account-loading">Loading your orders...</div>
            ) : ordersError ? (
              <p role="alert" className="form-error">{ordersError}</p>
            ) : orders.length === 0 ? (
              <div className="account-empty-state">
                <Package size={42} />
                <h3>No orders placed yet</h3>
                <p>When you place an order for Sham’s Masala Chai, you can track delivery and status right here.</p>
                <Link to="/checkout" className="btn">
                  Order Your First Pack <ChevronRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="order-list">
                {orders.map((order) => (
                  <article key={order.id || order.orderNumber} className="order-card">
                    <div className="order-card-header">
                      <div>
                        <span className="order-number">{order.orderNumber}</span>
                        <time className="order-date">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </time>
                      </div>
                      <div className="order-badges">
                        <span className={`status-badge status-${order.status.toLowerCase()}`}>
                          {order.status === 'CONFIRMED' && <CheckCircle2 size={13} />}
                          {order.status === 'PENDING' && <Clock size={13} />}
                          {order.status}
                        </span>
                        <span className={`payment-badge payment-${order.paymentStatus.toLowerCase()}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="order-items-grid">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item-row">
                          <div>
                            <strong>{item.title}</strong>
                            <small>Pack: {item.size} × {item.quantity}</small>
                          </div>
                          <span className="item-price">{money(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-card-footer">
                      <div className="order-delivery-address">
                        <MapPin size={15} />
                        <div>
                          <strong>{order.shippingSnapshot?.recipientName || user.name}</strong>
                          <p>
                            {order.shippingSnapshot?.streetAddress}, {order.shippingSnapshot?.city} -{' '}
                            {order.shippingSnapshot?.postalCode}
                          </p>
                        </div>
                      </div>

                      <div className="order-total-action">
                        <Link className="btn btn-outline btn-sm" to={`/order-confirmation/${order.orderNumber}`}>
                          {order.status === 'PENDING' ? 'View / Complete Payment' : 'View Order'}
                        </Link>
                        <div className="order-total-block">
                          <small>TOTAL AMOUNT</small>
                          <strong>{money(order.totalAmount)}</strong>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Addresses */}
        {activeTab === 'addresses' && (
          <div className="account-tab-content">
            <div className="section-head-flex">
              <div>
                <h2>Saved Delivery Addresses</h2>
                <p>Manage your shipping addresses for rapid, one-click checkout.</p>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setShowAddAddress((prev) => !prev)}
              >
                <Plus size={16} /> {showAddAddress ? 'Close Form' : 'Add New Address'}
              </button>
            </div>

            {showAddAddress && (
              <form className="address-form-box" onSubmit={handleAddAddress}>
                <h3>Add a New Address</h3>
                <div className="field-grid">
                  <label>
                    RECIPIENT NAME
                    <input
                      required
                      value={addressForm.recipientName}
                      onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                      placeholder="e.g. Radhika Sharma"
                    />
                  </label>
                  <label>
                    PHONE NUMBER
                    <input
                      required
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="10-digit mobile"
                    />
                  </label>
                  <label className="wide">
                    STREET ADDRESS
                    <textarea
                      required
                      rows={2}
                      value={addressForm.streetAddress}
                      onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
                      placeholder="House, Flat, Building, Street"
                    />
                  </label>
                  <label>
                    LANDMARK <small>OPTIONAL</small>
                    <input
                      value={addressForm.landmark}
                      onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                      placeholder="Near park or temple"
                    />
                  </label>
                  <label>
                    CITY
                    <input
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    />
                  </label>
                  <label>
                    STATE
                    <input
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    />
                  </label>
                  <label>
                    PIN CODE
                    <input
                      required
                      maxLength={6}
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    />
                  </label>
                  <label>
                    ADDRESS TYPE
                    <select
                      value={addressForm.addressType}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, addressType: e.target.value as any })
                      }
                    >
                      <option value="HOME">Home</option>
                      <option value="WORK">Work</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </label>
                </div>

                <label className="policy-check">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  />
                  <span>Make this my default shipping address</span>
                </label>

                <div className="address-form-actions">
                  <button className="btn" type="submit">
                    Save Address
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddAddress(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {loadingAddresses ? (
              <div className="account-loading">Loading saved addresses...</div>
            ) : addresses.length === 0 ? (
              <div className="account-empty-state">
                <MapPin size={42} />
                <h3>No saved addresses</h3>
                <p>Save your home or office address to speed through checkout.</p>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowAddAddress(true)}
                >
                  Add Your Address
                </button>
              </div>
            ) : (
              <div className="addresses-grid">
                {addresses.map((addr) => (
                  <div key={addr.id} className={`address-card ${addr.isDefault ? 'default-card' : ''}`}>
                    <div className="address-card-header">
                      <span className="address-type-tag">{addr.addressType || 'HOME'}</span>
                      {addr.isDefault && <span className="default-badge">DEFAULT</span>}
                    </div>
                    <strong>{addr.recipientName}</strong>
                    <p>{addr.streetAddress}</p>
                    {addr.landmark && <small className="landmark">Landmark: {addr.landmark}</small>}
                    <p>
                      {addr.city}, {addr.state} — {addr.postalCode}
                    </p>
                    <p className="address-phone">Phone: {addr.phone}</p>

                    <div className="address-card-actions">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          className="text-btn"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDeleteAddress(addr.id)}
                        aria-label="Delete address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="account-tab-content">
            <div className="section-head-flex">
              <div>
                <h2>Personal Details</h2>
                <p>Update your display name and contact phone number.</p>
              </div>
            </div>

            {profileMessage && (
              <div className="profile-alert success">
                <Sparkles size={16} /> {profileMessage}
              </div>
            )}

            <form className="profile-form" onSubmit={handleUpdateProfile}>
              <label>
                FULL NAME
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                />
              </label>
              <label>
                EMAIL ADDRESS
                <input type="email" value={user.email} disabled className="disabled-input" />
                <small>Email address cannot be changed.</small>
              </label>
              <label>
                PHONE NUMBER
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                />
              </label>

              <button className="btn" type="submit">
                Save Changes
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
