pragma foreign_keys = on;

create table if not exists app_users (
  id integer primary key autoincrement,
  name text not null,
  username text not null collate nocase unique,
  password_hash text not null,
  role text not null check (role in ('owner', 'admin', 'cashier')),
  is_active integer not null default 1 check (is_active in (0, 1)),
  last_login_at text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create table if not exists pos_settings (
  id integer primary key default 1 check (id = 1),
  shop_name text not null default 'Fabian''s Car Care',
  shop_address text not null default '',
  contact_number text not null default '',
  tin text not null default '',
  shop_logo_url text not null default '',
  receipt_footer text not null default 'Thank you for choosing Fabian''s Car Care.',
  receipt_paper_size text not null default '80mm'
    check (receipt_paper_size in ('58mm', '80mm', 'a4')),
  auto_open_receipt integer not null default 1 check (auto_open_receipt in (0, 1)),
  auto_print_receipt integer not null default 0 check (auto_print_receipt in (0, 1)),
  enabled_payment_methods text not null default '["cash","gcash","card"]',
  default_payment_method text not null default 'cash'
    check (default_payment_method in ('cash', 'gcash', 'card')),
  common_bills text not null default '[100,200,500,1000]',
  barcode_auto_add integer not null default 1 check (barcode_auto_add in (0, 1)),
  default_reorder_level integer not null default 3
    check (default_reorder_level between 0 and 9999),
  recycle_retention_days integer not null default 30
    check (recycle_retention_days between 1 and 365),
  inactivity_timeout_minutes integer not null default 30
    check (inactivity_timeout_minutes between 5 and 720),
  cashier_void_reason_required integer not null default 1
    check (cashier_void_reason_required in (0, 1)),
  updated_by integer references app_users(id) on delete set null,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create table if not exists categories (
  id integer primary key autoincrement,
  name text not null collate nocase unique,
  description text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create table if not exists products (
  id integer primary key autoincrement,
  sku text unique,
  barcode text unique,
  name text not null,
  category_id integer references categories(id) on delete set null,
  stock_on_hand integer not null default 0 check (stock_on_hand >= 0),
  reorder_level integer not null default 3 check (reorder_level >= 0),
  buy_price numeric not null check (buy_price >= 0),
  sale_price numeric not null check (sale_price >= 0),
  image_url text,
  is_active integer not null default 1 check (is_active in (0, 1)),
  deleted_at text,
  deleted_by integer references app_users(id) on delete set null,
  purged_at text,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create table if not exists sales (
  id integer primary key autoincrement,
  receipt_no text not null unique,
  cashier_id integer references app_users(id) on delete set null,
  sale_date text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  total_amount numeric not null check (total_amount >= 0),
  payment_method text not null default 'cash',
  cash_received numeric not null default 0,
  change_amount numeric not null default 0,
  status text not null default 'paid' check (status in ('paid', 'voided', 'refunded')),
  voided_at text,
  voided_by integer references app_users(id) on delete set null,
  void_reason text
);

create table if not exists sale_items (
  id integer primary key autoincrement,
  sale_id integer not null references sales(id) on delete cascade,
  product_id integer not null references products(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric not null check (unit_price >= 0),
  line_total numeric not null check (line_total >= 0)
);

create table if not exists stock_movements (
  id integer primary key autoincrement,
  product_id integer not null references products(id),
  movement_type text not null
    check (movement_type in ('purchase', 'sale', 'adjustment', 'return')),
  quantity integer not null,
  reference_type text,
  reference_id integer,
  notes text,
  created_by integer references app_users(id) on delete set null,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create table if not exists user_activity_logs (
  id integer primary key autoincrement,
  user_id integer references app_users(id) on delete set null,
  user_name text not null,
  user_role text not null,
  action text not null,
  entity_type text,
  entity_id integer,
  description text not null,
  metadata text not null default '{}',
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create table if not exists database_meta (
  key text primary key,
  value text not null,
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create index if not exists idx_products_name on products (name collate nocase);
create index if not exists idx_products_barcode on products (barcode);
create index if not exists idx_products_active on products (is_active, purged_at);
create index if not exists idx_sales_sale_date on sales (sale_date desc);
create index if not exists idx_stock_movements_product
  on stock_movements (product_id, created_at desc);
create index if not exists idx_user_activity_actor_time
  on user_activity_logs (user_id, created_at desc);
create index if not exists idx_user_activity_role_time
  on user_activity_logs (user_role, created_at desc);

insert into pos_settings (id)
values (1)
on conflict (id) do nothing;

insert into database_meta (key, value)
values ('schema_version', '1')
on conflict (key) do update set
  value = excluded.value,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now');
