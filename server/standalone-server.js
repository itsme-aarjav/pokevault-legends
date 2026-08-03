/**
 * POKÉVAULT LEGENDS — Standalone Zero-Dependency Backend Server
 * Powered by Node.js 20 Native HTTP Module
 */
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import { CARDS_DATA } from '../src/data/cards.js';

const PORT = process.env.PORT || 5001;
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = SUPABASE_URL && !SUPABASE_URL.includes('your-project-id');

// Local in-memory databases
const memoryOrders = [];
const memoryInventory = {};
CARDS_DATA.forEach(c => {
  memoryInventory[c.id] = {
    cardId: c.id,
    stockQuantity: c.inStock || 1,
    reservedQuantity: 0,
    lowStockThreshold: 1,
    isInStock: (c.inStock || 1) > 0,
    lastRestockedAt: new Date().toISOString()
  };
});

const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // 1. Health Check
  if (pathname === '/api/health') {
    return sendJSON(res, 200, {
      status: 'online',
      service: 'POKÉVAULT LEGENDS Backend Server',
      supabaseConnected: isSupabaseConfigured,
      timestamp: new Date().toISOString()
    });
  }

  // 2. GET /api/cards
  if (pathname === '/api/cards' && req.method === 'GET') {
    let cards = [...CARDS_DATA];
    if (query.era && query.era !== 'all') {
      cards = cards.filter(c => c.eraCode === query.era);
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      cards = cards.filter(c => c.name.toLowerCase().includes(q) || c.rarity.toLowerCase().includes(q));
    }
    return sendJSON(res, 200, { success: true, count: cards.length, data: cards });
  }

  // 3. GET /api/cards/:id
  if (pathname.startsWith('/api/cards/') && req.method === 'GET') {
    const id = pathname.replace('/api/cards/', '');
    const card = CARDS_DATA.find(c => c.id === id);
    if (!card) return sendJSON(res, 404, { success: false, message: 'Card not found' });
    return sendJSON(res, 200, { success: true, data: card });
  }

  // 4. GET /api/inventory
  if (pathname === '/api/inventory' && req.method === 'GET') {
    return sendJSON(res, 200, { success: true, count: Object.keys(memoryInventory).length, data: Object.values(memoryInventory) });
  }

  // 5. POST /api/orders
  if (pathname === '/api/orders' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const items = payload.items || [];
        
        let subtotal = 0;
        const lineItems = items.map(item => {
          const qty = item.qty || item.quantity || 1;
          const price = Number(item.price || 0);
          subtotal += price * qty;
          return { cardId: item.id || item.cardId, cardName: item.name, unitPrice: price, quantity: qty };
        });

        const orderRecord = {
          id: orderId,
          customerName: payload.customerName || 'Vault Collector',
          customerEmail: payload.customerEmail || 'collector@pokevault.com',
          subtotal,
          totalAmount: Math.max(0, subtotal - (payload.discountAmount || 0) + 9.99),
          orderStatus: 'dispatched',
          items: lineItems,
          createdAt: new Date().toISOString()
        };

        memoryOrders.unshift(orderRecord);
        return sendJSON(res, 201, { success: true, message: '★ ORDER DISPATCHED!', orderId, data: orderRecord });
      } catch (err) {
        return sendJSON(res, 400, { success: false, message: 'Invalid JSON payload' });
      }
    });
    return;
  }

  // 6. GET /api/orders
  if (pathname === '/api/orders' && req.method === 'GET') {
    return sendJSON(res, 200, { success: true, count: memoryOrders.length, data: memoryOrders });
  }

  // 7. POST /api/paypal/create-order
  if (pathname === '/api/paypal/create-order' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const items = payload.items || [];
        let subtotal = 0;
        items.forEach(i => { subtotal += Number(i.price || 0) * (i.qty || 1); });
        const total = Math.max(0.01, subtotal - (payload.discountAmount || 0) + (payload.insuranceIncluded ? (payload.insuranceCost || 9.99) : 0));
        return sendJSON(res, 200, {
          success: true,
          orderID: `PAYPAL-ORD-${Date.now()}`,
          purchaseUnits: [{ amount: { currency_code: 'USD', value: total.toFixed(2) } }]
        });
      } catch (err) {
        return sendJSON(res, 400, { success: false, message: 'Invalid JSON' });
      }
    });
    return;
  }

  // 8. POST /api/paypal/capture-order
  if (pathname === '/api/paypal/capture-order' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const orderId = `PV-PAYPAL-${Date.now()}`;
        const record = { id: orderId, paypalOrderId: payload.paypalOrderId, status: 'paypal_completed', createdAt: new Date().toISOString() };
        memoryOrders.unshift(record);
        return sendJSON(res, 200, { success: true, message: '★ PAYPAL PAYMENT CAPTURED!', orderId, data: record });
      } catch (err) {
        return sendJSON(res, 400, { success: false, message: 'Invalid JSON' });
      }
    });
    return;
  }

  // Root Welcome Page
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <div style="font-family: monospace; background: #FFF056; color: #000; padding: 2rem;">
      <h1 style="color: #D32F10;">⚡ POKÉVAULT LEGENDS BACKEND SERVER</h1>
      <p>Status: ONLINE | Port: ${PORT} | Supabase Mode: ${isSupabaseConfigured ? 'CONNECTED' : 'LOCAL'}</p>
      <ul>
        <li><a href="/api/health">/api/health</a></li>
        <li><a href="/api/cards">/api/cards</a></li>
        <li><a href="/api/inventory">/api/inventory</a></li>
        <li><a href="/api/orders">/api/orders</a></li>
      </ul>
    </div>
  `);
});

server.listen(PORT, () => {
  console.log(`⚡ POKÉVAULT Standalone Server running on http://localhost:${PORT}`);
});
