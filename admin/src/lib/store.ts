import { Product, Order, Payment, OrderStatus, PaymentStatus, AnalyticsSummary } from './types';
import { SEED_ADMIN, SEED_PRODUCTS, SEED_ORDERS, SEED_PAYMENTS, SEED_DAILY_REVENUE } from './seed-data';

interface AppStore {
  products: Product[];
  orders: Order[];
  payments: Payment[];
  dailyRevenue: typeof SEED_DAILY_REVENUE;
}

// Global cache for serverless invocation reuse
declare global {
  // eslint-disable-next-line no-var
  var __SHAMS_CHAI_ADMIN_STORE__: AppStore | undefined;
}

function getStore(): AppStore {
  if (!global.__SHAMS_CHAI_ADMIN_STORE__) {
    global.__SHAMS_CHAI_ADMIN_STORE__ = {
      products: JSON.parse(JSON.stringify(SEED_PRODUCTS)),
      orders: JSON.parse(JSON.stringify(SEED_ORDERS)),
      payments: JSON.parse(JSON.stringify(SEED_PAYMENTS)),
      dailyRevenue: JSON.parse(JSON.stringify(SEED_DAILY_REVENUE))
    };
  }
  return global.__SHAMS_CHAI_ADMIN_STORE__;
}

export const db = {
  // Auth
  getAdmin() {
    return SEED_ADMIN;
  },

  // Products
  getProducts(): Product[] {
    return getStore().products;
  },

  getProductById(id: string): Product | undefined {
    return getStore().products.find(p => p.id === id || p.slug === id || (id === 'recipe-01' && p.slug === 'masala-chai') || (id === 'masala-chai' && (p.id === 'recipe-01' || p.slug === 'recipe-01')));
  },

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const store = getStore();
    const index = store.products.findIndex(p => p.id === id || p.slug === id || (id === 'recipe-01' && p.slug === 'masala-chai') || (id === 'masala-chai' && (p.id === 'recipe-01' || p.slug === 'recipe-01')));
    if (index === -1) return null;

    store.products[index] = {
      ...store.products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return store.products[index];
  },

  createProduct(data: Omit<Product, 'id' | 'salesCount' | 'updatedAt'>): Product {
    const store = getStore();
    const newProduct: Product = {
      ...data,
      id: `prod_${Date.now()}`,
      salesCount: 0,
      updatedAt: new Date().toISOString()
    };
    store.products.unshift(newProduct);
    return newProduct;
  },

  deleteProduct(id: string): boolean {
    const store = getStore();
    const initialLen = store.products.length;
    store.products = store.products.filter(p => p.id !== id);
    return store.products.length < initialLen;
  },

  // Orders
  getOrders(filters?: { status?: string; search?: string }): Order[] {
    let list = [...getStore().orders];

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter(o => o.status.toUpperCase() === filters.status?.toUpperCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(o => 
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.shippingAddress.city.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getOrderById(id: string): Order | undefined {
    return getStore().orders.find(o => o.id === id || o.orderNumber === id);
  },

  updateOrderStatus(id: string, status: OrderStatus, paymentStatus?: PaymentStatus): Order | null {
    const store = getStore();
    const order = store.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) return null;

    order.status = status;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    order.updatedAt = new Date().toISOString();

    // Also sync payment record if status changed to DELIVERED or CANCELLED
    const payment = store.payments.find(p => p.orderId === order.id || p.orderNumber === order.orderNumber);
    if (payment) {
      if (status === 'CANCELLED') {
        payment.status = 'REFUNDED';
        payment.settlementStatus = 'REFUNDED';
      } else if (order.paymentStatus === 'PAID') {
        payment.status = 'PAID';
        if (!payment.paidAt) payment.paidAt = new Date().toISOString();
      }
    }

    return order;
  },

  // Payments
  getPayments(filters?: { status?: string; provider?: string; search?: string }): Payment[] {
    let list = [...getStore().payments];

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter(p => p.status.toUpperCase() === filters.status?.toUpperCase());
    }

    if (filters?.provider && filters.provider !== 'ALL') {
      list = list.filter(p => p.provider.toUpperCase() === filters.provider?.toUpperCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => 
        p.transactionRef.toLowerCase().includes(q) ||
        p.orderNumber.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.customerEmail.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  updatePaymentStatus(id: string, status: PaymentStatus, settlement?: Payment['settlementStatus']): Payment | null {
    const store = getStore();
    const payment = store.payments.find(p => p.id === id || p.transactionRef === id);
    if (!payment) return null;

    payment.status = status;
    if (settlement) payment.settlementStatus = settlement;
    if (status === 'PAID' && !payment.paidAt) payment.paidAt = new Date().toISOString();

    // Sync order if present
    const order = store.orders.find(o => o.id === payment.orderId || o.orderNumber === payment.orderNumber);
    if (order) {
      order.paymentStatus = status;
    }

    return payment;
  },

  // Analytics Aggregation
  getAnalytics(): AnalyticsSummary {
    const store = getStore();
    const paidPayments = store.payments.filter(p => p.status === 'PAID');
    const totalRevenue = paidPayments.reduce((acc, p) => acc + p.amount, 0);
    const totalOrders = store.orders.length;
    const deliveredCount = store.orders.filter(o => o.status === 'DELIVERED').length;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / (paidPayments.length || 1)) : 0;
    const paidRatePercent = totalOrders > 0 ? Math.round((paidPayments.length / totalOrders) * 100) : 100;
    const outOfStockCount = store.products.reduce((acc, p) => acc + p.variants.filter(v => !v.stock).length, 0);

    const orderStatusCounts: Record<OrderStatus, number> = {
      PENDING: store.orders.filter(o => o.status === 'PENDING').length,
      CONFIRMED: store.orders.filter(o => o.status === 'CONFIRMED').length,
      PROCESSING: store.orders.filter(o => o.status === 'PROCESSING').length,
      SHIPPED: store.orders.filter(o => o.status === 'SHIPPED').length,
      DELIVERED: deliveredCount,
      CANCELLED: store.orders.filter(o => o.status === 'CANCELLED').length,
    };

    const paymentStatusCounts: Record<PaymentStatus, number> = {
      PAID: paidPayments.length,
      PENDING: store.payments.filter(p => p.status === 'PENDING').length,
      FAILED: store.payments.filter(p => p.status === 'FAILED').length,
      REFUNDED: store.payments.filter(p => p.status === 'REFUNDED').length,
    };

    const totalSalesVol = store.products.reduce((acc, p) => acc + p.salesCount, 0);
    const salesByBlend = store.products.map(p => ({
      name: p.name.replace('Sham’s ', ''),
      sales: p.salesCount,
      revenue: p.salesCount * (p.variants[0]?.price || 349),
      percentage: totalSalesVol > 0 ? Math.round((p.salesCount / totalSalesVol) * 100) : 20
    }));

    return {
      totalRevenue,
      revenueGrowthMonth: 18.4,
      totalOrders,
      ordersGrowthMonth: 12.5,
      averageOrderValue,
      aovGrowthMonth: 5.2,
      paidRatePercent,
      activeProducts: store.products.length,
      outOfStockCount,
      recentOrders: store.orders.slice(0, 5),
      recentPayments: store.payments.slice(0, 5),
      dailyRevenue: store.dailyRevenue,
      salesByBlend,
      orderStatusCounts,
      paymentStatusCounts
    };
  },

  // Reset to seed data
  reset() {
    global.__SHAMS_CHAI_ADMIN_STORE__ = {
      products: JSON.parse(JSON.stringify(SEED_PRODUCTS)),
      orders: JSON.parse(JSON.stringify(SEED_ORDERS)),
      payments: JSON.parse(JSON.stringify(SEED_PAYMENTS)),
      dailyRevenue: JSON.parse(JSON.stringify(SEED_DAILY_REVENUE))
    };
    return true;
  }
};
