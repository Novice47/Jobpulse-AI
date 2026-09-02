import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { connectDB } from './db/connect.js';
import { errorHandler } from './middleware/errorHandler.js';
import { mongoSanitize } from './middleware/sanitize.js';

import { authRouter } from './modules/auth/routes.js';
import { usersRouter } from './modules/users/routes.js';
import { jobsRouter } from './modules/jobs/routes.js';
import { companiesRouter } from './modules/companies/routes.js';
import { skillsRouter } from './modules/skills/routes.js';
import { marketRouter } from './modules/market/routes.js';
import { salariesRouter } from './modules/salaries/routes.js';
import { resumesRouter } from './modules/resumes/routes.js';
import { jobDescriptionsRouter } from './modules/jobDescriptions/routes.js';
import { careerRouter } from './modules/career/routes.js';
import { applicationsRouter } from './modules/applications/routes.js';
import { alertsRouter } from './modules/alerts/routes.js';
import { notificationsRouter } from './modules/notifications/routes.js';
import { adminRouter } from './modules/admin/routes.js';
import { seedDatabase } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Cross-Origin & Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible frontend asset loading & dev servers
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    originAgentCluster: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    xContentTypeOptions: true,
    xFrameOptions: { action: 'deny' },
    hidePoweredBy: true,
  })
);

// 2. Universal CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
  })
);

// 3. Rate Limiters
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please slow down and retry in a few minutes.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts. Please retry after a few minutes.' },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 35,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Upload rate limit reached. Please wait a few moments before next upload.' },
});

app.use('/api/', globalApiLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/signup', authLimiter);
app.use('/api/v1/resumes/upload', uploadLimiter);

// 4. Request Parsing & NoSQL Injection Sanitization
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize);

// 5. Healthcheck Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    cors: 'enabled-universal',
    security: 'hardened',
    timestamp: new Date().toISOString(),
  });
});

// 6. API v1 Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/jobs', jobsRouter);
app.use('/api/v1/companies', companiesRouter);
app.use('/api/v1/skills', skillsRouter);
app.use('/api/v1/market', marketRouter);
app.use('/api/v1/salaries', salariesRouter);
app.use('/api/v1/resumes', resumesRouter);
app.use('/api/v1/job-descriptions', jobDescriptionsRouter);
app.use('/api/v1/career', careerRouter);
app.use('/api/v1/applications', applicationsRouter);
app.use('/api/v1/alerts', alertsRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/admin', adminRouter);

// 7. Static Frontend Build Serving & Production SPA Fallback Routing
const candidateWebDistPaths = [
  path.resolve(__dirname, '../../web/dist'), // Production server: apps/api/dist -> apps/web/dist
  path.resolve(__dirname, '../../../apps/web/dist'), // Nested dist: apps/api/dist/src -> apps/web/dist
  path.resolve(process.cwd(), 'apps/web/dist'), // Root working directory
  path.resolve(process.cwd(), '../web/dist'), // Relative from apps/api directory
];

const webDistPath = candidateWebDistPaths.find((p) => fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html')));

if (webDistPath) {
  console.log(`[JobPulse Production Server] Serving static React frontend from: ${webDistPath}`);
  app.use(express.static(webDistPath));

  // SPA Route Fallback: Any non-API request serves the React frontend index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(webDistPath, 'index.html'));
  });
} else {
  console.warn('[JobPulse Production Notice] Frontend dist directory not found. Run "npm run build" to build the React application UI.');
}

// 8. Centralized Error Handler
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();
    await seedDatabase().catch((e) => console.log('Seed check completed / skipped:', e.message));
  } catch (err) {
    console.warn('[MongoDB Warning] Could not connect to MongoDB. Serving fallback mode.', err);
  }

  app.listen(config.port, () => {
    console.log(`[JobPulse Platform] Running securely on port ${config.port} (CWD: ${process.cwd()})`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app };
