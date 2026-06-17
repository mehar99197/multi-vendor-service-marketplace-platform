import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import providerRoutes from './routes/providers.js';
import serviceRoutes from './routes/services.js';
import requestRoutes from './routes/requests.js';
import projectRoutes from './routes/projects.js';
import reviewRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';

const app = express();

// CORS: CLIENT_URL may be a comma-separated list of allowed origins.
// In production set it to the deployed frontend URL (no trailing slash).
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser tools (no Origin header) and any allow-listed origin
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Ensure MongoDB is connected before any data route runs. After the first call
// this resolves instantly from the cached connection (see config/db.js).
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ message: 'Database unavailable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Local / long-running mode only. On Vercel (NODE_ENV=production) the app is invoked
// as a serverless function via the default export below, so we must NOT call listen().
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  connectDB().catch((e) => console.error('Initial DB connection failed:', e.message));
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
