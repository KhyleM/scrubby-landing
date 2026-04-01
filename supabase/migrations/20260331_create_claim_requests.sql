-- claim_requests: stores business owner claim submissions from SEO landing pages
-- Processed async — staff verifies ownership, then links to a provider record.

CREATE TABLE IF NOT EXISTS public.claim_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    uuid NOT NULL,
  google_place_id text NOT NULL,
  owner_name    text NOT NULL,
  owner_email   text NOT NULL,
  owner_phone   text,
  owner_role    text,
  status        text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'contacted', 'verified', 'rejected')),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for quick lookup by listing and de-duplication
CREATE INDEX idx_claim_requests_listing ON public.claim_requests (listing_id);
CREATE INDEX idx_claim_requests_email   ON public.claim_requests (owner_email);
CREATE INDEX idx_claim_requests_status  ON public.claim_requests (status) WHERE status = 'pending';

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER claim_requests_updated_at
  BEFORE UPDATE ON public.claim_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: only service role can insert (via edge function); no direct client access
ALTER TABLE public.claim_requests ENABLE ROW LEVEL SECURITY;

-- No policies = no client access. Edge function uses service_role key to bypass RLS.
