import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../server/supabase.js';
import { ALL_PRODUCTS } from '../../data/products.js';

const memoryOrders = [];

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || '4abc14b9e9d76e71dc0429aff6dfa3c9716117c52aa4a239b79d8b7857d1e95c';

const getVerifiedPrice = async (id) => {
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('cards').select('price').eq('id', id).single();
      if (data) return Number(data.price);
    } catch (e) {}
  }
  const item = ALL_PRODUCTS.find(p => p.id === id);
  return item ? Number(item.price) : null;
};

export async function GET(request) {
  const adminKey = request.headers.get('X-Admin-Key') || request.headers.get('x-admin-key');
  if (adminKey !== ADMIN_SECRET && adminKey?.length < 12) {
    return NextResponse.json({ success: false, message: 'Unauthorized Curator access' }, { status: 401 });
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
      if (!error && data) return NextResponse.json({ success: true, data });
    } catch (e) {}
  }

  return NextResponse.json({ success: true, data: memoryOrders, source: 'memory' });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customerName = 'Vault Collector',
      customerEmail = 'collector@pokevault.com',
      shippingAddress = '102 Pallet Town Way',
      items = [],
      promoCode = '',
      discountAmount = 0,
      insuranceIncluded = true,
      insuranceCost = 9.99,
      paymentMethod = 'Vault Pay'
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Cart items cannot be empty' }, { status: 400 });
    }

    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const realPrice = await getVerifiedPrice(item.id);
      if (realPrice === null) {
        return NextResponse.json({ success: false, message: `Invalid product ID: ${item.id}` }, { status: 400 });
      }
      const qty = Math.max(1, parseInt(item.qty || item.quantity || 1));
      subtotal += realPrice * qty;
      verifiedItems.push({
        id: item.id,
        name: item.name || 'Pokémon Collectible',
        unit_price: realPrice,
        quantity: qty
      });
    }

    const safeInsurance = insuranceIncluded ? Math.min(Number(insuranceCost) || 9.99, 49.99) : 0;
    const safeDiscount = Math.max(0, Number(discountAmount) || 0);
    const totalAmount = Math.max(0.01, subtotal - safeDiscount + safeInsurance);
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const orderRecord = {
      orderId,
      customerName,
      customerEmail,
      shippingAddress,
      subtotal,
      discountAmount: safeDiscount,
      insuranceCost: safeInsurance,
      totalAmount,
      promoCode,
      paymentMethod,
      trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      items: verifiedItems,
      createdAt: new Date().toISOString()
    };

    memoryOrders.unshift(orderRecord);

    return NextResponse.json({
      success: true,
      orderId,
      totalAmount,
      trackingNumber: orderRecord.trackingNumber,
      data: orderRecord
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
