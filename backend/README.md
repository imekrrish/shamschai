# Sham's Chai — Backend API

Robust backend for **Sham's Chai** artisanal e-commerce platform built with **Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL**.

## Features

- **Customer Authentication**: Secure registration and login using `bcryptjs` for salted password hashing and `jsonwebtoken` (JWT) for stateless bearer auth.
- **User Profile Management**: Update profile info (name, phone) and change passwords with current password verification.
- **Address Book Management**: Full CRUD operations for delivery addresses, default address toggling, and address categorization (`HOME`, `WORK`, `OTHER`).
- **Order Placement & Management**:
  - Secure server-side calculation for items and shipping.
  - Immutable shipping snapshots stored directly on the order record at checkout.
  - Complete order lifecycle status management: `PENDING` ➔ `CONFIRMED` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED` (or `CANCELLED`).
- **Razorpay Payments**: Server-priced orders, retry protection, signature verification, captured-state checks, signed webhooks and payment recovery.
- **Prisma ORM & PostgreSQL**: Complete relational schema with foreign key cascades, unique constraints, and schema sync scripts.

---

## Directory Structure

```
backend/
├── prisma/
│   └── schema.prisma              # Relational models: User, Address, Order, OrderItem, Payment
├── src/
│   ├── config/
│   │   └── prisma.ts              # PrismaClient singleton
│   ├── controllers/
│   │   ├── address.controller.ts  # Address HTTP handlers
│   │   ├── auth.controller.ts     # Register & login handlers
│   │   ├── order.controller.ts    # Order creation, history, cancellation
│   │   ├── payment.controller.ts  # Razorpay verification & payment status
│   │   └── user.controller.ts     # Profile and password handlers
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT verification & role authorization
│   │   ├── error.middleware.ts    # Centralized error handler
│   │   └── validation.middleware.ts# Zod request validation
│   ├── routes/
│   │   ├── address.routes.ts      # /api/addresses
│   │   ├── auth.routes.ts         # /api/auth
│   │   ├── order.routes.ts        # /api/orders
│   │   ├── payment.routes.ts      # /api/payments
│   │   ├── user.routes.ts         # /api/users
│   │   └── index.ts               # Root router & /api/health
│   ├── services/
│   │   ├── address.service.ts     # Address logic & default switching
│   │   ├── auth.service.ts        # User registration, bcrypt hashing, JWT issuance
│   │   ├── order.service.ts       # Pricing calculation, snapshots, transactions
│   │   └── payment.service.ts     # Razorpay initiation, verification & reconciliation
│   ├── types/
│   │   └── index.ts               # DTOs, interfaces & Express typings
│   └── server.ts                  # Express application entrypoint
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Quick Start & Database Setup

### 1. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

In `.env`, configure your PostgreSQL database connection URL:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/shamschai?schema=public"
JWT_SECRET="your_secure_secret_key"
PORT=5000
FRONTEND_URL="http://localhost:5173"
# In production, set this to the storefront origin. FRONTEND_URLS may contain
# comma-separated aliases such as https://www.shamschai.com,https://shamschai.com.
```

### 2. Push Schema to PostgreSQL (Create Tables)

Once you provide or configure your PostgreSQL `DATABASE_URL`, push the schema directly to create all tables and enums:

```bash
npm run prisma:push
```

Or generate a migration:

```bash
npm run prisma:migrate
```

To explore data visually in your browser:

```bash
npm run prisma:studio
```

### 3. Running the Server

- **Development mode** (with live reload):
  ```bash
  npm run dev
  ```
- **Build TypeScript**:
  ```bash
  npm run build
  ```
- **Production start**:
  ```bash
  npm start
  ```

---

## API Endpoints Reference

### 1. Authentication (`/api/auth`)

#### Register a New User
- **POST** `/api/auth/register`
- **Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "SecurePassword123!",
    "name": "Arjun Sharma",
    "phone": "+91 9876543210"
  }
  ```
- **Response**: `201 Created` with JWT token and user info.

