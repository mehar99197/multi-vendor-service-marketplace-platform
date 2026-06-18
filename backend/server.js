import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import providerRoutes from './routes/providers.js';
import serviceRoutes from './routes/services.js';
import requestRoutes from './routes/requests.js';
import projectRoutes from './routes/projects.js';
import reviewRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import taskRoutes from './routes/tasks.js';
import noteRoutes from './routes/notes.js';

// Fail fast on a missing/weak signing secret — HS256 is only as strong as the secret.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET is missing or too short (must be >= 32 characters).');
}

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // behind Vercel/proxy: use the real client IP for rate limiting

app.use(helmet());

// CORS: CLIENT_URL may be a comma-separated allow-list (no trailing slash).
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(mongoSanitize()); // strip $-prefixed / dotted keys (NoSQL operator injection defense-in-depth)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Ensure MongoDB is connected before any data route (cached after the first call).
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ message: 'Database unavailable' });
  }
});

// Throttle credential endpoints to blunt brute-force / credential-stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: { message: 'Too many attempts. Please try again later.' },
});
app.use(['/api/auth/login', '/api/auth/register'], authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);

// Centralised error handler — never leak internal error details to clients in production.
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  const status = err.status || 500;
  const message =
    status < 500 ? err.message : process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  res.status(status).json({ message });
});

// Local / long-running mode only. On Vercel (NODE_ENV=production) the app is invoked
// as a serverless function via the default export below, so we must NOT call listen().
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  connectDB().catch((e) => console.error('Initial DB connection failed:', e.message));
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
