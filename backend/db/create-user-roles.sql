-- ============================================================
-- 002: User roles (admin, treasurer, member)
-- ============================================================

create type public.app_role as enum ('admin', 'treasurer', 'member');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'member',
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security-definer function to check roles (avoids RLS recursion)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Helper: get current user's role
create or replace function public.get_my_role()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_roles where user_id = auth.uid() limit 1
$$;

-- Everyone can read their own role
create policy "Users can view own roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

-- Admins can manage roles
create policy "Admins can manage roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Auto-assign 'member' role on sign-up
create or replace function public.assign_default_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'member');
  return new;
end;
$$;

create trigger on_auth_user_created_assign_role
  after insert on auth.users
  for each row execute function public.assign_default_role();
