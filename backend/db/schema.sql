create extension if not exists pgcrypto;

create table if not exists app_users (
  id bigserial primary key,
  name varchar(120) not null,
  username varchar(80) not null unique,
  password_hash text not null,
  role varchar(30) not null check (role in ('owner', 'admin', 'cashier')),
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists categories (
  id bigserial primary key,
  name varchar(120) not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id bigserial primary key,
  sku varchar(80) unique,
  barcode varchar(120) unique,
  name varchar(255) not null,
  category_id bigint references categories(id) on delete set null,
  stock_on_hand integer not null default 0 check (stock_on_hand >= 0),
  reorder_level integer not null default 3 check (reorder_level >= 0),
  buy_price numeric(12, 2) not null check (buy_price >= 0),
  sale_price numeric(12, 2) not null check (sale_price >= 0),
  image_url text,
  is_active boolean not null default true,
  deleted_at timestamptz,
  deleted_by bigint references app_users(id) on delete set null,
  purged_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sales (
  id bigserial primary key,
  receipt_no varchar(80) not null unique,
  cashier_id bigint references app_users(id) on delete set null,
  sale_date timestamptz not null default now(),
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  payment_method varchar(30) not null default 'cash',
  cash_received numeric(12, 2) not null default 0,
  change_amount numeric(12, 2) not null default 0,
  status varchar(30) not null default 'paid' check (status in ('paid', 'voided', 'refunded')),
  voided_at timestamptz,
  voided_by bigint references app_users(id) on delete set null,
  void_reason text
);

create table if not exists sale_items (
  id bigserial primary key,
  sale_id bigint not null references sales(id) on delete cascade,
  product_id bigint not null references products(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  line_total numeric(12, 2) not null check (line_total >= 0)
);

create table if not exists stock_movements (
  id bigserial primary key,
  product_id bigint not null references products(id),
  movement_type varchar(30) not null check (movement_type in ('purchase', 'sale', 'adjustment', 'return')),
  quantity integer not null,
  reference_type varchar(30),
  reference_id bigint,
  notes text,
  created_by bigint references app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

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

create index if not exists idx_products_search on products using gin (to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(barcode, '') || ' ' || coalesce(sku, '')));
create index if not exists idx_sales_sale_date on sales (sale_date desc);
create index if not exists idx_stock_movements_product on stock_movements (product_id, created_at desc);
create index if not exists idx_user_activity_actor_time on user_activity_logs (user_id, created_at desc);
create index if not exists idx_user_activity_role_time on user_activity_logs (user_role, created_at desc);
