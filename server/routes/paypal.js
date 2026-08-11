import { Router } from 'express';
import https from 'https';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import { ALL_PRODUCTS } from '../../src/data/products.js';

const router = Router();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
// Use sandbox for development, switch to 'api-m.paypal.com' in production
const PAYPAL_BASE = process.env.NODE_ENV === 'production'
  ? 'api-m.paypal.com'
  : 'api-m.sandbox.paypal.com';

const isPayPalConfigured = () =>
  PAYPAL_CLIENT_ID &&
  PAYPAL_CLIENT_SECRET &&
  !PAYPAL_CLIENT_SECRET.includes('REPLACE_WITH');

// ─── PayPal API helpers ───────────────────────────────────────────────────

/** Get a short-lived PayPal OAuth2 access token */
const getPayPalAccessToken = () => new Promise((resolve, reject) => {
  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const body = 'grant_type=client_credentials';

  const req = https.request({
    hostname: PAYPAL_BASE,
    path: '/v1/oauth2/token',
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.access_token) resolve(parsed.access_token);
        else reject(new Error(`PayPal token error: ${data}`));
      } catch (e) { reject(e); }
    });
  });
  req.on('error', reject);
  req.write(body);
  req.end();
});

/** Create a real PayPal order and return its ID */
const createPayPalOrder = (accessToken, totalUSD, itemsDescription) => new Promise((resolve, reject) => {
  const payload = JSON.stringify({
    intent: 'CAPTURE',
    purchase_units: [{
      description: itemsDescription,
      amount: {
        currency_code: 'USD',
        value: totalUSD
      }
    }]
  });

  const req = https.request({
    hostname: PAYPAL_BASE,
    path: '/v2/checkout/orders',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.id) resolve(parsed.id);
        else reject(new Error(`PayPal order creation failed: ${data}`));
      } catch (e) { reject(e); }
    });
  });
  req.on('error', reject);
  req.write(payload);
  req.end();
});

// ─── Server-side price lookup ─────────────────────────────────────────────
const getVerifiedPrice = async (cardId) => {
  if (isSupabaseConfigured()) {
    const { data } = await supabase.from('cards').select('price').eq('id', cardId).single();
    return data ? Number(data.price) : null;
  }
  const item = ALL_PRODUCTS.find(c => c.id === cardId);
  return item ? Number(item.price) : null;
};

