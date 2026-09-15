import { Product, Order, Payment } from './types';

export const SEED_ADMIN = {
  id: 'usr_admin_shams',
  email: 'admin@shamschai.com',
  passwordPlain: 'admin@123',
  // precomputed bcrypt hash for 'admin@123' with cost 10:
  passwordHash: '$2a$10$wT8KzNqgZk8zM/j8t3YpjeGgL9mOq1Xo2.NlUf7S7jJ5V1Hn0r8yG',
  name: 'Sham Admin',
  role: 'ADMIN' as const,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
};

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'recipe-01',
    slug: 'recipe-01',
    name: 'Sham’s Signature Masala Chai',
    subtitle: 'Bold · Aromatic · Comforting',
    description: 'A warm, layered masala chai made for slow mornings, long conversations and one more cup. Handcrafted with freshly roasted whole spices and estate black tea.',
    category: 'Signature Blends',
    images: [
      '/assets/shams/products/sachet-front.png',
      '/assets/shams/products/sachet-back.png'
    ],
    variants: [
      { weight: '200 g', price: 349, sku: 'SH-MASALA-200', stock: true },
      { weight: '500 g', price: 799, sku: 'SH-MASALA-500', stock: true },
      { weight: '1000 g', price: 1499, sku: 'SH-MASALA-1000', stock: true }
    ],
    flavourNotes: ['WARM SPICE', 'CLOVE & CARDAMOM', 'ROBUST BODY'],
    ingredients: ['Black tea leaves', 'Clove', 'Cinnamon', 'Cardamom', 'Nutmeg', 'Black pepper'],
    stock: true,
    featured: true,
    salesCount: 1420,
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'prod_cardamom',
    slug: 'cardamom-royal-kadak',
    name: 'Cardamom Royal Kadak',
    subtitle: 'Fragrant · Velvety · Royal',
    description: 'Crushed green Idukki cardamom pods blended with full-bodied Assam CTC tea. Delivers an opulent, aromatic cup with a sweet lingering finish.',
    category: 'Signature Blends',
    images: [
      '/assets/shams/products/sachet-front.png'
    ],
    variants: [
      { weight: '200 g', price: 399, sku: 'SH-CARDAMOM-200', stock: true },
      { weight: '500 g', price: 899, sku: 'SH-CARDAMOM-500', stock: true },
      { weight: '1000 g', price: 1699, sku: 'SH-CARDAMOM-1000', stock: true }
    ],
    flavourNotes: ['SWEET CARDAMOM', 'CREAMY FINISH', 'AROMATIC'],
    ingredients: ['Assam CTC tea', 'Green Cardamom (Idukki Grade A)', 'Fennel seeds'],
    stock: true,
    featured: true,
    salesCount: 980,
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'prod_kahwa',
    slug: 'kashmiri-saffron-kahwa',
    name: 'Kashmiri Saffron Kahwa',
    subtitle: 'Golden Saffron · Crushed Almonds · Delicate',
    description: 'An ethereal celebration from the Kashmir valley. Pure green tea leaves steeped with Kashmiri Mongra saffron threads, crushed almonds, cinnamon bark, and green cardamom.',
    category: 'Heritage Special',
    images: [
      '/assets/shams/products/sachet-front.png'
    ],
    variants: [
      { weight: '200 g', price: 549, sku: 'SH-KAHWA-200', stock: true },
      { weight: '500 g', price: 1249, sku: 'SH-KAHWA-500', stock: true },
      { weight: '1000 g', price: 2399, sku: 'SH-KAHWA-1000', stock: false }
    ],
    flavourNotes: ['SAFFRON THREADS', 'SWEET ALMOND', 'HONEY ACCENTS'],
    ingredients: ['Whole leaf green tea', 'Kashmiri Mongra Saffron', 'Slivered Almonds', 'Cardamom', 'Cinnamon'],
    stock: true,
    featured: true,
    salesCount: 650,
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'prod_ginger',
    slug: 'ginger-zing-ctc',
    name: 'Ginger Zing Adrak Kadak',
    subtitle: 'Fiery · Zesty · Immunity Boost',
    description: 'Sun-dried ginger flakes pounded into fine brisk granules paired with strong Dooars CTC. Built to awaken the senses on rainy afternoons.',
    category: 'Daily Brews',
    images: [
      '/assets/shams/products/sachet-front.png'
    ],
    variants: [
      { weight: '200 g', price: 329, sku: 'SH-GINGER-200', stock: true },
      { weight: '500 g', price: 749, sku: 'SH-GINGER-500', stock: true },
      { weight: '1000 g', price: 1399, sku: 'SH-GINGER-1000', stock: true }
    ],
    flavourNotes: ['WARM GINGER HEAT', 'MALTY', 'EARTHY SPICE'],
    ingredients: ['CTC Black Tea', 'Sun-dried Sunthi (Ginger)', 'Black Pepper', 'Tulsi Leaves'],
    stock: true,
    featured: false,
    salesCount: 810,
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'prod_kulhad',
    slug: 'kulhad-smoky-blend',
    name: 'Kulhad Smoky Kadak Blend',
    subtitle: 'Earthy · Smoky · Dhaba Nostalgia',
    description: 'Infused with roasted clay aroma notes to recreate the authentic railway station and roadside dhaba kulhad chai experience at home.',
    category: 'Specialty Blends',
    images: [
      '/assets/shams/products/sachet-front.png'
    ],
    variants: [
      { weight: '200 g', price: 379, sku: 'SH-KULHAD-200', stock: true },
      { weight: '500 g', price: 849, sku: 'SH-KULHAD-500', stock: true },
      { weight: '1000 g', price: 1599, sku: 'SH-KULHAD-1000', stock: true }
    ],
    flavourNotes: ['SMOKY TERRACOTTA', 'DEEP MALT', 'CARAMEL'],
    ingredients: ['Assam BOP & Dust Blend', 'Roasted Chicory', 'Charcoal Roasted Spices'],
    stock: true,
    featured: false,
    salesCount: 520,
    updatedAt: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];

