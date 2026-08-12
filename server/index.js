import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import cardsRouter from './routes/cards.js';
import inventoryRouter from './routes/inventory.js';
import ordersRouter from './routes/orders.js';
import paypalRouter from './routes/paypal.js';
import { isSupabaseConfigured } from './supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ─── CORS: only allow the storefront origin ────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173', // vite dev
  process.env.STOREFRONT_ORIGIN   // set this in prod .env
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow server-to-server (no origin header) and listed origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key']
}));

// Limit JSON body size to prevent payload flooding
app.use(express.json({ limit: '1mb' }));

// ─── Admin Auth Middleware ─────────────────────────────────────────────────
// All write routes require X-Admin-Key header matching ADMIN_SECRET_KEY env var
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;

export const requireAdmin = (req, res, next) => {
  if (!ADMIN_KEY) {
    return res.status(503).json({ success: false, error: 'Admin key not configured on server.' });
  }
  const provided = req.headers['x-admin-key'];
  if (!provided || provided !== ADMIN_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or missing X-Admin-Key header.'
    });
  }
  next();
};

// ─── API Health Check ──────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'POKÉVAULT LEGENDS Express API',
    supabaseConnected: isSupabaseConfigured(),
    timestamp: new Date().toISOString()
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/cards', cardsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/paypal', paypalRouter);

// Serve static assets and workspace HTML pages
app.use(express.static('.'));
app.use('/public', express.static('public'));

// Root route serves index.html
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: '.' });
});

app.listen(PORT, () => {
  console.log(`
  ================================================================
  ⚡ POKÉVAULT LEGENDS Express Server Running on http://localhost:${PORT}
  DATABASE STATUS: ${isSupabaseConfigured() ? '✅ Supabase Connected' : '⚠️ Local Demo Mode'}
  ADMIN AUTH:      ${ADMIN_KEY ? '✅ Admin Key Set' : '❌ WARNING: ADMIN_SECRET_KEY not set in .env'}
  API BASE URL:    http://localhost:${PORT}/api
  ================================================================
  `);
});
