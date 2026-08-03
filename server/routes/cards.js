import { Router } from 'express';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import { CARDS_DATA } from '../../src/data/cards.js';
import { requireAdmin } from '../index.js';

const router = Router();

// GET /api/cards — Retrieve all cards (with optional era, search, trending filter)
router.get('/', async (req, res) => {
  try {
    const { era, search, trending, featured } = req.query;

    if (isSupabaseConfigured()) {
      let query = supabase.from('cards').select('*');
      if (era && era !== 'all') query = query.eq('era_code', era);
      if (trending === 'true') query = query.eq('is_trending', true);
      if (featured === 'true') query = query.eq('is_featured', true);
      if (search) query = query.or(`name.ilike.%${search}%,rarity.ilike.%${search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return res.json({ success: true, count: data.length, data });
    }

    // Fallback to local CARDS_DATA
    let cards = [...CARDS_DATA];
    if (era && era !== 'all') cards = cards.filter(c => c.eraCode === era);
    if (trending === 'true') cards = cards.filter(c => c.isTrending);
    if (featured === 'true') cards = cards.filter(c => c.isFeatured);
    if (search) {
      const q = search.toLowerCase();
      cards = cards.filter(c => c.name.toLowerCase().includes(q) || c.rarity.toLowerCase().includes(q));
    }

    return res.json({ success: true, count: cards.length, data: cards, source: 'local' });
  } catch (err) {
    console.error('Error fetching cards:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/cards/:id — Get single card by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('cards').select('*').eq('id', id).single();
      if (error) return res.status(404).json({ success: false, message: 'Card not found in database' });
      return res.json({ success: true, data });
    }

    const card = CARDS_DATA.find(c => c.id === id);
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
    return res.json({ success: true, data: card, source: 'local' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cards — Add a new card [ADMIN PROTECTED]
router.post('/', requireAdmin, async (req, res) => {
  try {
    const newCard = req.body;
    if (!newCard.id || !newCard.name || !newCard.price) {
      return res.status(400).json({ success: false, message: 'Missing required card fields (id, name, price)' });
    }
    // Ensure price is a valid positive number
    newCard.price = Math.abs(Number(newCard.price));
    if (!newCard.price) return res.status(400).json({ success: false, message: 'Price must be a positive number' });

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('cards').insert([newCard]).select();
      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Card created in Supabase', data });
    }

    CARDS_DATA.push(newCard);
    return res.status(201).json({ success: true, message: 'Card added locally', data: newCard });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/cards/:id — Update card details [ADMIN PROTECTED]
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    // Don't allow price to be set to zero or negative
    if (updates.price !== undefined) {
      updates.price = Math.abs(Number(updates.price));
      if (!updates.price) return res.status(400).json({ success: false, message: 'Price must be a positive number' });
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('cards').update(updates).eq('id', id).select();
      if (error) throw error;
      return res.json({ success: true, message: 'Card updated in Supabase', data });
    }

    const idx = CARDS_DATA.findIndex(c => c.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Card not found' });
    CARDS_DATA[idx] = { ...CARDS_DATA[idx], ...updates };
    return res.json({ success: true, message: 'Card updated locally', data: CARDS_DATA[idx] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
