import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../server/supabase.js';
import { ALL_PRODUCTS } from '../../data/products.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const trending = searchParams.get('trending');
  const featured = searchParams.get('featured');

  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('cards').select('*');
      if (category && category !== 'all') query = query.eq('category', category);
      if (trending === 'true') query = query.eq('is_trending', true);
      if (featured === 'true') query = query.eq('is_featured', true);
      if (search) query = query.or(`name.ilike.%${search}%,rarity.ilike.%${search}%`);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, count: data.length, data });
      }
    } catch (e) {
      console.warn('Supabase query fallback to local catalog:', e);
    }
  }

  let list = [...ALL_PRODUCTS];
  if (category && category !== 'all') list = list.filter(c => c.category === category);
  if (trending === 'true') list = list.filter(c => c.isTrending);
  if (featured === 'true') list = list.filter(c => c.isFeatured);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(c => c.name.toLowerCase().includes(q) || (c.categoryName && c.categoryName.toLowerCase().includes(q)));
  }

  return NextResponse.json({ success: true, count: list.length, data: list, source: 'local' });
}