#### Login
- **POST** `/api/auth/login`
- **Body**:
  ```json
  {
    "email": "customer@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response**: `200 OK` with JWT token and user info.

---

### 2. User Profile (`/api/users`) — *Requires `Authorization: Bearer <token>`*

- **GET** `/api/users/me`: Fetch authenticated user profile, saved addresses, and order counts.
- **PUT** `/api/users/me`: Update profile details (`name`, `phone`).
- **PUT** `/api/users/me/password`: Update password with `{ "currentPassword": "...", "newPassword": "..." }`.

---

### 3. Addresses (`/api/addresses`) — *Requires `Authorization: Bearer <token>`*

- **GET** `/api/addresses`: List all saved addresses for the current user.
- **POST** `/api/addresses`: Add new address.
  ```json
  {
    "recipientName": "Arjun Sharma",
    "phone": "+91 9876543210",
    "streetAddress": "Flat 402, Lotus Enclave, 12th Main Road",
    "landmark": "Near Central Park",
    "city": "Hyderabad",
    "state": "Telangana",
    "postalCode": "500081",
    "country": "India",
    "isDefault": true,
    "addressType": "HOME"
  }
  ```
- **GET** `/api/addresses/:id`: Get single address.
- **PUT** `/api/addresses/:id`: Update address fields.
- **DELETE** `/api/addresses/:id`: Delete address (automatically sets another as default if needed).
- **PATCH** `/api/addresses/:id/default`: Set address as default.

---

### 4. Orders (`/api/orders`) — *Requires `Authorization: Bearer <token>`*

#### Place an Order
- **POST** `/api/orders`
- **Body**:
  ```json
  {
    "items": [
      {
        "title": "Sham's Masala Chai",
        "size": "200g",
        "unitPrice": 349,
        "quantity": 2
      },
      {
        "title": "Sham's Masala Chai",
        "size": "500g",
        "unitPrice": 799,
        "quantity": 1
      }
    ],
    "shippingAddressId": "uuid-of-saved-address",
    "notes": "Please leave package with security guard if unavailable",
    "paymentMethod": "RAZORPAY",
    "requestId": "GENERATE-A-UUID-PER-CHECKOUT"
  }
  ```
  *(Note: You can also pass `newAddress: { recipientName, phone, streetAddress, ... }` inline).*
- **Response**: `201 Created` with created order and `paymentIntent` instructions.

#### Order History & Tracking
- **GET** `/api/orders?page=1&limit=10`: List user orders with status and items.
- **GET** `/api/orders/:id`: Detailed order breakdown with address snapshot and payment records.
- **POST** `/api/orders/:id/cancel`: Cancel a pending order only before a payment checkout has been issued; otherwise contact customer care.

---

### 5. Razorpay payments

See [Razorpay setup and launch](../RAZORPAY_SETUP.md) for credentials, webhooks, testing and operational limits.

Authenticated endpoints:
- POST /api/payments/verify: orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature.
- POST /api/payments/retry: orderId. Reuses the pending provider order.
- GET /api/payments/order/:orderId: current status, with recovery of missed captured payments.

POST /api/payments/webhook uses the raw JSON body and X-Razorpay-Signature, without a user bearer token.
Subscribe to payment.captured, order.paid and refund.processed. Dummy payment endpoints have been removed.

Checkout requestId is a client-generated UUID reused for retries of the same basket and delivery address.
Prices and shipping are computed by the backend. Client unitPrice/title are ignored for billing.
Google sign-in is disabled pending a verified OAuth implementation; use email/password authentication.

## Recipe 02 waitlist

The collection and Lab submit to `POST /api/waitlist`. Validated, normalized emails are stored in PostgreSQL with a unique email/recipe constraint. Duplicate signups succeed; failed saves return 503. Subscriber listing via `GET /api/waitlist` requires an ADMIN token.

Set frontend `VITE_API_BASE_URL` to the deployed API URL including `/api`. Development defaults to `http://localhost:5000/api`; production defaults to same-origin `/api`, which must proxy to this backend. New databases require the existing Prisma schema: configure `DATABASE_URL`, then run `npm run prisma:push` and `npm run prisma:generate` from backend.

Signup stores subscriptions and sends a branded confirmation email to the subscriber plus an internal notification to `EMAIL_NOTIFY_TO`. Account creation sends a verification email, successful payment sends an order confirmation, refunds and fulfillment status changes send tracking updates, and each event is also copied to `EMAIL_NOTIFY_TO`.

## Email delivery

All HTML email templates live in `src/services/mail.service.ts`. Configure an SMTP provider in the backend environment before deploying:

```dotenv
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="notifications@example.com"
SMTP_PASS="provider-password"
MAIL_FROM="Sham's Chai <notifications@example.com>"
EMAIL_NOTIFY_TO="your-team@example.com"
```

The logo is loaded from the repository-relative asset at `public/assets/shams/brand/shams-logo.png` and embedded into each email as an inline attachment, so email clients do not need to fetch a public image URL.

For Railway, Brevo is recommended. Set `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, and `BREVO_SENDER_NAME`; Brevo is selected automatically and sends through HTTPS on port 443. SMTP remains available as a fallback when `BREVO_API_KEY` is absent.

After pulling the schema change, run `npm run prisma:push:local` for development or `npm run prisma:push:railway` for production, followed by `npm run prisma:generate`. The protected fulfillment endpoint is `PATCH /api/admin/orders/:id/status` with `{ "status": "SHIPPED" }`; it sends the tracking update mail when the status actually changes.
