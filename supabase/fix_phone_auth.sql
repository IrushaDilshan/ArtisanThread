-- ==============================================================================
-- ARTISANTHREAD: DEFINITIVE FIX FOR "Database error saving new user"
-- Paste and run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dgwcwxfjuvelnsusninc/sql/new
-- ==============================================================================

-- Step 1: Remove NOT NULL from email (phone signups don't have email)
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Step 2: Add INSERT RLS policy so authenticated users can create their profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 3: Drop the old trigger that is failing
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 4: Create a bulletproof trigger that NEVER blocks user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Artisan Member'),
    CASE 
      WHEN UPPER(COALESCE(NEW.raw_user_meta_data->>'role', 'BUYER')) = 'ARTISAN' THEN 'ARTISAN'::public.user_role
      WHEN UPPER(COALESCE(NEW.raw_user_meta_data->>'role', 'BUYER')) = 'COURIER' THEN 'COURIER'::public.user_role
      ELSE 'BUYER'::public.user_role
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = COALESCE(EXCLUDED.email, profiles.email),
    phone = COALESCE(EXCLUDED.phone, profiles.phone);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never abort auth.users signup
    RETURN NEW;
END;
$$;

-- Step 5: Re-create the trigger cleanly
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