export const SEED_ORDERS: Order[] = [
  {
    id: 'ord_1001',
    orderNumber: 'SH-82914',
    customerName: 'Aarav Sharma',
    customerEmail: 'aarav.sharma@example.com',
    customerPhone: '+91 98201 44521',
    shippingAddress: {
      recipientName: 'Aarav Sharma',
      phone: '+91 98201 44521',
      streetAddress: 'Flat 402, Sea Green Heights, Worli Sea Face',
      landmark: 'Opposite Worli Dairy',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400018',
      country: 'India'
    },
    status: 'DELIVERED',
    subtotal: 1148,
    shippingFee: 0,
    discount: 100,
    totalAmount: 1048,
    currency: 'INR',
    paymentStatus: 'PAID',
    paymentMethod: 'RAZORPAY',
    items: [
      {
        id: 'item_1',
        productId: 'prod_masala',
        title: 'Sham’s Signature Masala Chai',
        size: '500 g',
        unitPrice: 799,
        quantity: 1,
        subtotal: 799
      },
      {
        id: 'item_2',
        productId: 'prod_masala',
        title: 'Sham’s Signature Masala Chai',
        size: '200 g',
        unitPrice: 349,
        quantity: 1,
        subtotal: 349
      }
    ],
    notes: 'Please ring the bell twice. Leave with security if not available.',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'ord_1002',
    orderNumber: 'SH-82915',
    customerName: 'Priya Patel',
    customerEmail: 'priya.patel@example.com',
    customerPhone: '+91 97112 88410',
    shippingAddress: {
      recipientName: 'Priya Patel',
      phone: '+91 97112 88410',
      streetAddress: 'B-14, Gulmohar Enclave, Saket',
      landmark: 'Near Saket Metro Station',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110017',
      country: 'India'
    },
    status: 'SHIPPED',
    subtotal: 2148,
    shippingFee: 0,
    discount: 0,
    totalAmount: 2148,
    currency: 'INR',
    paymentStatus: 'PAID',
    paymentMethod: 'PHONEPE',
    items: [
      {
        id: 'item_3',
        productId: 'prod_cardamom',
        title: 'Cardamom Royal Kadak',
        size: '500 g',
        unitPrice: 899,
        quantity: 1,
        subtotal: 899
      },
      {
        id: 'item_4',
        productId: 'prod_kahwa',
        title: 'Kashmiri Saffron Kahwa',
        size: '500 g',
        unitPrice: 1249,
        quantity: 1,
        subtotal: 1249
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'ord_1003',
    orderNumber: 'SH-82916',
    customerName: 'Rohan Iyer',
    customerEmail: 'rohan.iyer@example.com',
    customerPhone: '+91 99401 23091',
    shippingAddress: {
      recipientName: 'Rohan Iyer',
      phone: '+91 99401 23091',
      streetAddress: '7th Cross, 1st Block, Koramangala',
      landmark: 'Near Wipro Park',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560034',
      country: 'India'
    },
    status: 'PROCESSING',
    subtotal: 1499,
    shippingFee: 0,
    discount: 50,
    totalAmount: 1449,
    currency: 'INR',
    paymentStatus: 'PAID',
    paymentMethod: 'UPI',
    items: [
      {
        id: 'item_5',
        productId: 'prod_masala',
        title: 'Sham’s Signature Masala Chai',
        size: '1000 g',
        unitPrice: 1499,
        quantity: 1,
        subtotal: 1499
      }
    ],
    notes: 'Gift packaging requested.',
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'ord_1004',
    orderNumber: 'SH-82917',
    customerName: 'Ananya Verma',
    customerEmail: 'ananya.verma@example.com',
    customerPhone: '+91 98480 77123',
    shippingAddress: {
      recipientName: 'Ananya Verma',
      phone: '+91 98480 77123',
      streetAddress: 'Villa 12, Jubilee Hills Road No 36',
      landmark: 'Near Peddamma Temple',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500033',
      country: 'India'
    },
    status: 'CONFIRMED',
    subtotal: 728,
    shippingFee: 49,
    discount: 0,
    totalAmount: 777,
    currency: 'INR',
    paymentStatus: 'PAID',
    paymentMethod: 'RAZORPAY',
    items: [
      {
        id: 'item_6',
        productId: 'prod_masala',
        title: 'Sham’s Signature Masala Chai',
        size: '200 g',
        unitPrice: 349,
        quantity: 1,
        subtotal: 349
      },
      {
        id: 'item_7',
        productId: 'prod_kulhad',
        title: 'Kulhad Smoky Kadak Blend',
        size: '200 g',
        unitPrice: 379,
        quantity: 1,
        subtotal: 379
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'ord_1005',
    orderNumber: 'SH-82918',
    customerName: 'Vikram Malhotra',
    customerEmail: 'vikram.m@example.com',
    customerPhone: '+91 94220 90114',
    shippingAddress: {
      recipientName: 'Vikram Malhotra',
      phone: '+91 94220 90114',
      streetAddress: 'Row House 4, Nyati Estate, Mohammadwadi',
      landmark: 'Near DPS School',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411060',
      country: 'India'
    },
    status: 'PENDING',
    subtotal: 749,
    shippingFee: 49,
    discount: 0,
    totalAmount: 798,
    currency: 'INR',
    paymentStatus: 'PENDING',
    paymentMethod: 'UPI',
    items: [
      {
        id: 'item_8',
        productId: 'prod_ginger',
        title: 'Ginger Zing Adrak Kadak',
        size: '500 g',
        unitPrice: 749,
        quantity: 1,
        subtotal: 749
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'ord_1006',
    orderNumber: 'SH-82919',
    customerName: 'Meera Nambiar',
    customerEmail: 'meera.tea@example.com',
    customerPhone: '+91 98455 19283',
    shippingAddress: {
      recipientName: 'Meera Nambiar',
      phone: '+91 98455 19283',
      streetAddress: 'Flat 101, Palm Meadows, Whitefield',
      landmark: 'Near ITPL',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066',
      country: 'India'
    },
    status: 'CANCELLED',
    subtotal: 549,
    shippingFee: 49,
    discount: 0,
    totalAmount: 598,
    currency: 'INR',
    paymentStatus: 'REFUNDED',
    paymentMethod: 'RAZORPAY',
    items: [
      {
        id: 'item_9',
        productId: 'prod_kahwa',
        title: 'Kashmiri Saffron Kahwa',
        size: '200 g',
        unitPrice: 549,
        quantity: 1,
        subtotal: 549
      }
    ],
    notes: 'Customer cancelled due to accidental duplicate order. Refund issued.',
    createdAt: new Date(Date.now() - 3600000 * 52).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 40).toISOString()
  }
];

export const SEED_PAYMENTS: Payment[] = [
  {
    id: 'pay_rzp_101',
    orderId: 'ord_1001',
    orderNumber: 'SH-82914',
    customerName: 'Aarav Sharma',
    customerEmail: 'aarav.sharma@example.com',
    provider: 'RAZORPAY',
    transactionRef: 'pay_RPZ8492049102',
    amount: 1048,
    currency: 'INR',
    status: 'PAID',
    settlementStatus: 'SETTLED',
    paidAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'pay_ppe_102',
    orderId: 'ord_1002',
    orderNumber: 'SH-82915',
    customerName: 'Priya Patel',
    customerEmail: 'priya.patel@example.com',
    provider: 'PHONEPE',
    transactionRef: 'T24091514890281',
    amount: 2148,
    currency: 'INR',
    status: 'PAID',
    settlementStatus: 'SETTLED',
    paidAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString()
  },
  {
    id: 'pay_upi_103',
    orderId: 'ord_1003',
    orderNumber: 'SH-82916',
    customerName: 'Rohan Iyer',
    customerEmail: 'rohan.iyer@example.com',
    provider: 'UPI',
    transactionRef: 'upi_TXN928371928301',
    amount: 1449,
    currency: 'INR',
    status: 'PAID',
    settlementStatus: 'PENDING_SETTLEMENT',
    paidAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString()
  },
  {
    id: 'pay_rzp_104',
    orderId: 'ord_1004',
    orderNumber: 'SH-82917',
    customerName: 'Ananya Verma',
    customerEmail: 'ananya.verma@example.com',
    provider: 'RAZORPAY',
    transactionRef: 'pay_RPZ9182390184',
    amount: 777,
    currency: 'INR',
    status: 'PAID',
    settlementStatus: 'PENDING_SETTLEMENT',
    paidAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString()
  },
  {
    id: 'pay_upi_105',
    orderId: 'ord_1005',
    orderNumber: 'SH-82918',
    customerName: 'Vikram Malhotra',
    customerEmail: 'vikram.m@example.com',
    provider: 'UPI',
    transactionRef: 'upi_TXN481029481902',
    amount: 798,
    currency: 'INR',
    status: 'PENDING',
    settlementStatus: 'PENDING_SETTLEMENT',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'pay_rzp_106',
    orderId: 'ord_1006',
    orderNumber: 'SH-82919',
    customerName: 'Meera Nambiar',
    customerEmail: 'meera.tea@example.com',
    provider: 'RAZORPAY',
    transactionRef: 'pay_RPZ7719283019',
    amount: 598,
    currency: 'INR',
    status: 'REFUNDED',
    settlementStatus: 'REFUNDED',
    paidAt: new Date(Date.now() - 3600000 * 52).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 52).toISOString()
  }
];

export const SEED_DAILY_REVENUE = [
  { date: 'Sep 09', amount: 8420, orders: 7 },
  { date: 'Sep 10', amount: 11250, orders: 11 },
  { date: 'Sep 11', amount: 9800, orders: 9 },
  { date: 'Sep 12', amount: 14600, orders: 14 },
  { date: 'Sep 13', amount: 18950, orders: 17 },
  { date: 'Sep 14', amount: 22400, orders: 20 },
  { date: 'Sep 15', amount: 16820, orders: 15 }
];
