-- Run explicitly in the SQL editor AFTER manually creating/confirming the
-- owner's password-login Auth user. This never grants access based on signup.
do $$
declare owner_id uuid;
begin
  select id into strict owner_id from auth.users
  where lower(email) = 'chandrakarankit014@gmail.com'
    and email_confirmed_at is not null and deleted_at is null;
  insert into portfolio_private.portfolio_admins(user_id)
  values (owner_id) on conflict (user_id) do nothing;
exception when no_data_found then
  raise exception 'Create and confirm the owner Auth user before bootstrapping';
end $$;
