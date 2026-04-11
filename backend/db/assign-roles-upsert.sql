-- ============================================================
-- 006: Allow admin to update a member's role
-- Adds a helper function so we can safely upsert a single role
-- per user (replacing any existing non-admin role).
-- ============================================================

-- Drop unique constraint that's per (user_id, role) pair so we can
-- enforce one active role per user instead.
-- (Only run this once; skip if already applied.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_roles_user_id_unique'
  ) THEN
    -- Remove the old composite unique key and add a per-user unique key
    ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- RPC: admin sets a user's role (replaces existing)
CREATE OR REPLACE FUNCTION public.set_user_role(_target_user_id uuid, _new_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can assign roles';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _new_role)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
END;
$$;
