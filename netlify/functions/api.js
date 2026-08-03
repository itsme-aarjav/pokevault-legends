import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import dotenv from 'dotenv';

import cardsRouter from '../../server/routes/cards.js';
import inventoryRouter from '../../server/routes/inventory.js';
import ordersRouter from '../../server/routes/orders.js';
import paypalRouter from '../../server/routes/paypal.js';
import { isSupabaseConfigured } from '../../server/supabase.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'POKÉVAULT LEGENDS Netlify Serverless API',
    supabaseConnected: isSupabaseConfigured(),
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/cards', cardsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/paypal', paypalRouter);

export const handler = serverless(app);
