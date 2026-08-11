import { Router } from 'express';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import { ALL_PRODUCTS } from '../../src/data/products.js';
import { requireAdmin } from '../index.js';

const router = Router();

// In-memory store for orders when running in offline/demo mode
const memoryOrders = [];

// ─── Server-side price lookup ─────────────────────────────────────────────
// SECURITY: Never trust client-sent prices. Always look up the real price
// from the authoritative source (Supabase or master ALL_PRODUCTS catalog).
const getVerifiedPrice = async (cardId) => {
  if (isSupabaseConfigured()) {
    const { data } = await supabase.from('cards').select('price').eq('id', cardId).single();
    if (data) return Number(data.price);
  }
  const item = ALL_PRODUCTS.find(c => c.id === cardId);
  return item ? Number(item.price) : null;
};

// POST /api/orders — Create a new customer order with verified pricing
router.post('/', async (req, res) => {
  try {
    const {
      customerName = 'Vault Collector',
      customerEmail = 'collector@pokevault.com',
      shippingAddress = '',
      items = [],
      promoCode = '',
      discountAmount = 0.00,
      insuranceIncluded = true,
      insuranceCost = 9.99
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    // Cap insurance cost to expected value to prevent manipulation
    const safeInsuranceCost = Math.min(Number(insuranceCost) || 9.99, 49.99);
    const safeDiscountAmount = Math.max(0, Number(discountAmount) || 0);

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let subtotal = 0;
    const lineItems = [];

    for (const item of items) {
      const qty = Math.max(1, Math.floor(Number(item.qty || item.quantity || 1)));
      const cardId = item.id || item.cardId;

      // ✅ SECURITY: Look up real price server-side, ignore client-sent price
      const verifiedPrice = await getVerifiedPrice(cardId);
      if (verifiedPrice === null) {
        return res.status(400).json({ success: false, message: `Card not found: ${cardId}` });
      }
      if (verifiedPrice <= 0) {
        return res.status(400).json({ success: false, message: `Invalid price for card: ${cardId}` });
      }

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

    // Cap discount to at most 50% of subtotal (fraud prevention)
    const cappedDiscount = Math.min(safeDiscountAmount, subtotal * 0.5);
    const totalAmount = Math.max(0.01, subtotal - cappedDiscount + (insuranceIncluded ? safeInsuranceCost : 0));

    if (isSupabaseConfigured()) {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          id: orderId,
          customer_name: customerName,
          customer_email: customerEmail,
          shipping_address: shippingAddress,
          subtotal,
          discount_amount: cappedDiscount,
          promo_code: promoCode,
          insurance_included: insuranceIncluded,
          insurance_cost: safeInsuranceCost,
          total_amount: totalAmount,
          order_status: 'dispatched',
          payment_status: 'completed',
          tracking_number: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert line items
      const { error: itemsError } = await supabase.from('order_items').insert(lineItems);
      if (itemsError) throw itemsError;

      // Decrement inventory stock for each purchased card
      for (const item of lineItems) {
        const { data: inv } = await supabase.from('inventory').select('stock_quantity').eq('card_id', item.card_id).single();
        if (inv) {
          const newQty = Math.max(0, inv.stock_quantity - item.quantity);
          await supabase.from('inventory').update({ stock_quantity: newQty }).eq('card_id', item.card_id);
        }
      }

      return res.status(201).json({
        success: true,
        message: '★ ORDER DISPATCHED! Saved to Supabase & inventory updated.',
        orderId,
        totalAmount,
        data: orderData
      });
    }

    // Local In-Memory Fallback
    const orderRecord = {
      id: orderId,
      customerName,
      customerEmail,
      shippingAddress,
      subtotal,
      discountAmount: cappedDiscount,
      promoCode,
      insuranceIncluded,
      insuranceCost: safeInsuranceCost,
      totalAmount,
      orderStatus: 'dispatched',
      trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      items: lineItems,
      createdAt: new Date().toISOString()
    };

    memoryOrders.unshift(orderRecord);
    return res.status(201).json({
      success: true,
      message: '★ ORDER DISPATCHED!',
      orderId,
      totalAmount,
      data: orderRecord,
      source: 'local'
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders — Get all customer orders [ADMIN PROTECTED]
router.get('/', requireAdmin, async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, order_items ( * )`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.json({ success: true, count: data.length, data });
    }
    return res.json({ success: true, count: memoryOrders.length, data: memoryOrders, source: 'local' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/:id — Get order details by ID [ADMIN PROTECTED]
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, order_items ( * )`)
        .eq('id', id)
        .single();
      if (error) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, data });
    }
    const order = memoryOrders.find(o => o.id === id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({ success: true, data: order, source: 'local' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
