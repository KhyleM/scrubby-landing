-- Admin dashboard: admin_users table, is_admin() helper, and RLS policies.
-- Bookings already live in concierge_bookings; claims in claim_requests.

-- ─── admin_users ────────────────────────────────────────────────────────────
-- Simple allowlist of admin user IDs. Insert rows via Supabase dashboard.
CREATE TABLE IF NOT EXISTS public.admin_users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL UNIQUE REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ─── is_admin() helper ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── RLS policies ───────────────────────────────────────────────────────────
-- Admin can read/update concierge_bookings
CREATE POLICY admin_select_concierge_bookings ON public.concierge_bookings
  FOR SELECT USING (public.is_admin());
CREATE POLICY admin_update_concierge_bookings ON public.concierge_bookings
  FOR UPDATE USING (public.is_admin());

-- Admin can read/update claim_requests
CREATE POLICY admin_select_claim_requests ON public.claim_requests
  FOR SELECT USING (public.is_admin());
CREATE POLICY admin_update_claim_requests ON public.claim_requests
  FOR UPDATE USING (public.is_admin());

-- Admin can read unclaimed_listings (for joins and outreach)
CREATE POLICY admin_select_unclaimed_listings ON public.unclaimed_listings
  FOR SELECT USING (public.is_admin());

-- Admin can read their own admin_users row (for auth check)
CREATE POLICY admin_self_select ON public.admin_users
  FOR SELECT USING (user_id = auth.uid());

-- ─── outreach_log ───────────────────────────────────────────────────────────
-- Track which businesses have been contacted for outreach
CREATE TABLE IF NOT EXISTS public.outreach_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid NOT NULL,
  channel     text DEFAULT 'email',
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.outreach_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_all_outreach ON public.outreach_log
  FOR ALL USING (public.is_admin());
