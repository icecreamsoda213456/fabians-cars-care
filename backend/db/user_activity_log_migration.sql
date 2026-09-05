create table if not exists user_activity_logs (
  id bigserial primary key,
  user_id bigint references app_users(id) on delete set null,
  user_name varchar(120) not null,
  user_role varchar(30) not null,
  action varchar(60) not null,
  entity_type varchar(50),
  entity_id bigint,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_activity_actor_time
  on user_activity_logs (user_id, created_at desc);

create index if not exists idx_user_activity_role_time
  on user_activity_logs (user_role, created_at desc);
