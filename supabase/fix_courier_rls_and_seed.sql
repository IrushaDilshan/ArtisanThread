-- ==============================================================================
-- FIX COURIER & ORDERS RLS POLICIES & SEED COURIER DELIVERIES FOR IRUSHA
-- Run this in Supabase -> SQL Editor.
-- This ensures that laptop (emulator) and phone are 100% synchronized via Supabase Cloud!
-- ==============================================================================

-- 1. Ensure order_id in deliveries is nullable so deliveries never fail on foreign keys
ALTER TABLE public.deliveries ALTER COLUMN order_id DROP NOT NULL;

-- 2. Enable Full Access Policies on Orders (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Allow all on orders" ON public.orders;
DROP POLICY IF EXISTS "Couriers and buyers can view orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can insert their orders" ON public.orders;
CREATE POLICY "Allow all on orders" 
    ON public.orders FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 3. Enable Full Access Policies on Deliveries (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Allow all on deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Deliveries viewable by assigned courier or order buyer" ON public.deliveries;
DROP POLICY IF EXISTS "Deliveries viewable by couriers or order buyer" ON public.deliveries;
DROP POLICY IF EXISTS "Couriers can update their deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Couriers can claim and update deliveries" ON public.deliveries;
CREATE POLICY "Allow all on deliveries" 
    ON public.deliveries FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 4. Enable Full Access Policies on Order Items
DROP POLICY IF EXISTS "Allow all on order_items" ON public.order_items;
CREATE POLICY "Allow all on order_items" 
    ON public.order_items FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 5. Explicitly assign seed deliveries to irusha (phone: 0777777777)
DO $$
DECLARE
    target_courier_id UUID;
    sample_buyer_id UUID;
BEGIN
    -- 1. Get irusha's profile ID
    SELECT id INTO target_courier_id 
    FROM public.profiles 
    WHERE full_name ILIKE '%irusha%' OR phone LIKE '%0777777777%'
    LIMIT 1;

    -- If not found by query, fallback to known irusha UUID
    IF target_courier_id IS NULL THEN
        target_courier_id := '5de2dd7b-8e12-4901-8979-7f5520dc2a31';
    END IF;

    -- 2. Get or create a sample buyer ID
    SELECT id INTO sample_buyer_id 
    FROM public.profiles 
    WHERE role = 'BUYER' 
    LIMIT 1;

    IF sample_buyer_id IS NULL THEN
        sample_buyer_id := target_courier_id;
    END IF;

    -- 3. Insert / Update Demo Orders in Cloud Database
    INSERT INTO public.orders (id, order_number, buyer_id, status, total_amount, shipping_address, payment_status)
    VALUES
      (
        '20000000-0000-0000-0000-000000000001',
        'ATH-2291-KL',
        sample_buyer_id,
        'IN_TRANSIT',
        8400.00,
        '{"address": "14 Dharmapala Mawatha", "city": "Colombo 07", "recipient": "Dilani Perera", "phone": "+94 71 987 6543"}'::jsonb,
        'cash_on_delivery'
      ),
      (
        '20000000-0000-0000-0000-000000000002',
        'ATH-9942-PY',
        sample_buyer_id,
        'READY_FOR_PICKUP',
        12500.00,
        '{"address": "28/4 Galle Road", "city": "Colombo 03", "recipient": "Nimal Jayasuriya", "phone": "+94 77 123 4567"}'::jsonb,
        'cash_on_delivery'
      ),
      (
        '20000000-0000-0000-0000-000000000003',
        'ATH-3312-BW',
        sample_buyer_id,
        'CONFIRMED',
        15200.00,
        '{"address": "45 Nawala Road", "city": "Rajagiriya", "recipient": "Kasun Wickramasinghe", "phone": "+94 76 555 4321"}'::jsonb,
        'cash_on_delivery'
      )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      total_amount = EXCLUDED.total_amount;

    -- 4. Insert / Update Demo Deliveries Assigned Specifically to irusha
    INSERT INTO public.deliveries (id, tracking_code, order_id, courier_id, status, pickup_address, dropoff_address, recipient_notes, estimated_arrival)
    VALUES
      (
        '30000000-0000-0000-0000-000000000001',
        'ATH-9942-PY',
        '20000000-0000-0000-0000-000000000002',
        target_courier_id,
        'ASSIGNED',
        '{"name": "Kumara Batiks & Silk Workshop", "city": "Kandy", "details": "2 parcels (1.4 kg) · Handloom Batik Shawls"}'::jsonb,
        '{"name": "Nimal Jayasuriya", "city": "Colombo 03", "details": "2 parcels · Express Delivery"}'::jsonb,
        'Fragile: Handcrafted Silk. COD: LKR 12,500',
        NOW() + INTERVAL '1 hour'
      ),
      (
        '30000000-0000-0000-0000-000000000002',
        'ATH-2291-KL',
        '20000000-0000-0000-0000-000000000001',
        target_courier_id,
        'ARRIVED_AT_ARTISAN',
        '{"name": "Ruhunu Pottery Works", "city": "Kelaniya", "details": "1 crate (3.2 kg) · Terracotta Vases"}'::jsonb,
        '{"name": "Dilani Perera", "city": "Colombo 07", "details": "1 crate · Fragile Ceramics"}'::jsonb,
        'Handle with care - Fragile Ceramics. COD: LKR 8,400',
        NOW() + INTERVAL '2 hours'
      ),
      (
        '30000000-0000-0000-0000-000000000003',
        'ATH-3312-BW',
        '20000000-0000-0000-0000-000000000003',
        target_courier_id,
        'IN_TRANSIT',
        '{"name": "Moratuwa Woodcraft Studio", "city": "Moratuwa", "details": "1 parcel (2.1 kg) · Carved Wall Art"}'::jsonb,
        '{"name": "Kasun Wickramasinghe", "city": "Rajagiriya", "details": "1 parcel · Call before delivery"}'::jsonb,
        'Call before delivery. COD: LKR 15,200',
        NOW() + INTERVAL '4 hours'
      )
    ON CONFLICT (id) DO UPDATE SET
      courier_id = target_courier_id,
      status = EXCLUDED.status;

    -- Also update any existing deliveries in table to irusha so phone sees them immediately
    UPDATE public.deliveries
    SET courier_id = target_courier_id
    WHERE courier_id IS NULL OR courier_id = '8b112de3-193c-40d0-b7ba-2adfd02748bb';

    RAISE NOTICE 'Successfully enabled full cloud access and assigned deliveries to irusha: %', target_courier_id;
END $$;
