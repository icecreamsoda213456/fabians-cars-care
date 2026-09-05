-- Run this in pgAdmin if you already created the old schema with the manager role.
-- It updates app_users to support only: owner, admin, cashier.

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'app_users'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table app_users drop constraint %I', constraint_record.conname);
  end loop;
end $$;

update app_users
set role = 'admin'
where role = 'manager';

update app_users
set name = 'Joey',
    username = 'joey',
    updated_at = now()
where role = 'owner';

alter table app_users
add constraint app_users_role_check
check (role in ('owner', 'admin', 'cashier'));

insert into app_users (name, username, password_hash, role)
values
  ('Joey', 'joey', '$2a$10$EW2f7Qg6ReNt0sGIJ6oUa.UYbrK3FilM/49t3N8XtM1nARDKakXiy', 'owner'),
  ('Administrator', 'admin', '$2a$10$n4B67TNDoDApJQI7UjfG4.RglmA3YHZvLCEqnox6wPPzS5njCFeNe', 'admin'),
  ('Cashier', 'cashier', '$2a$10$RoE5TMKBx8XhmtVrccovZOm0UB8LuPZ4eEL1th499Ic2LbhaJw6cG', 'cashier')
on conflict (username) do update
set role = excluded.role,
    password_hash = excluded.password_hash,
    is_active = true,
    updated_at = now();
