import { PaymentController } from './controllers/payment.controller';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { errorHandler } from './middleware/error.middleware';
import prisma from './config/prisma';

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || /fallback_secret|change_in_production/i.test(process.env.JWT_SECRET)) throw new Error('Set a strong, unique JWT_SECRET of at least 32 characters.');
const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const configuredOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || '').split(','),
]
  .map(value => value?.trim())
  .filter(Boolean)
  .flatMap(value => {
    try {
      const origin = new URL(value!).origin;
      const url = new URL(origin);
      const hostVariants = url.hostname.startsWith('www.')
        ? [url.hostname.slice(4), url.hostname]
        : [url.hostname, `www.${url.hostname}`];
      return hostVariants.map(hostname => `${url.protocol}//${hostname}${url.port ? `:${url.port}` : ''}`);
    } catch {
      return [];
    }
  });

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  ...configuredOrigins,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.post('/api/payments/webhook', express.raw({ type: 'application/json', limit: '256kb' }), PaymentController.webhook);
app.use(express.json({ limit: '64kb' }));
app.use(express.urlencoded({ extended: true }));

// Root health & welcome
app.get('/', (_req, res) => {
  res.json({
    message: "Welcome to Sham's Chai E-Commerce API",
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      addresses: '/api/addresses',
      orders: '/api/orders',
      payments: '/api/payments',
    },
  });
});

// Main API Routes
app.use('/api', apiRoutes);

// Centralized error handler
app.use(errorHandler);

// Graceful shutdown
const server = app.listen(PORT, () => {
  console.log(`☕ Sham's Chai Backend Server running on port ${PORT}`);
  console.log(`🔗 Health check available at: http://localhost:${PORT}/api/health`);
});

async function shutdown() {
  console.log('\nShutting down server gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Prisma disconnected. Server closed.');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export { app, server };
