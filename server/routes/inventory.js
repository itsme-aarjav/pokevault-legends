import { Router } from 'express';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import { CARDS_DATA } from '../../src/data/cards.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// In-memory fallback stock database
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

// GET /api/inventory — Get stock levels for all cards
router.get('/', async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('inventory')
        .select(`*, cards ( id, name, grade, price, image )`);
      if (error) throw error;
      return res.json({ success: true, count: data.length, data });
    }
    return res.json({ success: true, count: Object.keys(memoryInventory).length, data: Object.values(memoryInventory), source: 'local' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/inventory/:cardId — Get stock level for a single card
router.get('/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('inventory').select('*').eq('card_id', cardId).single();
      if (error) return res.status(404).json({ success: false, message: 'Inventory record not found' });
      return res.json({ success: true, data });
    }
    const item = memoryInventory[cardId];
    if (!item) return res.status(404).json({ success: false, message: 'Card inventory not found' });
    return res.json({ success: true, data: item, source: 'local' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/inventory/:cardId — Update stock quantity [ADMIN PROTECTED]
router.put('/:cardId', requireAdmin, async (req, res) => {
  try {
    const { cardId } = req.params;
    const { stockQuantity, reservedQuantity, action } = req.body;

    // Validate quantities are non-negative integers
    if (stockQuantity !== undefined && (isNaN(stockQuantity) || Number(stockQuantity) < 0)) {
      return res.status(400).json({ success: false, message: 'stockQuantity must be a non-negative number' });
    }

    if (isSupabaseConfigured()) {
      let updatePayload = { updated_at: new Date().toISOString() };
      if (stockQuantity !== undefined) updatePayload.stock_quantity = Number(stockQuantity);
      if (reservedQuantity !== undefined) updatePayload.reserved_quantity = Math.max(0, Number(reservedQuantity));

      const { data, error } = await supabase.from('inventory').update(updatePayload).eq('card_id', cardId).select();
      if (error) throw error;
      return res.json({ success: true, message: 'Inventory updated in Supabase', data });
    }

    // Local in-memory update
    if (!memoryInventory[cardId]) {
      memoryInventory[cardId] = { cardId, stockQuantity: 1, reservedQuantity: 0, lowStockThreshold: 1, isInStock: true };
    }
    if (action === 'decrement') {
      memoryInventory[cardId].stockQuantity = Math.max(0, memoryInventory[cardId].stockQuantity - 1);
    } else if (stockQuantity !== undefined) {
      memoryInventory[cardId].stockQuantity = Number(stockQuantity);
    }
    memoryInventory[cardId].isInStock = memoryInventory[cardId].stockQuantity > 0;
    return res.json({ success: true, message: 'Inventory updated locally', data: memoryInventory[cardId] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
