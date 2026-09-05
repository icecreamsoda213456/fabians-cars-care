create table if not exists pos_settings (
  id smallint primary key default 1 check (id = 1),
  shop_name varchar(120) not null default 'Fabian''s Car Care',
  shop_address varchar(240) not null default '',
  contact_number varchar(40) not null default '',
  tin varchar(40) not null default '',
  shop_logo_url text not null default '',
  receipt_footer varchar(240) not null default 'Thank you for choosing Fabian''s Car Care.',
  receipt_paper_size varchar(10) not null default '80mm'
    check (receipt_paper_size in ('58mm', '80mm', 'a4')),
  auto_open_receipt boolean not null default true,
  auto_print_receipt boolean not null default false,
  enabled_payment_methods text[] not null default array['cash', 'gcash', 'card']::text[]
    check (
      cardinality(enabled_payment_methods) between 1 and 3
      and enabled_payment_methods <@ array['cash', 'gcash', 'card']::text[]
    ),
  default_payment_method varchar(20) not null default 'cash'
    check (default_payment_method in ('cash', 'gcash', 'card')),
  common_bills integer[] not null default array[100, 200, 500, 1000]::integer[]
    check (cardinality(common_bills) between 1 and 6),
  barcode_auto_add boolean not null default true,
  default_reorder_level integer not null default 3
    check (default_reorder_level between 0 and 9999),
  recycle_retention_days integer not null default 30
    check (recycle_retention_days between 1 and 365),
  inactivity_timeout_minutes integer not null default 30
    check (inactivity_timeout_minutes between 5 and 720),
  cashier_void_reason_required boolean not null default true,
  updated_by bigint references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (default_payment_method = any(enabled_payment_methods))
);

insert into pos_settings (id)
values (1)
on conflict (id) do nothing;
