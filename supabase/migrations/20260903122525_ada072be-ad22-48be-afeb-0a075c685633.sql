CREATE TABLE public.quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_stage TEXT NOT NULL DEFAULT 'intro',
  result JSONB,
  result_id UUID,
  lead_name TEXT,
  lead_email TEXT,
  utm JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_unlocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.quiz_sessions TO service_role;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no direct client access to quiz_sessions" ON public.quiz_sessions FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  result_id UUID,
  provider TEXT NOT NULL DEFAULT 'cakto',
  provider_payment_id TEXT,
  product_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  raw_event JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no direct client access to payments" ON public.payments FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

CREATE INDEX idx_payments_session ON public.payments(session_id);
CREATE INDEX idx_payments_provider_payment_id ON public.payments(provider_payment_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER quiz_sessions_updated_at BEFORE UPDATE ON public.quiz_sessions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.validate_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status NOT IN ('pending','approved','failed','expired') THEN
    RAISE EXCEPTION 'invalid payment_status: %', NEW.payment_status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER payments_validate_status BEFORE INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.validate_payment_status();