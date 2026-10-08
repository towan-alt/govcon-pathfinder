create or replace function public.grant_preapproved_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) = 'towan@isomglobal.com' then
    insert into public.user_roles(user_id, role) values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end $$;
revoke execute on function public.grant_preapproved_admin() from public, anon, authenticated;
drop trigger if exists on_auth_user_grant_admin on auth.users;
create trigger on_auth_user_grant_admin after insert on auth.users
for each row execute function public.grant_preapproved_admin();