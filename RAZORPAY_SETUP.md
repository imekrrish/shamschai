# Razorpay setup and launch

## Current status

Razorpay Standard Checkout is implemented in the React storefront and Express backend.
Real Razorpay credentials have not been configured or exercised by the automated tests.
No live payment has been made. Complete the Test Mode steps below before enabling live keys.

The backend uses Razorpay's HTTPS API directly with Node's built-in fetch; no Razorpay SDK install is required.
Use Node 22 or newer and PostgreSQL.

## 1. Configure the backend

Set these variables in backend/.env locally, and in your backend host's environment settings when deployed:

```dotenv
NODE_ENV=production
APP_ENV=production
DATABASE_URL=postgresql://YOUR_DATABASE_CONNECTION
JWT_SECRET=YOUR_UNIQUE_RANDOM_SECRET
FRONTEND_URL=https://YOUR_STOREFRONT_DOMAIN
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_TEST_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_SEPARATE_RANDOM_WEBHOOK_SECRET
```

For local development, set NODE_ENV and APP_ENV to development and FRONTEND_URL to http://localhost:5173.
If DATABASE_URL_LOCAL or DATABASE_URL_RAILWAY are also set, they override DATABASE_URL in their respective runtime environments. Remove obsolete overrides or make them point to the intended database.
Prisma CLI reads DATABASE_URL, so ensure it points to the same database as the running server.

Generate JWT and webhook secrets independently, running this command once for each:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Do not commit actual secrets, put them in frontend variables, or paste them into chat.
The server rejects missing, short, and known placeholder JWT secrets. Rotate an existing demo secret before launch, which signs existing sessions out.

In the backend directory:

```powershell
npm ci
npm run prisma:generate
npm run build
npm start
```

No database migration is required by this payment change: it uses the existing Order and Payment models.
If installing the app against a brand-new, empty database, initialize it with npm run prisma:push before starting. Do not blindly push schema changes into an existing production database.

## 2. Configure the storefront

Set the following in the frontend host's build environment (or root .env.local for local development):

```dotenv
VITE_API_BASE_URL=https://YOUR_BACKEND_DOMAIN/api
```

Rebuild/redeploy the frontend after changing this value. Locally the default is http://localhost:5000/api.

The public Razorpay key ID is returned by the backend with the checkout order.
Neither Razorpay secret belongs in any VITE_ variable.

The frontend requires HTTPS in deployment; localhost is supported for local development.
The storefront and the backend are separate deployments. Deploying only the Vite dist folder does not deploy the Express API.

## 3. Configure Razorpay Test Mode

1. Create/sign in to your Razorpay account.
2. Select Test Mode. Under Account & Settings > API Keys, generate the test key pair.
3. Add the test pair to the backend environment.
4. Configure automatic capture in Razorpay's payment capture settings. An authorized payment remains pending in this app until Razorpay reports it captured.
5. Add a webhook pointing to:

```text
https://YOUR_BACKEND_DOMAIN/api/payments/webhook
```

6. Enter the same separate secret as RAZORPAY_WEBHOOK_SECRET.
7. Subscribe to payment.captured, order.paid, and refund.processed.
8. Enable the webhook. Verify real test deliveries return HTTP 200.

The endpoint must be publicly reachable over HTTPS. For localhost testing, use an HTTPS tunnel to port 5000 and append /api/payments/webhook. Never point it at the frontend-only host unless /api is actually proxied to Express.
Do not place browser login, CSRF checks, or a challenge page in front of this webhook. Its authentication is the Razorpay signature.

