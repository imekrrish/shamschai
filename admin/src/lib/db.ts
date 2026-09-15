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

    return {
      connected: true,
      database: dbName,
      tableCounts: {
        users: Number(usersCount),
        orders: Number(ordersCount),
        payments: Number(paymentsCount)
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

    await client.query('COMMIT');
    return { success: true, message: 'PostgreSQL database seeded successfully with admin user, orders, and payments!' };
  } catch (e: any) {
    await client.query('ROLLBACK');
    console.error('Postgres seeding failed:', e);
    return { success: false, message: e.message || 'PostgreSQL seeding failed' };
  } finally {
    client.release();
  }
}
