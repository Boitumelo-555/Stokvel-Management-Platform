-- ============================================================
-- 005: Contributions tracking
-- ============================================================

create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending','completed','late','missed')),
  due_date date,
  paid_at timestamptz,
  created_at timestamptz default now()
);

alter table public.contributions enable row level security;

-- Members can view their own contributions
create policy "Members can view own contributions"
  on public.contributions for select
  to authenticated
  using (user_id = auth.uid());

-- Admins/treasurers can view all contributions in their groups
create policy "Admins can view group contributions"
  on public.contributions for select
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'treasurer')
  );

-- Admins can insert contributions
create policy "Admins can create contributions"
  on public.contributions for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'treasurer'));

-- Admins/treasurers can update contribution status
create policy "Admins can update contributions"
  on public.contributions for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'treasurer'));
