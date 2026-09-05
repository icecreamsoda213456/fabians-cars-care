alter table products
  add column if not exists image_url text,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by bigint references app_users(id) on delete set null,
  add column if not exists purged_at timestamptz;

-- Product pictures are stored as image URL or public asset path in image_url.
update products set image_url = '/product-images/oil-filter.svg' where barcode = '4971295131204' and coalesce(image_url, '') = '';
update products set image_url = '/product-images/yamalube.svg' where barcode = '90793AP42900' and coalesce(image_url, '') = '';
update products set image_url = '/product-images/petron-oil.svg' where barcode = '4806505973629' and coalesce(image_url, '') = '';
update products set image_url = '/product-images/repsol-oil.svg' where barcode = '8886351385063' and coalesce(image_url, '') = '';
update products set image_url = '/product-images/spray-paint.svg' where barcode = '8850747502228' and coalesce(image_url, '') = '';

-- Owner recycle bin view: products stay visible here for 30 days after deletion.
select
  p.id,
  p.name,
  p.barcode,
  p.image_url,
  p.sale_price,
  p.stock_on_hand,
  p.deleted_at,
  p.deleted_at + interval '30 days' as purge_after,
  u.name as deleted_by
from products p
left join app_users u on u.id = p.deleted_by
where p.is_active = false
  and p.deleted_at is not null
  and p.purged_at is null
order by p.deleted_at desc;
