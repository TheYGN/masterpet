-- ============================================================================
-- Migration: import_mapping_templates_revoke_trigger_fn_execute
-- ----------------------------------------------------------------------------
-- Follow-up to `products_revoke_trigger_fn_execute`, which closed the same
-- linter warnings (0028 / 0029) for the Products trigger functions but missed
-- the import-mapping-templates trigger function added later.
--
-- `import_mapping_templates_set_updated_at()` is a SECURITY DEFINER trigger
-- function (updated_at setter). It is invoked ONLY by its BEFORE UPDATE
-- trigger and must never be callable directly as a PostgREST RPC
-- (/rest/v1/rpc/import_mapping_templates_set_updated_at). The Supabase
-- security advisor flags it under lints 0028 (function_search_path /
-- security_definer exposure) and 0029 (rpc-callable trigger function)
-- because it is still granted EXECUTE to anon / authenticated / PUBLIC.
--
-- Revoking EXECUTE closes both warnings without breaking trigger execution:
-- triggers run as the owner of the function regardless of the caller's
-- privileges.
--
-- Risk: Low — privilege revocation only, no schema/data/RLS change.
-- DO NOT RUN automatically — requires explicit approval (apply via Supabase
-- MCP apply_migration or the SQL editor).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- UP
-- ---------------------------------------------------------------------------

-- The trigger function this migration was opened for (SECURITY DEFINER).
REVOKE EXECUTE ON FUNCTION public.import_mapping_templates_set_updated_at() FROM PUBLIC, anon, authenticated;

-- NOTE: an audit of all public trigger functions (see this migration's
-- accompanying analysis) found that every other SECURITY DEFINER trigger
-- function — create_default_branch_for_tenant, seed_inventory_for_new_branch,
-- seed_inventory_for_new_variant — already had EXECUTE revoked by the prior
-- `products_revoke_trigger_fn_execute` migration, so this one is the only
-- SECURITY DEFINER gap. The non-definer trigger function
-- `prevent_self_role_change()` is also RPC-exposed and arguably deserves the
-- same hygiene revoke, but it is out of scope for this advisor fix and left
-- untouched here.

-- ---------------------------------------------------------------------------
-- DOWN
-- ---------------------------------------------------------------------------
-- GRANT EXECUTE ON FUNCTION public.import_mapping_templates_set_updated_at() TO PUBLIC, anon, authenticated;
