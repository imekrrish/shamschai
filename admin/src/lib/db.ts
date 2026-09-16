import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

let poolInstance: Pool | null = null;

export function getDbPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:211002@127.0.0.1:5433/shamschai_dev?schema=public";
  if (!poolInstance && connectionString) {
    try {
      poolInstance = new Pool({
        connectionString,
        ssl: connectionString.includes('sslmode=require') || connectionString.includes('rlwy.net') 
          ? { rejectUnauthorized: false } 
          : false,
        max: 5,
        idleTimeoutMillis: 30000
      });
    } catch (err) {
      console.warn('Could not initialize PostgreSQL pool:', err);
      poolInstance = null;
    }
  }
  return poolInstance;
}

export async function queryPostgres<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getDbPool();
  if (!pool) {
    throw new Error('No PostgreSQL connection pool configured');
  }
  const res = await pool.query(text, params);
  return res.rows;
}

export async function checkPostgresStatus(): Promise<{ connected: boolean; database?: string; tableCounts?: Record<string, number> }> {
  const pool = getDbPool();
  if (!pool) {
    return { connected: false };
  }
  try {
    const res = await pool.query('SELECT current_database() as db');
    const dbName = res.rows[0]?.db || 'unknown';

    // Get counts
    const usersCount = (await pool.query('SELECT count(*) FROM users')).rows[0]?.count || 0;
    const ordersCount = (await pool.query('SELECT count(*) FROM orders')).rows[0]?.count || 0;
    const paymentsCount = (await pool.query('SELECT count(*) FROM payments')).rows[0]?.count || 0;
    const productsCount = (await pool.query('SELECT count(*) FROM products')).rows[0]?.count || 0;

    return {
      connected: true,
      database: dbName,
      tableCounts: {
        users: Number(usersCount),
        orders: Number(ordersCount),
        payments: Number(paymentsCount),
        products: Number(productsCount)
      }
    };
  } catch (e) {
    console.error('Postgres health check failed:', e);
    return { connected: false };
  }
}