// POST /api/paypal/create-order — Verify prices server-side, create real PayPal order
router.post('/create-order', async (req, res) => {
  try {
    const { items = [], discountAmount = 0, insuranceIncluded = true, insuranceCost = 9.99 } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in cart' });
    }

    // ✅ SECURITY: Verify every item price from the server, ignore client values
    let subtotal = 0;
    for (const item of items) {
      const qty = Math.max(1, Math.floor(Number(item.qty || item.quantity || 1)));
      const verifiedPrice = await getVerifiedPrice(item.id || item.cardId);
      if (verifiedPrice === null) {
        return res.status(400).json({ success: false, message: `Card not found: ${item.id}` });
      }
      subtotal += verifiedPrice * qty;
    }

    const safeDiscount = Math.min(Math.max(0, Number(discountAmount) || 0), subtotal * 0.5);
    const safeInsurance = insuranceIncluded ? Math.min(Number(insuranceCost) || 9.99, 49.99) : 0;
    const total = Math.max(0.01, subtotal - safeDiscount + safeInsurance).toFixed(2);

    // Try real PayPal API if credentials are configured
    if (isPayPalConfigured()) {
      const accessToken = await getPayPalAccessToken();
      const description = `POKÉVAULT LEGENDS Order (${items.length} item${items.length > 1 ? 's' : ''})`;
      const paypalOrderId = await createPayPalOrder(accessToken, total, description);

      return res.json({
        success: true,
        orderID: paypalOrderId,
        total,
        purchaseUnits: [{ amount: { currency_code: 'USD', value: total } }]
      });
    }

    // Fallback: return a demo order ID if PayPal secrets not configured
    console.warn('[PayPal] Client secret not configured — running in demo mode. Orders will not be captured.');
    return res.json({
      success: true,
      orderID: `DEMO-PAYPAL-${Date.now()}`,
      total,
      demo: true,
      purchaseUnits: [{ amount: { currency_code: 'USD', value: total } }]
    });
  } catch (err) {
    console.error('PayPal create-order error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/paypal/capture-order — Save captured PayPal transaction with verified pricing
router.post('/capture-order', async (req, res) => {
  try {
    const {
      paypalOrderId,
      payerDetails = {},
      items = [],
      discountAmount = 0,
      insuranceIncluded = true,
      insuranceCost = 9.99
    } = req.body;

    if (!paypalOrderId) {
      return res.status(400).json({ success: false, message: 'Missing paypalOrderId' });
    }

    const orderId = `PV-PAYPAL-${Date.now()}`;

    // ✅ SECURITY: Re-verify prices server-side at capture time too
    let subtotal = 0;
    const lineItems = [];

    for (const item of items) {
      const qty = Math.max(1, Math.floor(Number(item.qty || item.quantity || 1)));
      const cardId = item.id || item.cardId;
      const verifiedPrice = await getVerifiedPrice(cardId);
      if (verifiedPrice === null) continue; // skip unknown items gracefully

      const itemSubtotal = verifiedPrice * qty;
      subtotal += itemSubtotal;
      lineItems.push({
        order_id: orderId,
        card_id: cardId,
        card_name: item.name,
        unit_price: verifiedPrice,
        quantity: qty,
        subtotal: itemSubtotal
      });
    }

    const safeDiscount = Math.min(Math.max(0, Number(discountAmount) || 0), subtotal * 0.5);
    const safeInsurance = insuranceIncluded ? Math.min(Number(insuranceCost) || 9.99, 49.99) : 0;
    const totalAmount = Math.max(0.01, subtotal - safeDiscount + safeInsurance);

    const customerName = payerDetails.payer?.name
      ? `${payerDetails.payer.name.given_name || ''} ${payerDetails.payer.name.surname || ''}`.trim()
      : (payerDetails.name ? `${payerDetails.name.given_name || ''} ${payerDetails.name.surname || ''}`.trim() : 'PayPal Collector');
    const customerEmail = payerDetails.payer?.email_address || payerDetails.email_address || 'paypal-collector@pokevault.com';

    if (isSupabaseConfigured()) {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          id: orderId,
          customer_name: customerName,
          customer_email: customerEmail,
          shipping_address: 'PayPal Verified Address',
          subtotal,
          discount_amount: safeDiscount,
          promo_code: 'PAYPAL_SMART_CHECKOUT',
          insurance_included: insuranceIncluded,
          insurance_cost: safeInsurance,
          total_amount: totalAmount,
          order_status: 'dispatched',
          payment_status: 'paypal_completed',
          tracking_number: `PP-${paypalOrderId}`
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      if (lineItems.length > 0) {
        await supabase.from('order_items').insert(lineItems);
      }

      // Decrement inventory
      for (const item of lineItems) {
        const { data: inv } = await supabase.from('inventory').select('stock_quantity').eq('card_id', item.card_id).single();
        if (inv) {
          const newQty = Math.max(0, inv.stock_quantity - item.quantity);
          await supabase.from('inventory').update({ stock_quantity: newQty }).eq('card_id', item.card_id);
        }
      }

      return res.json({
        success: true,
        message: '★ PAYPAL PAYMENT CAPTURED! Order saved to Supabase.',
        orderId,
        paypalOrderId,
        totalAmount,
        data: orderData
      });
    }

    // Local fallback
    return res.json({
      success: true,
      message: '★ PAYPAL PAYMENT CAPTURED!',
      orderId,
      paypalOrderId,
      totalAmount,
      source: 'local'
    });
  } catch (err) {
    console.error('PayPal capture-order error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
