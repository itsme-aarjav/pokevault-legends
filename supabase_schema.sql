-- ============================================================================
-- POKÉVAULT LEGENDS — COMPLETE SUPABASE DATABASE SCHEMA & DATA MIGRATION
-- ============================================================================

-- 1. CARDS / PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.cards (
  id TEXT PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  sub_name TEXT,
  category TEXT NOT NULL DEFAULT 'trading-cards',
  category_name TEXT NOT NULL DEFAULT 'Trading Cards',
  pokemon TEXT NOT NULL DEFAULT 'Pikachu',
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2),
  discount_percent INTEGER,
  image TEXT NOT NULL,
  gallery JSONB DEFAULT '[]'::jsonb,
  short_description TEXT,
  description TEXT,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  review_count INTEGER DEFAULT 1,
  in_stock INTEGER DEFAULT 10,
  availability TEXT DEFAULT 'In Stock',
  tags JSONB DEFAULT '[]'::jsonb,
  badge TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  specs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id TEXT REFERENCES public.cards(id) ON DELETE CASCADE UNIQUE,
  stock_count INTEGER NOT NULL DEFAULT 10,
  reserved_count INTEGER NOT NULL DEFAULT 0,
  warehouse_location TEXT DEFAULT 'Vault Alpha-1',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) DEFAULT 0.00,
  insurance_cost NUMERIC(10, 2) DEFAULT 9.99,
  total_amount NUMERIC(10, 2) NOT NULL,
  promo_code TEXT,
  payment_method TEXT DEFAULT 'PayPal',
  payment_status TEXT DEFAULT 'COMPLETED',
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT REFERENCES public.orders(order_id) ON DELETE CASCADE,
  card_id TEXT REFERENCES public.cards(id),
  card_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  item_total NUMERIC(10, 2) NOT NULL
);

-- 5. STORE SETTINGS TABLE (Hype Drop & VIP Gate Lock)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  is_hype_drop_active BOOLEAN DEFAULT false,
  drop_password TEXT DEFAULT 'POKEVAULTVIP',
  drop_timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now() + interval '3 days'),
  opt_in_count INTEGER DEFAULT 342,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add Cross-Sell & TCG Market Price fields to cards table if not exists
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS cross_sell_id TEXT REFERENCES public.cards(id);
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS bundle_discount INTEGER DEFAULT 10;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS tcg_market_price NUMERIC(10, 2);

-- Insert default store settings record if not present
INSERT INTO public.store_settings (id, is_hype_drop_active, drop_password, drop_timestamp, opt_in_count)
VALUES ('default', false, 'POKEVAULTVIP', now() + interval '3 days', 342)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Read policies for public catalog access (Cards, Inventory, Store Settings)
CREATE POLICY "Public Cards Select Policy" ON public.cards FOR SELECT USING (true);
CREATE POLICY "Public Inventory Select Policy" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Public Store Settings Select Policy" ON public.store_settings FOR SELECT USING (true);

-- Public Insert Policies (Allow customers to place orders at checkout)
CREATE POLICY "Public Orders Insert Policy" ON public.orders FOR INSERT WITH CHECK (
  auth.role() IN ('anon', 'authenticated', 'service_role')
);
CREATE POLICY "Public Order Items Insert Policy" ON public.order_items FOR INSERT WITH CHECK (
  auth.role() IN ('anon', 'authenticated', 'service_role')
);

-- Secure Admin Policies (Uses app_metadata and service_role — user_metadata is avoided for security)
CREATE POLICY "Admin Cards All Policy" ON public.cards FOR ALL USING (
  (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin') OR (auth.role() = 'service_role')
);

CREATE POLICY "Admin Inventory All Policy" ON public.inventory FOR ALL USING (
  (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin') OR (auth.role() = 'service_role')
);

CREATE POLICY "Admin Orders All Policy" ON public.orders FOR ALL USING (
  (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin') OR (auth.role() = 'service_role')
);

CREATE POLICY "Admin Order Items All Policy" ON public.order_items FOR ALL USING (
  (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin') OR (auth.role() = 'service_role')
);

CREATE POLICY "Admin Settings All Policy" ON public.store_settings FOR ALL USING (
  (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin') OR (auth.role() = 'service_role')
);
