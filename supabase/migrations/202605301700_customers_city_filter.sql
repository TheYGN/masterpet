-- City filter support for the customers management page.
-- (1) Partial index backs both the .eq('city') filter and the DISTINCT scan.
-- (2) RPC returns the distinct, sorted city list for the caller's tenant.
--     SECURITY INVOKER => the customers RLS policy fences by tenant automatically.

CREATE INDEX IF NOT EXISTS idx_customers_tenant_city
  ON public.customers (tenant_id, city)
  WHERE deleted_at IS NULL;

CREATE OR REPLACE FUNCTION public.get_customer_cities()
RETURNS SETOF text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT DISTINCT city
  FROM public.customers
  WHERE deleted_at IS NULL AND city IS NOT NULL
  ORDER BY city
$$;

REVOKE EXECUTE ON FUNCTION public.get_customer_cities() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_customer_cities() TO authenticated;
