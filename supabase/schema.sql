-- ==============================================================================
-- ARTISANTHREAD SUPABASE DATABASE SCHEMA
-- Multi-Role Marketplace: Buyer, Artisan, Courier
-- ==============================================================================

-- 1. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('BUYER', 'ARTISAN', 'COURIER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'PENDING',
        'CONFIRMED',
        'CRAFTING',
        'READY_FOR_PICKUP',
        'IN_TRANSIT',
        'DELIVERED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE delivery_status AS ENUM (
        'ASSIGNED',
        'ARRIVED_AT_ARTISAN',
        'PICKED_UP',
        'IN_TRANSIT',
        'DELIVERED',
        'FAILED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. USER PROFILES TABLE (Linked with Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'BUYER',
    phone TEXT,
    avatar_url TEXT,
    badge TEXT,
    location TEXT,
    -- Role specific metadata stored as structured JSON
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PRODUCTS / CRAFTS TABLE (Artisan Inventory)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 1,
    image_url TEXT,
    materials TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    status order_status NOT NULL DEFAULT 'PENDING',
    total_amount NUMERIC(10, 2) NOT NULL,
    shipping_address JSONB NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL
);

-- 6. DELIVERIES / COURIER ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_code TEXT UNIQUE NOT NULL,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    courier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status delivery_status NOT NULL DEFAULT 'ASSIGNED',
    pickup_address JSONB NOT NULL,
    dropoff_address JSONB NOT NULL,
    current_lat NUMERIC(10, 7),
    current_lng NUMERIC(10, 7),
    proof_image_url TEXT,
    recipient_notes TEXT,
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    picked_up_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. REVIEWS & RATINGS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, authenticated users update their own
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Products: Everyone can browse active products, Artisans can manage their own
CREATE POLICY "Active products are viewable by everyone" 
    ON public.products FOR SELECT USING (is_active = true);

CREATE POLICY "Artisans can view all their own products" 
    ON public.products FOR SELECT USING (auth.uid() = artisan_id);

CREATE POLICY "Artisans can insert their own products" 
    ON public.products FOR INSERT WITH CHECK (auth.uid() = artisan_id);

CREATE POLICY "Artisans can update their own products" 
    ON public.products FOR UPDATE USING (auth.uid() = artisan_id);

CREATE POLICY "Artisans can delete their own products" 
    ON public.products FOR DELETE USING (auth.uid() = artisan_id);

-- Orders: Buyers see their orders, Artisans & Couriers see orders assigned to them
CREATE POLICY "Buyers can view their own orders" 
    ON public.orders FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers can insert their orders" 
    ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Deliveries viewable by assigned courier or order buyer" 
    ON public.deliveries FOR SELECT 
    USING (auth.uid() = courier_id OR auth.uid() IN (
        SELECT buyer_id FROM public.orders WHERE id = deliveries.order_id
    ));

CREATE POLICY "Couriers can update their deliveries" 
    ON public.deliveries FOR UPDATE 
    USING (auth.uid() = courier_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  extracted_role text;
  final_role user_role;
  user_phone text;
BEGIN
  extracted_role := UPPER(COALESCE(NEW.raw_user_meta_data->>'role', 'BUYER'));
  
  IF extracted_role = 'ARTISAN' THEN
    final_role := 'ARTISAN'::user_role;
  ELSIF extracted_role = 'COURIER' THEN
    final_role := 'COURIER'::user_role;
  ELSE
    final_role := 'BUYER'::user_role;
  END IF;

  user_phone := COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone');

  INSERT INTO public.profiles (id, email, phone, full_name, role, metadata)
  VALUES (
    NEW.id,
    NEW.email,
    user_phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Artisan Member'),
    final_role,
    COALESCE(NEW.raw_user_meta_data->'metadata', '{}'::jsonb)
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = COALESCE(EXCLUDED.email, profiles.email),
    phone = COALESCE(EXCLUDED.phone, profiles.phone);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user exception: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
