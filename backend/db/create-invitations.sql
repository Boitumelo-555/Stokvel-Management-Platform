-- ============================================================
-- 004: Group invitations
-- ============================================================

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  email text not null,
  invited_by uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','accepted','declined','expired')),
  token uuid default gen_random_uuid(),
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

alter table public.invitations enable row level security;

-- Admins can view/create invitations for their groups
create policy "Admins can manage invitations"
  on public.invitations for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Invited users can view their own invitations (matched by email)
create policy "Invited users can view own invitations"
  on public.invitations for select
  to authenticated
  using (
    email = (select email from public.profiles where id = auth.uid())
  );

-- Function: accept invitation
create or replace function public.accept_invitation(_token uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  _inv record;
begin
  select * into _inv from public.invitations
  where token = _token and status = 'pending' and expires_at > now();

  if not found then
    return json_build_object('success', false, 'message', 'Invalid or expired invitation');
  end if;

  -- Add user to group
  insert into public.group_members (group_id, user_id)
  values (_inv.group_id, auth.uid())
  on conflict do nothing;

  -- Mark invitation accepted
  update public.invitations set status = 'accepted' where id = _inv.id;

  return json_build_object('success', true, 'group_id', _inv.group_id);
end;
$$;
