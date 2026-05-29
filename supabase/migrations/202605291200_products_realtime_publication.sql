-- ============================================================================
-- Migration: add `products` to the supabase_realtime publication
-- Purpose:   broadcast soft-delete / restore (UPDATE) events so other users
--            and browser tabs see catalog changes live.
-- Risk:      Low — publication membership only, no schema/data/RLS change.
-- DO NOT RUN automatically — requires explicit approval (apply via Supabase
-- MCP apply_migration or the SQL editor).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- UP
-- ---------------------------------------------------------------------------

-- Soft delete is an UPDATE (sets deleted_at), not a physical DELETE, so the
-- frontend listens to UPDATE events. To deliver the OLD row (so the client can
-- tell "deleted just now": old.deleted_at IS NULL && new.deleted_at IS NOT NULL)
-- the table must publish full old rows. Without REPLICA IDENTITY FULL, the
-- `old` payload only contains the primary key.
ALTER TABLE public.products REPLICA IDENTITY FULL;

-- Add the table to Supabase's realtime publication.
-- Guarded so re-running the migration is a no-op.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'products'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.products';
  END IF;
END
$$;

-- RLS NOTE — Realtime authorization:
--   Realtime honours RLS on the `products` table ONLY when the client subscribes
--   over an authenticated channel (the supabase-js Realtime client must be given
--   the user's JWT via realtime.setAuth(jwt) / a client created with the session).
--   With the JWT attached, the existing products_tenant_isolation policy
--   (tenant_id = current_tenant_id()) is enforced per-row, so a tenant only
--   receives change events for its OWN products. An anon/unauthenticated channel
--   would receive NOTHING (RLS denies). The frontend MUST connect authenticated.

-- ---------------------------------------------------------------------------
-- DOWN
-- ---------------------------------------------------------------------------
-- ALTER PUBLICATION supabase_realtime DROP TABLE public.products;
-- ALTER TABLE public.products REPLICA IDENTITY DEFAULT;
