insert into categories (name) values
  ('BOSNY Spray Paint'),
  ('C Oil Filter'),
  ('Yamaha'),
  ('Petron'),
  ('Repsol'),
  ('Motor Oil')
on conflict (name) do nothing;

insert into app_users (name, username, password_hash, role)
values
  ('Joey', 'joey', '$2a$10$EW2f7Qg6ReNt0sGIJ6oUa.UYbrK3FilM/49t3N8XtM1nARDKakXiy', 'owner'),
  ('Administrator', 'admin', '$2a$10$n4B67TNDoDApJQI7UjfG4.RglmA3YHZvLCEqnox6wPPzS5njCFeNe', 'admin'),
  ('Cashier', 'cashier', '$2a$10$RoE5TMKBx8XhmtVrccovZOm0UB8LuPZ4eEL1th499Ic2LbhaJw6cG', 'cashier')
on conflict (username) do nothing;

insert into products (sku, barcode, name, category_id, stock_on_hand, reorder_level, buy_price, sale_price, image_url)
values
  ('OF-C312', '4971295131204', 'C-312 Oil Filter', (select id from categories where name = 'C Oil Filter'), 6, 3, 200, 230, '/product-images/oil-filter.svg'),
  ('YM-AT20W40', '90793AP42900', 'YAMALUBE AT 20W-40 1L', (select id from categories where name = 'Yamaha'), 7, 3, 280, 300, '/product-images/yamalube.svg'),
  ('PT-SPRINT4T', '4806505973629', 'Petron Sprint 4T 1L', (select id from categories where name = 'Petron'), 11, 3, 180, 200, '/product-images/petron-oil.svg'),
  ('RP-MOTO', '8886351385063', 'Repsol Motorcycle Oil', (select id from categories where name = 'Repsol'), 1, 3, 250, 270, '/product-images/repsol-oil.svg'),
  ('BN-SILVER', '8850747502228', 'BOSNY Spray Paint Silver Grey', (select id from categories where name = 'BOSNY Spray Paint'), 10, 3, 100, 125, '/product-images/spray-paint.svg')
on conflict (barcode) do nothing;

update products set image_url = '/product-images/oil-filter.svg' where barcode = '4971295131204' and coalesce(image_url, '') = '';
update products set image_url = '/product-images/yamalube.svg' where barcode = '90793AP42900' and coalesce(image_url, '') = '';
update products set image_url = '/product-images/petron-oil.svg' where barcode = '4806505973629' and coalesce(image_url, '') = '';
update products set image_url = '/product-images/repsol-oil.svg' where barcode = '8886351385063' and coalesce(image_url, '') = '';
update products set image_url = '/product-images/spray-paint.svg' where barcode = '8850747502228' and coalesce(image_url, '') = '';
