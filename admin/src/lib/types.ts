export type Role = 'ADMIN' | 'MANAGER' | 'STAFF';

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
};

export type Variant = {
  weight: string;
  price: number;
  sku: string;
  stock: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  category: string;
  images: string[];
  variants: Variant[];
  flavourNotes: string[];
  ingredients: string[];
  stock: boolean;
  featured: boolean;
  salesCount: number;
  updatedAt: string;
};

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentProvider = 'RAZORPAY' | 'PHONEPE' | 'UPI' | 'STRIPE' | 'CASHFREE' | 'COD';

export type OrderItem = {
  id: string;
  productId: string;
  title: string;
  size: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

export type ShippingAddress = {
  recipientName: string;
  phone: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentProvider;
  items: OrderItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  provider: PaymentProvider;
  transactionRef: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  settlementStatus: 'SETTLED' | 'PENDING_SETTLEMENT' | 'REFUNDED' | 'FAILED';
  paidAt?: string;
  createdAt: string;
};

export type AnalyticsSummary = {
  totalRevenue: number;
  revenueGrowthMonth: number | null;
  totalOrders: number;
  ordersGrowthMonth: number | null;
  averageOrderValue: number;
  aovGrowthMonth: number | null;
  paidRatePercent: number;
  activeProducts: number;
  outOfStockCount: number;
  recentOrders: Order[];
  recentPayments: Payment[];
  dailyRevenue: { date: string; amount: number; orders: number }[];
  salesByBlend: { name: string; sales: number; revenue: number; percentage: number }[];
  orderStatusCounts: Record<OrderStatus, number>;
  paymentStatusCounts: Record<PaymentStatus, number>;
};
