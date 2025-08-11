-- 1) Create role enum and user_roles table
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- security definer helper
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  );
$$;

-- RLS policies for user_roles: users can see their own roles
DO $$ BEGIN
  CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Create partner category enum
DO $$ BEGIN
  CREATE TYPE public.partner_category AS ENUM (
    'accounting', 'marketing', 'business_development', 'compliance', 'legal', 'logistics'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) Create partners table
CREATE TABLE IF NOT EXISTS public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text NOT NULL,
  category public.partner_category NOT NULL,
  specialties text[] DEFAULT '{}',
  website_url text,
  contact_email text,
  phone text,
  location text,
  logo_url text,
  verification_status text NOT NULL DEFAULT 'pending', -- 'pending' | 'verified' | 'rejected'
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add a CHECK via trigger for verification_status values for flexibility
CREATE OR REPLACE FUNCTION public.validate_partners()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verification_status NOT IN ('pending','verified','rejected') THEN
    RAISE EXCEPTION 'Invalid verification_status %', NEW.verification_status;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_partners ON public.partners;
CREATE TRIGGER trg_validate_partners
BEFORE INSERT OR UPDATE ON public.partners
FOR EACH ROW EXECUTE FUNCTION public.validate_partners();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_partners_updated_at ON public.partners;
CREATE TRIGGER trg_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Public can view verified partners (no auth required)
DO $$ BEGIN
  CREATE POLICY "Public can view verified partners"
  ON public.partners FOR SELECT TO anon
  USING (verification_status = 'verified');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Authenticated users can also view verified partners
DO $$ BEGIN
  CREATE POLICY "Authenticated can view verified partners"
  ON public.partners FOR SELECT TO authenticated
  USING (verification_status = 'verified');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Creators can view their own submissions (any status)
DO $$ BEGIN
  CREATE POLICY "Users can view their own partner submissions"
  ON public.partners FOR SELECT TO authenticated
  USING (created_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users can create partner applications for themselves (pending by default)
DO $$ BEGIN
  CREATE POLICY "Users can create partner applications"
  ON public.partners FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users can update their own applications while pending
DO $$ BEGIN
  CREATE POLICY "Users can update their pending applications"
  ON public.partners FOR UPDATE TO authenticated
  USING (created_by = auth.uid() AND verification_status = 'pending')
  WITH CHECK (created_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users can delete their own applications while pending
DO $$ BEGIN
  CREATE POLICY "Users can delete their pending applications"
  ON public.partners FOR DELETE TO authenticated
  USING (created_by = auth.uid() AND verification_status = 'pending');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admins can manage all partners
DO $$ BEGIN
  CREATE POLICY "Admins can manage all partners"
  ON public.partners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_partners_status ON public.partners (verification_status);
CREATE INDEX IF NOT EXISTS idx_partners_category ON public.partners (category);
CREATE INDEX IF NOT EXISTS idx_partners_created_by ON public.partners (created_by);
