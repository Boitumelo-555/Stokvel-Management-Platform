-- ============================================================
-- 003: Stokvel groups
-- ============================================================

create table public.groups (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  description         text,
  contribution_amount numeric(12,2) not null,
  -- IMPORTANT: values must be lowercase to match what the frontend sends
  frequency           text not null check (frequency in ('weekly','bi-weekly','monthly')),
  max_members         int default 20,
  created_by          uuid references auth.users(id) on delete set null,
  status              text not null default 'active' check (status in ('active','inactive','closed')),
  next_payout         date,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

alter table public.groups enable row level security;

-- Admins can see ALL groups
create policy "Admins can view all groups"
  on public.groups for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Members/treasurers can see groups they belong to
create policy "Members can view their groups"
  on public.groups for select
  to authenticated
  using (
    id in (select group_id from public.group_members where user_id = auth.uid())
  );

-- Admins can create groups
create policy "Admins can create groups"
  on public.groups for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

-- Admins can update groups they created
create policy "Admins can update own groups"
  on public.groups for update
  to authenticated
  using (created_by = auth.uid() and public.has_role(auth.uid(), 'admin'));

-- Admins can delete groups they created
create policy "Admins can delete own groups"
  on public.groups for delete
  to authenticated
  using (created_by = auth.uid() and public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- Group members junction table
-- ============================================================

create table public.group_members (
  id        uuid primary key default gen_random_uuid(),
  group_id  uuid references public.groups(id) on delete cascade not null,
  user_id   uuid references auth.users(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique (group_id, user_id)
);

alter table public.group_members enable row level security;

-- Users can see their own memberships; admins can see all
create policy "Members can view their memberships"
  on public.group_members for select
  to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- Admins can insert/delete members
create policy "Admins can manage group members"
  on public.group_members for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Allow the accept_invitation function (security definer) to insert members
create policy "Service role can insert group members"
  on public.group_members for insert
  to authenticated
  with check (true);
