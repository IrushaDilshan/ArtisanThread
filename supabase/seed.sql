-- ==============================================================================
-- ARTISANTHREAD COMPLETE SEED SCRIPT
-- Paste and run this in Supabase -> SQL Editor.
-- It populates Auth Users, Profiles, Products, Orders, and Courier Deliveries.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create Demo Users in auth.users first (satisfies foreign key profiles_id_fkey)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'artisan.weaver@artisanthread.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Kenji Takahashi","role":"ARTISAN"}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'courier.express@artisanthread.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Kavinda Fernando","role":"COURIER"}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'curator@artisanthread.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Maya Lin","role":"BUYER"}'::jsonb,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password;

-- 2. Create Auth Identities (allows direct password login in the mobile app)
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000001', 'artisan.weaver@artisanthread.com')::jsonb,
    'email',
    '00000000-0000-0000-0000-000000000001',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000002', 'courier.express@artisanthread.com')::jsonb,
    'email',
    '00000000-0000-0000-0000-000000000002',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000003', 'curator@artisanthread.com')::jsonb,
    'email',
    '00000000-0000-0000-0000-000000000003',
    NOW(),
    NOW(),
    NOW()
  )
ON CONFLICT (provider, provider_id) DO NOTHING;

-- 3. Upsert Public Profiles
INSERT INTO public.profiles (id, email, phone, full_name, role, badge, location, metadata)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'artisan.weaver@artisanthread.com',
    '+94771111111',
    'Kenji Takahashi',
    'ARTISAN',
    'Master Weaver',
    'Kyoto / San Francisco Studio',
    '{"atelier": "Takahashi Handloom & Indigo", "specialty": "Indigo Textiles", "phone": "0771111111"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'courier.express@artisanthread.com',
    '+94772222222',
    'Kavinda Fernando',
    'COURIER',
    'Eco Express Partner',
    'Kalutara & Western Coastal Route',
    '{"vehicle": "Electric Cargo Van #402", "rating": "4.9 ★", "deliveriesCount": 128, "phone": "0772222222"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'curator@artisanthread.com',
    '+94773333333',
    'Maya Lin',
    'BUYER',
    'Connoisseur',
    'Colombo 07, Sri Lanka',
    '{"interests": ["Ceramics", "Textiles"], "phone": "0773333333"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  location = EXCLUDED.location,
  badge = EXCLUDED.badge,
  metadata = EXCLUDED.metadata;

-- 4. Insert Real Handcrafted Products
INSERT INTO public.products (id, artisan_id, title, description, category, price, stock, is_active)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Indigo Dyed Handloom Scarf',
    'Botanical vat-dyed organic cotton handloom scarf with fringed edges.',
    'Textiles',
    84.00,
    14,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Wabi-Sabi Ceramic Teapot',
    'Hand-thrown coarse stoneware teapot finished with wood-ash reduction glaze.',
    'Ceramics',
    120.00,
    5,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Carved Walnut Serving Board',
    'Sustainably harvested walnut, hand-planed and conditioned with organic beeswax.',
    'Woodcraft',
    65.00,
    8,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Brass Hand-Hammered Vessel',
    'Heavy brass vessel with intricate geometric repoussé detailing.',
    'Metalwork',
    145.00,
    3,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Real Orders
INSERT INTO public.orders (id, order_number, buyer_id, status, total_amount, shipping_address, payment_status)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'ATH-2291-KL',
    '00000000-0000-0000-0000-000000000003',
    'IN_TRANSIT',
    2500.00,
    '{"address": "42 Ward Place", "city": "Colombo 07", "recipient": "Manji Samaranayaka", "phone": "+94 77 123 4567"}'::jsonb,
    'cash_on_delivery'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'ATH-9942-PY',
    '00000000-0000-0000-0000-000000000003',
    'READY_FOR_PICKUP',
    1400.00,
    '{"address": "Station Road", "city": "Payagala, Kalutara", "recipient": "Malsha Maduwanthi", "phone": "+94 71 987 6543"}'::jsonb,
    'paid_online'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'ATH-3312-BW',
    '00000000-0000-0000-0000-000000000003',
    'CONFIRMED',
    2800.00,
    '{"address": "Beach Road", "city": "Beruwala", "recipient": "Nimali Handloom Works", "phone": "+94 76 555 4321"}'::jsonb,
    'pending'
  )
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Real Courier Deliveries Assigned to Courier (Kavinda Fernando)
INSERT INTO public.deliveries (id, tracking_code, order_id, courier_id, status, pickup_address, dropoff_address, recipient_notes, estimated_arrival)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    'ATH-9942-PY',
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
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
    '00000000-0000-0000-0000-000000000002',
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
    '00000000-0000-0000-0000-000000000002',
    'ASSIGNED',
    '{"name": "Nimali Handloom Works", "city": "Beruwala", "details": "3 parcels · 2.8 kg"}'::jsonb,
    '{"name": "Distribution Center", "city": "Colombo Hub"}'::jsonb,
    'Scheduled pickup for 14:00',
    NOW() + INTERVAL '4 hours'
  )
ON CONFLICT (id) DO NOTHING;
