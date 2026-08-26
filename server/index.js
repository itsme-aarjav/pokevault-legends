import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import cardsRouter from './routes/cards.js';
import inventoryRouter from './routes/inventory.js';
import ordersRouter from './routes/orders.js';
import paypalRouter from './routes/paypal.js';
import { isSupabaseConfigured } from './supabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const PUBLIC_DIR = path.resolve(__dirname, '../public');

const app = express();
const PORT = process.env.PORT || 5001;

// ─── CORS: Allowed storefront, ALB, and local development origins ─────────
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://pokemon-app-alb-820885629.ap-south-1.elb.amazonaws.com',
  process.env.STOREFRONT_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key']
}));

// Limit JSON body size to prevent payload flooding
app.use(express.json({ limit: '1mb' }));

// ─── Admin Auth Middleware ─────────────────────────────────────────────────
import { requireAdmin } from './middleware/auth.js';
export { requireAdmin };


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

// Serve static assets from Vite production build in dist/
app.use(express.static(DIST_DIR, { extensions: ['html'] }));
app.use('/public', express.static(PUBLIC_DIR));

// Dynamic client routes fallback
app.get('/product/*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'product.html'));
});

app.get('/category/*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'category.html'));
});

app.get('/blog/*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'blog-post.html'));
});

// Root route and SPA fallback for non-API client navigation
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
  ================================================================
  ⚡ POKÉVAULT LEGENDS Express Server Running on http://localhost:${PORT}
  DATABASE STATUS: ${isSupabaseConfigured() ? '✅ Supabase Connected' : '⚠️ Local Demo Mode'}
  ADMIN AUTH:      ${process.env.ADMIN_SECRET_KEY ? '✅ Admin Key Set' : '❌ WARNING: ADMIN_SECRET_KEY not set in .env'}
  API BASE URL:    http://localhost:${PORT}/api
  ================================================================
  `);
});