export async function seedPostgresDatabase(): Promise<{ success: boolean; message: string }> {
  const pool = getDbPool();
  if (!pool) {
    return { success: false, message: 'No PostgreSQL connection available' };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Seed or Upsert Admin User (admin@shamschai.com / admin@123)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin@123', salt);

    const adminCheck = await client.query('SELECT id FROM users WHERE email = $1', ['admin@shamschai.com']);
    let adminId: string;

    if (adminCheck.rows.length > 0) {
      adminId = adminCheck.rows[0].id;
      await client.query(
        'UPDATE users SET "passwordHash" = $1, role = $2, name = $3 WHERE id = $4',
        [passwordHash, 'ADMIN', 'Sham Admin', adminId]
      );
    } else {
      adminId = 'usr_admin_shams';
      await client.query(
        'INSERT INTO users (id, email, "passwordHash", name, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
        [adminId, 'admin@shamschai.com', passwordHash, 'Sham Admin', 'ADMIN']
      );
    }

    // 2. Ensure customer user for seed orders
    const customerEmail = 'priya.patel@example.com';
    let customerId: string;
    const custCheck = await client.query('SELECT id FROM users WHERE email = $1', [customerEmail]);
    if (custCheck.rows.length > 0) {
      customerId = custCheck.rows[0].id;
    } else {
      customerId = 'usr_cust_priya';
      await client.query(
        'INSERT INTO users (id, email, name, role, phone, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
        [customerId, customerEmail, 'Priya Patel', 'CUSTOMER', '+91 97112 88410']
      );
    }

    // 3. Clear existing demo orders to re-seed cleanly
    await client.query('DELETE FROM payments WHERE "orderId" LIKE \'ord_%\'');
    await client.query('DELETE FROM order_items WHERE "orderId" LIKE \'ord_%\'');
    await client.query('DELETE FROM orders WHERE id LIKE \'ord_%\'');

    // 4. Insert Seed Orders
    const sampleOrders = [
      {
        id: 'ord_1001',
        orderNumber: 'SH-82914',
        status: 'DELIVERED',
        subtotal: 1148,
        shippingFee: 0,
        totalAmount: 1048,
        paymentStatus: 'PAID',
        paymentMethod: 'RAZORPAY',
        customerName: 'Aarav Sharma',
        customerEmail: 'aarav.sharma@example.com',
        city: 'Mumbai',
        items: [
          { title: 'Sham’s Signature Masala Chai', size: '500 g', unitPrice: 799, quantity: 1, subtotal: 799 },
          { title: 'Sham’s Signature Masala Chai', size: '200 g', unitPrice: 349, quantity: 1, subtotal: 349 }
        ],
        txnRef: 'pay_RPZ8492049102'
      },
      {
        id: 'ord_1002',
        orderNumber: 'SH-82915',
        status: 'SHIPPED',
        subtotal: 2148,
        shippingFee: 0,
        totalAmount: 2148,
        paymentStatus: 'PAID',
        paymentMethod: 'PHONEPE',
        customerName: 'Priya Patel',
        customerEmail: 'priya.patel@example.com',
        city: 'New Delhi',
        items: [
          { title: 'Cardamom Royal Kadak', size: '500 g', unitPrice: 899, quantity: 1, subtotal: 899 },
          { title: 'Kashmiri Saffron Kahwa', size: '500 g', unitPrice: 1249, quantity: 1, subtotal: 1249 }
        ],
        txnRef: 'T24091514890281'
      },
      {
        id: 'ord_1003',
        orderNumber: 'SH-82916',
        status: 'PROCESSING',
        subtotal: 1499,
        shippingFee: 0,
        totalAmount: 1449,
        paymentStatus: 'PAID',
        paymentMethod: 'UPI',
        customerName: 'Rohan Iyer',
        customerEmail: 'rohan.iyer@example.com',
        city: 'Bengaluru',
        items: [
          { title: 'Sham’s Signature Masala Chai', size: '1000 g', unitPrice: 1499, quantity: 1, subtotal: 1499 }
        ],
        txnRef: 'upi_TXN928371928301'
      },
      {
        id: 'ord_1004',
        orderNumber: 'SH-82917',
        status: 'CONFIRMED',
        subtotal: 728,
        shippingFee: 49,
        totalAmount: 777,
        paymentStatus: 'PAID',
        paymentMethod: 'RAZORPAY',
        customerName: 'Ananya Verma',
        customerEmail: 'ananya.verma@example.com',
        city: 'Hyderabad',
        items: [
          { title: 'Sham’s Signature Masala Chai', size: '200 g', unitPrice: 349, quantity: 1, subtotal: 349 },
          { title: 'Kulhad Smoky Kadak Blend', size: '200 g', unitPrice: 379, quantity: 1, subtotal: 379 }
        ],
        txnRef: 'pay_RPZ9182390184'
      },
      {
        id: 'ord_1005',
        orderNumber: 'SH-82918',
        status: 'PENDING',
        subtotal: 749,
        shippingFee: 49,
        totalAmount: 798,
        paymentStatus: 'PENDING',
        paymentMethod: 'UPI',
        customerName: 'Vikram Malhotra',
        customerEmail: 'vikram.m@example.com',
        city: 'Pune',
        items: [
          { title: 'Ginger Zing Adrak Kadak', size: '500 g', unitPrice: 749, quantity: 1, subtotal: 749 }
        ],
        txnRef: 'upi_TXN481029481902'
      },
      {
        id: 'ord_1006',
        orderNumber: 'SH-82919',
        status: 'CANCELLED',
        subtotal: 549,
        shippingFee: 49,
        totalAmount: 598,
        paymentStatus: 'REFUNDED',
        paymentMethod: 'RAZORPAY',
        customerName: 'Meera Nambiar',
        customerEmail: 'meera.tea@example.com',
        city: 'Bengaluru',
        items: [
          { title: 'Kashmiri Saffron Kahwa', size: '200 g', unitPrice: 549, quantity: 1, subtotal: 549 }
        ],
        txnRef: 'pay_RPZ7719283019'
      }
    ];

    for (const o of sampleOrders) {
      const snapshot = JSON.stringify({
        recipientName: o.customerName,
        phone: '+91 98201 44521',
        streetAddress: 'Heritage Tea Boulevard, Suite 10',
        city: o.city,
        state: 'State',
        postalCode: '400001',
        country: 'India'
      });

      await client.query(
        `INSERT INTO orders (id, "orderNumber", "userId", "shippingSnapshot", status, subtotal, "shippingFee", "totalAmount", currency, "paymentStatus", "paymentMethod", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
        [o.id, o.orderNumber, customerId, snapshot, o.status, o.subtotal, o.shippingFee, o.totalAmount, 'INR', o.paymentStatus, o.paymentMethod]
      );

      for (let i = 0; i < o.items.length; i++) {
        const it = o.items[i];
        await client.query(
          `INSERT INTO order_items (id, "orderId", title, size, "unitPrice", quantity, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [`item_${o.id}_${i}`, o.id, it.title, it.size, it.unitPrice, it.quantity, it.subtotal]
        );
      }

      await client.query(
        `INSERT INTO payments (id, "orderId", "userId", provider, "transactionRef", amount, currency, status, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [`pay_${o.id}`, o.id, customerId, o.paymentMethod === 'UPI' ? 'UPI' : o.paymentMethod === 'PHONEPE' ? 'PHONEPE' : 'RAZORPAY', o.txnRef, o.totalAmount, 'INR', o.paymentStatus]
      );
    }

      // 5. Ensure default products exist
      const prodCheck = await client.query('SELECT count(*) FROM products');
      if (Number(prodCheck.rows[0]?.count || 0) === 0) {
        // The catalogue is one pack. Every value below is printed on the sachet.
        const defaultProducts = [
          {
            id: 'recipe-01',
            slug: 'recipe-01',
            name: "Sham's Masala Chai",
            subtitle: "It's a modern woman's recipe",
            description: 'Aromatic black tea leaves blended with handpicked spices for a bold, warming cup of masala chai.',
            category: 'The Collection',
            images: JSON.stringify(['/assets/shams/products/product-lifestyle-v2.png']),
            variants: JSON.stringify([
              { weight: '500 g', price: 450, sku: 'SH-RECIPE-01-500', stock: true },
              { weight: '1 kg', price: 850, sku: 'SH-RECIPE-01-1000', stock: true }
            ]),
            flavourNotes: JSON.stringify(['BLACK TEA', 'CARDAMOM', 'BLACK PEPPER']),
            ingredients: JSON.stringify(['Black Tea Leaves', 'Clove', 'Cinnamon', 'Cardamom', 'Nutmeg', 'Black Pepper']),
            stock: true,
            featured: true
          }
        ];

        for (const p of defaultProducts) {
          await client.query(
            `INSERT INTO products (id, slug, name, subtitle, description, category, images, variants, "flavourNotes", ingredients, stock, featured, "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10::jsonb, $11, $12, NOW(), NOW())
             ON CONFLICT (slug) DO NOTHING`,
            [p.id, p.slug, p.name, p.subtitle, p.description, p.category, p.images, p.variants, p.flavourNotes, p.ingredients, p.stock, p.featured]
          );
        }
      }

      await client.query('COMMIT');
    return { success: true, message: 'PostgreSQL database seeded successfully with admin user, products, orders, and payments!' };
  } catch (e: any) {
    await client.query('ROLLBACK');
    console.error('Postgres seeding failed:', e);
    return { success: false, message: e.message || 'PostgreSQL seeding failed' };
  } finally {
    client.release();
  }
}

export async function getPostgresAnalytics() {
  const pool = getDbPool();
  if (!pool) {
    throw new Error('No PostgreSQL connection available for analytics');
  }

  // 1. Revenue & Payment Metrics from PostgreSQL
  const revRes = await pool.query(`
    SELECT 
      COALESCE(SUM(amount), 0)::numeric AS total_revenue,
      COUNT(*)::int AS paid_count
    FROM payments 
    WHERE status = 'PAID'
  `);
  const totalRevenue = Number(revRes.rows[0]?.total_revenue || 0);
  const paidPaymentsCount = Number(revRes.rows[0]?.paid_count || 0);

  // 2. Orders Metrics from PostgreSQL
  const ordersCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM orders');
  const totalOrders = Number(ordersCountRes.rows[0]?.count || 0);

  const averageOrderValue = paidPaymentsCount > 0 ? Math.round(totalRevenue / paidPaymentsCount) : 0;
  const paidRatePercent = totalOrders > 0 ? Math.round((paidPaymentsCount / totalOrders) * 100) : 100;

  // 3. Products Status from PostgreSQL
  const productsRes = await pool.query('SELECT id, stock, variants FROM products');
  const activeProducts = productsRes.rows.length;
  let outOfStockCount = 0;
  for (const row of productsRes.rows) {
    if (!row.stock) {
      outOfStockCount++;
      continue;
    }
    const variants = Array.isArray(row.variants) ? row.variants : [];
    if (variants.some((v: any) => v.stock === false)) {
      outOfStockCount++;
    }
  }

  // 4. Order Status Counts from PostgreSQL
  const orderStatusRows = (await pool.query('SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status')).rows;
  const orderStatusCounts: Record<string, number> = {
    PENDING: 0,
    CONFIRMED: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0
  };
  for (const row of orderStatusRows) {
    const s = String(row.status).toUpperCase();
    if (s in orderStatusCounts) {
      orderStatusCounts[s] = Number(row.count);
    }
  }

  // 5. Payment Status Counts from PostgreSQL
  const paymentStatusRows = (await pool.query('SELECT status, COUNT(*)::int AS count FROM payments GROUP BY status')).rows;
  const paymentStatusCounts: Record<string, number> = {
    PAID: 0,
    PENDING: 0,
    FAILED: 0,
    REFUNDED: 0
  };
  for (const row of paymentStatusRows) {
    const s = String(row.status).toUpperCase();
    if (s in paymentStatusCounts) {
      paymentStatusCounts[s] = Number(row.count);
    }
  }

  // 6. Recent Orders from PostgreSQL
  const recentOrdersRaw = await pool.query(`
    SELECT 
      o.*, 
      u.name AS "customerName", 
      u.email AS "customerEmail", 
      u.phone AS "customerPhone", 
      COALESCE(json_agg(
        json_build_object(
          'id', oi.id, 
          'title', oi.title, 
          'size', oi.size, 
          'unitPrice', oi."unitPrice", 
          'quantity', oi.quantity, 
          'subtotal', oi.subtotal
        )
      ) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items 
    FROM orders o 
    JOIN users u ON u.id = o."userId" 
    LEFT JOIN order_items oi ON oi."orderId" = o.id 
    GROUP BY o.id, u.id 
    ORDER BY o."createdAt" DESC 
    LIMIT 5
  `);
  const recentOrders = recentOrdersRaw.rows.map((order: any) => ({
    ...order,
    subtotal: Number(order.subtotal || 0),
    shippingFee: Number(order.shippingFee || 0),
    totalAmount: Number(order.totalAmount || 0),
    discount: 0,
    shippingAddress: typeof order.shippingSnapshot === 'string' ? JSON.parse(order.shippingSnapshot) : (order.shippingSnapshot || {}),
    items: (order.items || []).map((it: any) => ({
      ...it,
      unitPrice: Number(it.unitPrice || 0),
      subtotal: Number(it.subtotal || 0),
      quantity: Number(it.quantity || 0)
    }))
  }));

  // 7. Recent Payments from PostgreSQL
  const recentPaymentsRaw = await pool.query(`
    SELECT 
      p.*, 
      o."orderNumber", 
      u.name AS "customerName", 
      u.email AS "customerEmail" 
    FROM payments p 
    JOIN orders o ON o.id = p."orderId" 
    JOIN users u ON u.id = p."userId" 
    ORDER BY p."createdAt" DESC 
    LIMIT 5
  `);
  const recentPayments = recentPaymentsRaw.rows.map((p: any) => ({
    ...p,
    amount: Number(p.amount || 0),
    settlementStatus: p.status === 'PAID' ? 'SETTLED' : p.status === 'REFUNDED' ? 'REFUNDED' : 'PENDING_SETTLEMENT'
  }));

  // 8. 7-Day Revenue Progression from PostgreSQL
  const dailyRes = await pool.query(`
    SELECT 
      TO_CHAR("createdAt", 'YYYY-MM-DD') AS day,
      COALESCE(SUM(amount), 0)::numeric AS amount,
      COUNT(*)::int AS orders
    FROM payments
    WHERE status = 'PAID' AND "createdAt" >= NOW() - INTERVAL '14 days'
    GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
    ORDER BY day ASC
  `);
  const dailyMap: Record<string, { amount: number; orders: number }> = {};
  for (const r of dailyRes.rows) {
    dailyMap[r.day] = { amount: Number(r.amount), orders: Number(r.orders) };
  }

  // Generate continuous past 7 days sequence
  const dailyRevenue: { date: string; amount: number; orders: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const item = dailyMap[key];
    dailyRevenue.push({
      date: key,
      amount: item ? item.amount : 0,
      orders: item ? item.orders : 0
    });
  }

  // 9. Sales by Blend from PostgreSQL (from order_items)
  const blendRes = await pool.query(`
    SELECT 
      oi.title AS name,
      SUM(oi.quantity)::int AS sales,
      COALESCE(SUM(oi.subtotal), 0)::numeric AS revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi."orderId"
    WHERE o.status != 'CANCELLED'
    GROUP BY oi.title
    ORDER BY sales DESC
  `);
  const totalSalesVol = blendRes.rows.reduce((acc: number, r: any) => acc + Number(r.sales || 0), 0);
  const salesByBlend = blendRes.rows.map((r: any) => ({
    name: String(r.name).replace('Sham’s ', '').replace("Sham's ", ''),
    sales: Number(r.sales || 0),
    revenue: Number(r.revenue || 0),
    percentage: totalSalesVol > 0 ? Math.round((Number(r.sales) / totalSalesVol) * 100) : 0
  }));

  // 10. Month-over-month growth calculations
  const growthRes = await pool.query(`
    SELECT 
      COALESCE(SUM(CASE WHEN "createdAt" >= NOW() - INTERVAL '30 days' THEN amount ELSE 0 END), 0)::numeric AS curr_rev,
      COALESCE(SUM(CASE WHEN "createdAt" >= NOW() - INTERVAL '60 days' AND "createdAt" < NOW() - INTERVAL '30 days' THEN amount ELSE 0 END), 0)::numeric AS prev_rev,
      COUNT(CASE WHEN "createdAt" >= NOW() - INTERVAL '30 days' THEN 1 END)::int AS curr_orders,
      COUNT(CASE WHEN "createdAt" >= NOW() - INTERVAL '60 days' AND "createdAt" < NOW() - INTERVAL '30 days' THEN 1 END)::int AS prev_orders
    FROM payments 
    WHERE status = 'PAID'
  `);
  const currRev = Number(growthRes.rows[0]?.curr_rev || 0);
  const prevRev = Number(growthRes.rows[0]?.prev_rev || 0);
  const currOrders = Number(growthRes.rows[0]?.curr_orders || 0);
  const prevOrders = Number(growthRes.rows[0]?.prev_orders || 0);

  const pct = (current: number, previous: number) =>
    previous > 0 ? Math.round(((current - previous) / previous) * 100 * 10) / 10 : null;

  const revenueGrowthMonth = pct(currRev, prevRev);
  const ordersGrowthMonth = pct(currOrders, prevOrders);
  const currAov = currOrders > 0 ? currRev / currOrders : 0;
  const prevAov = prevOrders > 0 ? prevRev / prevOrders : 0;
  const aovGrowthMonth = pct(currAov, prevAov);

  return {
    totalRevenue,
    revenueGrowthMonth,
    totalOrders,
    ordersGrowthMonth,
    averageOrderValue,
    aovGrowthMonth,
    paidRatePercent,
    activeProducts,
    outOfStockCount,
    recentOrders,
    recentPayments,
    dailyRevenue,
    salesByBlend,
    orderStatusCounts: orderStatusCounts as any,
    paymentStatusCounts: paymentStatusCounts as any
  };
}

