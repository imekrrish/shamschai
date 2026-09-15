// Authenticated backend requests fail explicitly; checkout never fabricates success.
function normalizeApiBaseUrl(value: string): string {
  try {
    const url = new URL(value);
    if ((url.pathname === '' || url.pathname === '/') && !url.search && !url.hash) url.pathname = '/api';
    return url.toString().replace(/\/$/, '');
  } catch {
    return value.replace(/\/$/, '');
  }
}

export const API_BASE_URL = normalizeApiBaseUrl(__API_BASE_URL__ || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'));
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role?: string;
  createdAt?: string;
}

export interface Address {
  id: string;
  recipientName: string;
  phone: string;
  streetAddress: string;
  landmark?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  addressType: 'HOME' | 'WORK' | 'OTHER';
}

export interface OrderItem {
  id?: string;
  title: string;
  size: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  currency: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  notes?: string | null;
  createdAt: string;
  shippingSnapshot: {
    recipientName: string;
    phone: string;
    streetAddress: string;
    landmark?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
}


export interface PaymentIntent { keyId: string; razorpayOrderId: string; amount: number; currency: string; }
export interface PaymentResult { orderId: string; orderNumber: string; orderStatus: Order['status']; paymentStatus: Order['paymentStatus']; }
export interface PaymentVerification { orderId: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; }
export interface CheckoutPayload { requestId: string; items: { title: string; size: string; unitPrice: number; quantity: number }[]; shippingAddressId?: string; newAddress?: unknown; notes?: string; paymentMethod?: string; }

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const token = localStorage.getItem('shams_token');
  const response = await fetch(API_BASE_URL + path, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(45000),
  });
  const json = await response.json().catch(() => null);
  if (!response.ok || !json?.success) throw new Error(json?.message || 'The server could not complete your request. Please try again.');
  return json.data as T;
}
function normalizeOrder(order: Order): Order {
  return { ...order, subtotal: Number(order.subtotal), shippingFee: Number(order.shippingFee), totalAmount: Number(order.totalAmount), items: order.items.map(item => ({ ...item, unitPrice: Number(item.unitPrice), subtotal: Number(item.subtotal) })) };
}
export const api = {
  getPendingCheckout: () => request<Order | null>('/orders/pending-checkout').then(order => order ? normalizeOrder(order) : null),
  register: (data: { name: string; email: string; password: string; phone?: string }) => request<{ user: UserProfile; token: string }>('/auth/register', 'POST', data),
  login: (data: { email: string; password: string }) => request<{ user: UserProfile; token: string }>('/auth/login', 'POST', data),
  googleAuth: (data: unknown) => request<{ user: UserProfile; token: string }>('/auth/google', 'POST', data),
  getProfile: () => request<UserProfile>('/users/me'),
  updateProfile: (data: { name?: string; phone?: string }) => request<UserProfile>('/users/me', 'PUT', data),
  getAddresses: () => request<Address[]>('/addresses'),
  createAddress: (data: Omit<Address, 'id'>) => request<Address>('/addresses', 'POST', data),
  deleteAddress: (id: string) => request<void>('/addresses/' + encodeURIComponent(id), 'DELETE'),
  setDefaultAddress: (id: string) => request<void>('/addresses/' + encodeURIComponent(id) + '/default', 'PATCH'),
  createOrder: (data: CheckoutPayload) => request<{ order: Order; paymentIntent: PaymentIntent | null }>('/orders', 'POST', data).then(result => ({ ...result, order: normalizeOrder(result.order) })),
  getUserOrders: () => request<{ orders: Order[] }>('/orders').then(result => ({ ...result, orders: result.orders.map(normalizeOrder) })),
  getOrderById: (id: string) => request<Order>('/orders/' + encodeURIComponent(id)).then(normalizeOrder),
  cancelOrder: (id: string, notes?: string) => request<Order>('/orders/' + encodeURIComponent(id) + '/cancel', 'POST', { notes }),
  retryPayment: (orderId: string) => request<PaymentIntent>('/payments/retry', 'POST', { orderId }),
  verifyPayment: (data: PaymentVerification) => request<PaymentResult>('/payments/verify', 'POST', data),
  paymentStatus: (orderId: string) => request<PaymentResult>('/payments/order/' + encodeURIComponent(orderId)),
  getProducts: () => request<any[]>('/products'),
  getProduct: (idOrSlug: string) => request<any>('/products/' + encodeURIComponent(idOrSlug)),
};