Official references:
- [Razorpay quickstart and account setup](https://razorpay.com/docs/payments/quickstart/)
- [Standard Checkout integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/)
- [Webhook setup](https://razorpay.com/docs/payments/dashboard/account-settings/webhooks/)
- [Webhook signature validation](https://razorpay.com/docs/webhooks/validate-test/)
- [Test and live environments](https://razorpay.com/docs/payments/dashboard/test-live-modes/)

## 4. Run a real Test Mode checkout

Use an email/password account created against the actual backend. Old local mock users are no longer accepted.

- Buy one 200g pack: expected amount is INR 399 (349 + 50 shipping), or 39900 paise.
- Buy a 500g pack: expected total is INR 799 with free shipping.
- Complete a successful payment in Razorpay Test Mode. Verify the merchant order is PAID/CONFIRMED and Razorpay reports captured.
- Close the checkout without paying. Verify the internal merchant order stays PENDING, is hidden from My Orders, and the packs remain in the cart.
- Retry from Cart > Continue to checkout. It must reuse the same merchant order and Razorpay order.
- Simulate a failed attempt using Razorpay's documented test options; verify there is no paid confirmation.
- Close the browser after a successful test payment. The webhook must confirm the order without a browser callback.
- Temporarily interrupt verification connectivity. Reopen the order status page and confirm provider reconciliation recovers the captured payment.
- Replay a successful webhook. It must not create a second order/payment or reset fulfillment status.
- Process a full test refund in the Razorpay dashboard; verify the refund webhook updates payment status to REFUNDED.
- Check mobile Razorpay Checkout and the payment methods enabled on your account.

The automated suite simulates Razorpay and does not replace this dashboard/device check.

## 5. Switch to live payments

Complete Razorpay's account activation and live-mode requirements.
Use a separate production database/environment from Test Mode so pending test orders are never retried with live keys.
Set live API credentials in the production backend, configure the production webhook and secret in Live Mode, and verify automatic capture again.
Confirm FRONTEND_URL and VITE_API_BASE_URL match the deployed domains, then redeploy.

Perform an authorized small live purchase yourself, verify capture and the merchant order, and validate your refund process before opening checkout to customers.
Monitor webhook failures, pending captures, provider outages, and database errors. Use infrastructure rate limits for public auth and checkout endpoints, database backups, and restricted admin access.

## Payment behavior and operational limits

- Server prices: backend/src/services/payment-security.ts. Current prices: 200g = 349; 500g = 799; 1000g = 1499. Shipping is 50 below a 500 subtotal, otherwise free. Keep displayed prices in src/OrderPages.tsx aligned when changing the catalogue.
- The browser cannot choose the charged price, currency, payment status, or gateway.
- Each request UUID identifies an immutable checkout. Replays with the same basket/address reuse the order; mismatched contents or customer are rejected.
- Local PostgreSQL advisory locks serialize order/payment changes across backend instances. A provider call that succeeds but loses its response can leave an unused provider order; it is never exposed for payment before the local record is saved.
- Signature verification uses the persisted Razorpay order ID, then fetches provider state and checks order ID, amount, currency and capture.
- Webhooks verify the raw request bytes with a separate secret, then fetch provider state. Settlement is repeatable and monotonic: duplicate or out-of-order events cannot undo paid/refunded status or regress fulfillment.
- Unpaid failed attempts remain PENDING so they can retry the same Razorpay order. Authorization alone never becomes PAID.
- The status page polls for pending orders for about one minute and can reconcile a missed webhook. Refresh later if the provider is still processing.
- Cancellation of an issued payment order is routed to customer care to avoid a cancellation/capture race. The application does not initiate refunds. Process refunds through Razorpay; full processed refunds sync via webhook. Partial refunds are recorded in payment metadata, but do not set the whole order to REFUNDED.
- The insecure placeholder Google login has been disabled and its button removed. Email/password auth is supported; Google OAuth needs a separate verified integration before re-enabling it.
- The separate admin app currently serves sample order/payment data from its in-memory store. It is NOT a live fulfillment/payment dashboard and must not be relied on for real orders. Use the merchant database and Razorpay dashboard until that admin integration is completed.
- This implementation does not add stock reservation, shipping automation, emails, or a full administrative refund system.
- No software change can guarantee zero bugs or replace deployment testing and operational monitoring.

## Automated checks

From backend:

```powershell
npm run test:payments
```

This requires LOCAL PostgreSQL. It creates a randomly named razorpay_test_ schema, simulates Razorpay, checks concurrency/security/reconciliation, then removes only that test schema. It refuses remote database hosts.

From the repository root:

```powershell
npx playwright test tests/razorpay-checkout.spec.ts --workers=1
npm run build
```

Browser tests cover verified success, cancellation, backend failures, pending verification, retry identity, truthful status pages, and no mock authentication fallback.


## Cart and interrupted checkout

The storefront has a persistent /cart page and header cart link. Product selection adds packs to the cart. Checkout edits are saved before payment, so closing the browser or dismissing Razorpay keeps the packs. Only verified payment removes purchased quantities. Customer history includes PAID and REFUNDED purchases; unpaid checkout records remain internal for verification and recovery. The latest interrupted checkout can restore an empty cart after sign-in. A cart payment-status check can recover a captured payment before checkout is retried.
