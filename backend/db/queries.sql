-- Fabian's Car Care POS and Inventory useful PostgreSQL queries
-- Edit and run these in pgAdmin Query Tool.

-- Dashboard metrics
select
  (select count(*) from products where is_active = true) as active_products,
  (select count(*) from products where is_active = true and stock_on_hand <= reorder_level) as low_stock_items,
  (select coalesce(sum(total_amount), 0) from sales where sale_date::date = current_date) as today_sales,
  (select count(*) from app_users where is_active = true) as active_users;

-- Product list with category and stock status
select
  p.id,
  p.sku,
  p.barcode,
  p.name,
  c.name as category,
  p.stock_on_hand,
  p.reorder_level,
  p.buy_price,
  p.sale_price,
  case
    when p.stock_on_hand <= p.reorder_level then 'Low stock'
    else 'Healthy'
  end as stock_status
from products p
left join categories c on c.id = p.category_id
where p.is_active = true
order by p.name;

-- Low stock watchlist
select
  p.id,
  p.name,
  p.barcode,
  c.name as category,
  p.stock_on_hand,
  p.reorder_level
from products p
left join categories c on c.id = p.category_id
where p.is_active = true
  and p.stock_on_hand <= p.reorder_level
order by p.stock_on_hand asc, p.name;

-- Recent sales with item count
select
  s.id,
  s.receipt_no,
  s.sale_date,
  s.payment_method,
  s.status,
  count(si.id) as line_count,
  coalesce(sum(si.quantity), 0) as total_items,
  s.total_amount
from sales s
left join sale_items si on si.sale_id = s.id
group by s.id
order by s.sale_date desc
limit 50;

-- Sales report by day
select
  sale_date::date as sales_date,
  count(*) as transaction_count,
  sum(total_amount) as gross_sales
from sales
where status = 'paid'
group by sale_date::date
order by sales_date desc;

-- Monthly sales report
select
  date_trunc('month', sale_date)::date as sales_month,
  count(*) as transaction_count,
  sum(total_amount) as gross_sales
from sales
where status = 'paid'
group by date_trunc('month', sale_date)
order by sales_month desc;

-- Best sellers this week
select
  p.name,
  sum(si.quantity) as quantity_sold,
  sum(si.line_total) as revenue
from sales s
join sale_items si on si.sale_id = s.id
join products p on p.id = si.product_id
where s.status = 'paid'
  and s.sale_date >= current_date - interval '6 days'
group by p.id, p.name
order by quantity_sold desc, revenue desc;

-- Best sellers this month
select
  p.name,
  sum(si.quantity) as quantity_sold,
  sum(si.line_total) as revenue
from sales s
join sale_items si on si.sale_id = s.id
join products p on p.id = si.product_id
where s.status = 'paid'
  and s.sale_date >= date_trunc('month', current_date)
group by p.id, p.name
order by quantity_sold desc, revenue desc;

-- Category sales for pie chart
select
  coalesce(c.name, 'Uncategorized') as category,
  sum(si.line_total) as revenue
from sales s
join sale_items si on si.sale_id = s.id
join products p on p.id = si.product_id
left join categories c on c.id = p.category_id
where s.status = 'paid'
group by c.name
order by revenue desc;

-- Stock movement history
select
  sm.created_at,
  p.name as product,
  sm.movement_type,
  sm.quantity,
  sm.reference_type,
  sm.reference_id,
  sm.notes
from stock_movements sm
join products p on p.id = sm.product_id
order by sm.created_at desc
limit 100;

-- Add a new category
-- insert into categories (name, description)
-- values ('New Category', 'Optional description')
-- on conflict (name) do nothing;

-- Add a new product
-- insert into products (sku, barcode, name, category_id, stock_on_hand, reorder_level, buy_price, sale_price)
-- values ('SKU-001', 'BARCODE-001', 'Product Name', 1, 10, 3, 100, 125);

-- Manual stock adjustment
-- update products
-- set stock_on_hand = stock_on_hand + 5,
--     updated_at = now()
-- where barcode = '4971295131204';
