-- ============================================================
-- TrustMarket - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────
-- 1. PROFILES (extends auth.users)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer','seller','admin')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile; admins can read all
CREATE POLICY "profiles: self read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: admin read all"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "profiles: self insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: self update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────
-- 2. CATEGORIES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT NOT NULL UNIQUE,
  icon  TEXT
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories: public read"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "categories: admin write"
  ON public.categories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Seed default categories
INSERT INTO public.categories (name, icon) VALUES
  ('Electronics',   '💻'),
  ('Clothing',      '👕'),
  ('Food & Drinks', '🍎'),
  ('Books',         '📚'),
  ('Beauty',        '💄'),
  ('Home & Garden', '🏡'),
  ('Sports',        '⚽'),
  ('Toys',          '🧸'),
  ('Vehicles',      '🚗'),
  ('Other',         '📦')
ON CONFLICT (name) DO NOTHING;


-- ─────────────────────────────────────────
-- 3. SELLER PROFILES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.seller_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  business_name TEXT,
  phone         TEXT,
  id_card_url   TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_notes   TEXT,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ,
  UNIQUE (user_id)
);

ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

-- Sellers can read & write their own profile
CREATE POLICY "seller_profiles: self read"
  ON public.seller_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "seller_profiles: self insert"
  ON public.seller_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "seller_profiles: self update"
  ON public.seller_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Admins can read & update all seller profiles
CREATE POLICY "seller_profiles: admin read"
  ON public.seller_profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "seller_profiles: admin update"
  ON public.seller_profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Buyers can read approved seller profiles (for product detail page)
CREATE POLICY "seller_profiles: buyer read approved"
  ON public.seller_profiles FOR SELECT
  USING (status = 'approved');


-- ─────────────────────────────────────────
-- 4. PRODUCTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id   UUID NOT NULL REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  images      TEXT[] NOT NULL DEFAULT '{}',
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_notes TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved products
CREATE POLICY "products: public read approved"
  ON public.products FOR SELECT
  USING (status = 'approved');

-- Sellers can read their own products (all statuses)
CREATE POLICY "products: seller read own"
  ON public.products FOR SELECT
  USING (
    seller_id IN (
      SELECT id FROM public.seller_profiles WHERE user_id = auth.uid()
    )
  );

-- Approved sellers can insert products
CREATE POLICY "products: seller insert"
  ON public.products FOR INSERT
  WITH CHECK (
    seller_id IN (
      SELECT id FROM public.seller_profiles
      WHERE user_id = auth.uid() AND status = 'approved'
    )
  );

-- Sellers can delete their own products
CREATE POLICY "products: seller delete own"
  ON public.products FOR DELETE
  USING (
    seller_id IN (
      SELECT id FROM public.seller_profiles WHERE user_id = auth.uid()
    )
  );

-- Admins can read & update all products
CREATE POLICY "products: admin read all"
  ON public.products FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "products: admin update"
  ON public.products FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );


-- ─────────────────────────────────────────
-- 5. STORAGE BUCKETS
-- Run these in the Supabase Dashboard > Storage, or via API
-- ─────────────────────────────────────────

-- Bucket: id-cards (private, only owner + admin)
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-cards', 'id-cards', false)
ON CONFLICT (id) DO NOTHING;

-- Bucket: product-images (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for id-cards
CREATE POLICY "id-cards: seller upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'id-cards'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "id-cards: seller read own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'id-cards'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "id-cards: admin read all"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'id-cards'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Storage policies for product-images
CREATE POLICY "product-images: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "product-images: seller upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM public.seller_profiles sp
      WHERE sp.user_id = auth.uid()
      AND sp.status = 'approved'
    )
  );
