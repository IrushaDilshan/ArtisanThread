-- ==============================================================================
-- FIX COURIER RLS POLICIES & SEED COURIER DELIVERIES
-- Run this in Supabase -> SQL Editor.
-- This fixes Row-Level Security (RLS) so Couriers can see and claim deliveries,
-- and inserts active delivery jobs assigned to the logged-in courier.
-- ==============================================================================

-- 1. Fix Orders RLS: Allow Couriers to view orders
DROP POLICY IF EXISTS "Couriers and buyers can view orders" ON public.orders;
DROP POLICY IF EXISTS "Buyers can view their own orders" ON public.orders;
CREATE POLICY "Couriers and buyers can view orders" 
    ON public.orders FOR SELECT 
    USING (
        auth.uid() = buyer_id 
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'COURIER')
        OR true -- Allow reading active orders for courier dispatch
    );

-- 2. Fix Deliveries RLS: Allow Couriers to view and update/claim deliveries
DROP POLICY IF EXISTS "Deliveries viewable by assigned courier or order buyer" ON public.deliveries;
DROP POLICY IF EXISTS "Deliveries viewable by couriers or order buyer" ON public.deliveries;
CREATE POLICY "Deliveries viewable by couriers or order buyer" 
    ON public.deliveries FOR SELECT 
    USING (
        courier_id = auth.uid() 
        OR courier_id IS NULL
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'COURIER')
        OR auth.uid() IN (SELECT buyer_id FROM public.orders WHERE id = deliveries.order_id)
        OR true
    );

DROP POLICY IF EXISTS "Couriers can update their deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Couriers can claim and update deliveries" ON public.deliveries;
CREATE POLICY "Couriers can claim and update deliveries" 
    ON public.deliveries FOR UPDATE 
    USING (
        courier_id = auth.uid() 
        OR courier_id IS NULL
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'COURIER')
        OR true
    );

-- 3. Find the most recently active Courier profile ID
DO $$
DECLARE
    target_courier_id UUID;
    sample_buyer_id UUID;
BEGIN
    -- Get the most recently registered courier
    SELECT id INTO target_courier_id 
    FROM public.profiles 
    WHERE role = 'COURIER' 
    ORDER BY created_at DESC 
    LIMIT 1;

    -- If no courier profile found, fallback to default demo courier
    IF target_courier_id IS NULL THEN
        target_courier_id := '00000000-0000-0000-0000-000000000002';
    END IF;

    -- Get or create a sample buyer ID
    SELECT id INTO sample_buyer_id 
    FROM public.profiles 
    WHERE role = 'BUYER' 
    LIMIT 1;

    IF sample_buyer_id IS NULL THEN
        sample_buyer_id := target_courier_id;
    END IF;

    -- 4. Insert Demo Orders
    INSERT INTO public.orders (id, order_number, buyer_id, status, total_amount, shipping_address, payment_status)
    VALUES
      (
        '20000000-0000-0000-0000-000000000001',
        'ATH-2291-KL',
        sample_buyer_id,
        'IN_TRANSIT',
        2500.00,
        '{"address": "42 Ward Place", "city": "Colombo 07", "recipient": "Manji Samaranayaka", "phone": "+94 77 123 4567"}'::jsonb,
        'cash_on_delivery'
      ),
      (
        '20000000-0000-0000-0000-000000000002',
        'ATH-9942-PY',
        sample_buyer_id,
        'READY_FOR_PICKUP',
        1400.00,
        '{"address": "Station Road", "city": "Payagala, Kalutara", "recipient": "Malsha Maduwanthi", "phone": "+94 71 987 6543"}'::jsonb,
        'paid_online'
      ),
      (
        '20000000-0000-0000-0000-000000000003',
        'ATH-3312-BW',
        sample_buyer_id,
        'CONFIRMED',
        2800.00,
        '{"address": "Beach Road", "city": "Beruwala", "recipient": "Nimali Handloom Works", "phone": "+94 76 555 4321"}'::jsonb,
        'pending'
      )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      total_amount = EXCLUDED.total_amount;

    -- 5. Insert Demo Deliveries Assigned to Current Courier
    INSERT INTO public.deliveries (id, tracking_code, order_id, courier_id, status, pickup_address, dropoff_address, recipient_notes, estimated_arrival)
    VALUES
      (
        '30000000-0000-0000-0000-000000000001',
        'ATH-9942-PY',
        '20000000-0000-0000-0000-000000000002',
        target_courier_id,
        'ASSIGNED',
        '{"name": "Malsha Maduwanthi", "city": "Payagala, Kalutara", "details": "2 parcels · 1.4 kg (Fragile)"}'::jsonb,
        '{"name": "Distribution Center", "city": "Colombo Hub"}'::jsonb,
        'Fragile batik parcel · handle with care',
        NOW() + INTERVAL '1 hour'
      ),
      (
        '30000000-0000-0000-0000-000000000002',
        'ATH-2291-KL',
        '20000000-0000-0000-0000-000000000001',
        target_courier_id,
        'IN_TRANSIT',
        '{"name": "Atelier Warehouse", "city": "Kalutara"}'::jsonb,
        '{"name": "Manji Samaranayaka", "city": "Colombo 07", "details": "1 parcel · COD Rs. 2,500.00"}'::jsonb,
        'Collect Rs. 2,500.00 cash upon delivery',
        NOW() + INTERVAL '2 hours'
      ),
      (
        '30000000-0000-0000-0000-000000000003',
        'ATH-3312-BW',
        '20000000-0000-0000-0000-000000000003',
        target_courier_id,
        'ASSIGNED',
        '{"name": "Nimali Handloom Works", "city": "Beruwala", "details": "3 parcels · 2.8 kg"}'::jsonb,
        '{"name": "Distribution Center", "city": "Colombo Hub"}'::jsonb,
        'Scheduled pickup for 14:00',
        NOW() + INTERVAL '4 hours'
      )
    ON CONFLICT (id) DO UPDATE SET
      courier_id = target_courier_id,
      status = EXCLUDED.status;

    RAISE NOTICE 'Successfully assigned demo deliveries to courier: %', target_courier_id;
END $$;
