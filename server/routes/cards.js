import { Router } from 'express';
import { supabase, isSupabaseConfigured } from '../supabase.js';
import { ALL_PRODUCTS } from '../../src/data/products.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/cards or /api/products — Retrieve all products
router.get('/', async (req, res) => {
  try {
    const { category, era, search, trending, featured, pokemon } = req.query;

    if (isSupabaseConfigured()) {
      let query = supabase.from('cards').select('*');
      if (category && category !== 'all') query = query.eq('category', category);
      if (era && era !== 'all') query = query.eq('era_code', era);
      if (trending === 'true') query = query.eq('is_trending', true);
      if (featured === 'true') query = query.eq('is_featured', true);
      if (search) query = query.or(`name.ilike.%${search}%,rarity.ilike.%${search}%`);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return res.json({ success: true, count: data.length, data });
      }
    }

    // Fallback to master ALL_PRODUCTS catalog
    let list = [...ALL_PRODUCTS];
    if (category && category !== 'all') list = list.filter(c => c.category === category);
    if (pokemon && pokemon !== 'all') list = list.filter(c => c.pokemon.toLowerCase() === pokemon.toLowerCase());
    if (era && era !== 'all') list = list.filter(c => c.eraCode === era);
    if (trending === 'true') list = list.filter(c => c.isTrending);
    if (featured === 'true') list = list.filter(c => c.isFeatured);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || (c.categoryName && c.categoryName.toLowerCase().includes(q)));
    }

    return res.json({ success: true, count: list.length, data: list, source: 'local' });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/cards/:id — Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('cards').select('*').eq('id', id).single();
      if (!error && data) return res.json({ success: true, data });
    }

    const product = ALL_PRODUCTS.find(c => c.id === id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.json({ success: true, data: product, source: 'local' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
