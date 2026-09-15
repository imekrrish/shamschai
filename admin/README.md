# Sham's Chai — Executive Admin & Operations Portal

A dedicated, full-featured Admin Portal for **Sham’s Chai** architected for zero-configuration, 1-click deployment on **Vercel**.

It bundles both the executive management interface and its own dedicated serverless backend (`/api/*`) in this self-contained `admin/` folder.

---

## 🚀 Key Features

1. **Dashboard Analytics & KPIs**:
   - Total Gross Revenue (INR ₹)
   - Order volume & month-over-month growth metrics
   - Average Order Value (AOV)
   - 7-Day Revenue Velocity Chart
   - Blend distribution (Masala Chai, Cardamom Royal Kadak, Kashmiri Saffron Kahwa, etc.)
2. **Product & Pricing Management**:
   - Live pricing editor for `200 g`, `500 g`, and `1000 g` pack weights
   - Instant In-Stock / Out-of-Stock toggles per variant and per blend
   - Create new tea blends with custom tasting notes and pricing
3. **Order Fulfillment Management**:
   - Real-time customer orders table
   - Filter by status: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`
   - Detailed inspection drawer with delivery destination, itemized lines, and customer delivery notes
   - Status transition buttons (Confirm, Pack, Mark Shipped, Mark Delivered, Cancel & Refund)
4. **Payments Received Tracker**:
   - Live transaction log with gateway tokens (`pay_RPZ...`, `T2409...`, `upi_TXN...`)
   - Tracks Razorpay, PhonePe, UPI, Stripe settlements
   - Total collected, pending in-flight, and refunded metrics
   - Manual reconciliation and settlement state verification
5. **Pre-Seeded Database & Admin Authentication**:
   - **Email**: `admin@shamschai.com`
   - **Password**: `admin@123`
   - One-click "Reset & Re-seed Data" endpoint and button in Settings.

---

## 🛠️ Deploying to Vercel in 60 Seconds

1. Push this repository to GitHub.
2. Log into [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import this repository.
4. In the **Project Settings**:
   - **Root Directory**: Click *Edit* and select **`admin`**.
   - **Framework Preset**: Next.js (automatically detected).
5. In **Environment Variables**, add:
   ```env
   JWT_SECRET=shams_chai_admin_secret_key_2026_vercel_production_change_me
   ADMIN_EMAIL=admin@shamschai.com
   ADMIN_PASSWORD=admin@123
   ```
6. Click **Deploy**. Vercel will build both the frontend and serverless API backend routes!

---

## 💻 Running Locally

Inside the `admin` folder:

```bash
# 1. Install dependencies
npm install

# 2. Run the development server (runs on port 3001)
npm run dev

# 3. Open in browser
http://localhost:3001
```

Log in with:
- **Email**: `admin@shamschai.com`
- **Password**: `admin@123`
