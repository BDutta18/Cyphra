import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { requestIdMiddleware, requestLogger, errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { HealthController } from './controllers/health.controller.js';
import { balanceRouter } from './routes/balance.routes.js';
import { paymentRouter } from './routes/payment.routes.js';
import { paymentRequestRouter } from './routes/payment-request.routes.js';
import { activityRouter } from './routes/activity.routes.js';
import { networkRouter } from './routes/network.routes.js';

export const app: Express = express();

// Trust reverse proxies (e.g. Nginx, Cloudflare) if deployed behind one
app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// 1. Security Headers (Helmet)
// ---------------------------------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: false, // API server does not serve HTML/scripts
    crossOriginEmbedderPolicy: false,
    hsts: config.isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
  })
);

// ---------------------------------------------------------------------------
// 2. CORS
// ---------------------------------------------------------------------------
const allowedOrigins = config.corsOrigins.includes('*') ? '*' : config.corsOrigins;
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-wallet-address', 'x-request-id'],
    credentials: true,
  })
);

// ---------------------------------------------------------------------------
// 3. Rate Limiting
// ---------------------------------------------------------------------------
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this client. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

app.use('/api', apiLimiter);

// ---------------------------------------------------------------------------
// 4. Request Body Parsing & Tracing
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '1mb' }));
app.use(requestIdMiddleware);
app.use(requestLogger);

// ---------------------------------------------------------------------------
// 5. Core API Endpoints
// ---------------------------------------------------------------------------

// GET /health - Server and Midnight network health
app.get('/health', HealthController.get);

// GET /api/balance - Non-custodial public ledger stats (no private balances)
app.use('/api/balance', balanceRouter);

// POST /api/payments, GET /api/payments/:id - Confidential payment tracking
app.use('/api/payments', paymentRouter);

// POST /api/payment-requests, GET /api/payment-requests/:id - Payment requests
app.use('/api/payment-requests', paymentRequestRouter);

// GET /api/activity - Transaction history for wallet (from header)
app.use('/api/activity', activityRouter);

// GET /api/network - Live Midnight blockchain & indexer metrics
app.use('/api/network', networkRouter);

// Legacy v1 routing support
app.use('/api/v1/requests', paymentRequestRouter);
app.use('/api/v1/activity', activityRouter);
app.use('/api/v1/network', networkRouter);

// ---------------------------------------------------------------------------
// 6. Error & Not Found Handling
// ---------------------------------------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);
