
create table area(
  area_id serial primary key,
  name varchar(100) not null,
  delivery_fee decimal(10,2) check(deilvery_fee >=0),
  delivery_count int default 0
);

create table time_slots(
  time_slot_id int primary key serial,
  start_time TIME not null,
  end_time TIME not null,
  max_capacity int default 10,
  check(start_time < end_time)
);

create table person(
  person_id int primary key serial,
  name varchar(100) not null,
  email varchar(100) unique not null,
  phone varchar(20) not null,
  role varchar(50) check (role in ('user','admin','seller','rider'))
);

create table "users" (
  user_id int primary key,
  loyalty_points int default 0,
  products_ordered int default 0,
  foreign key (user_id) references person(person_id) on delete cascade
);

create table admin(
  admin_id int primary key,
  foreign key (admi_id) references person(person_id) on delete cascade
);

create table rider(
  rider_id int primary key,
  rating decimal(3,2) check(rating>=0.0 and rating<=5),
  orders_delivered int default 0,
  vehicle_type varchar(50),
  foreign key (rider_id) references person(person_id) on delete cascade
);

create table seller(
  seller_id int primary key,
  company_name varchar(100),
  orders_delivered int default 0,
  foreign key (seller_id) references person(person_id) on delete cascade
);

create table address(
  address_id int primary key serial,
  street varchar(255) not null,
  city varchar(100),
  division VARCHAR(50),
  zip VARCHAR(20),
  post_office VARCHAR(100),
  label VARCHAR(50),
  area_id INT not null,
  foreign key (area_id) references area(area_id)
);

create table person_address(
  person_id int not null,
  address_id int not null,
  label varchar(50),
  foreign key person_id references person(person_id) on delete cascade,
  foreign key address_id references address(address_id) on delete cascade,
  primary key (person_id,address_id)
);

create table category (
  category_id int primary key serial,
  name varchar(100) not null,
  image_url varchar(255) not null,
  parent_id int,
  foreign key parent_id references category(category_id)
);

-- create table product_offer(
--   product_offer_id int primary key serial,
--   offer_type varchar(50),
--   amount decimal(10,2),
--   percentage decimal(10,2),
--   expiry_date date
-- );

create table products(
  product_id int primary key serial,
  name varchar(100) not null,
  description text,
  unit varchar(20),
  unit_price decimal(10,2) not null check(unit_price>=0),
  stock INT default 0 check(stock>=0),
  rating decimal(3,2) default 0.0,
  image_url varchar(255),
  sell_count int default 0,
  product_offer_id int,
  category_id int not null,
  foreign key product_offer_id references product_offer(product_offer_id) on delete set null,
  foreign key category_id references catagories(catagory_id)
);

create table cart(
  card_id int primary key serial,
  total_cost decimal(10,2) default 0.0,
  discount decimal(10,2) default 0.0,
  delivery_fee decimal(10,2) default 0.0,
  user_id int unique not null,
  foreign key (user_id) references users(user_id) on delete cascade
);

create table Cart_Items (
    cart_id int,
    product_id int,
    quantity int not null check(quantity>0),
    price decimal(10, 2) not null,
    add_time time default current_time,
    primary key (cart_id,product_id),
    foreign key (cart_id) references cart(cart_id) on delete cascade,
    foreign key (product_id) references products(product_id) on delete cascade
);

-- create table order_offer(
--   offer_id int primary key serial,
--   coupon_code varchar(255) unique,
--   offer_type varchar(50),
--   max_cap decimal(10,2),
--   discount_amount decimal(10,2),
--   percentage decimal(10,2),
--   expires_at date
-- );

create table orders(
  order_id int primary key serial,
  order_time timestamp default current_timestamp,
  status varchar(50) check(status in('pending','delivered','ontheway')),
  user_id int not null,
  foreign key (user_id) references users(user_id)
);

create table delivery(
  delivery_id int primary key serial,
  status varchar(50),
  pickup_time timestamp,
  estimated_arrival timestamp,
  order_id int unique not null,
  rider_id int not null,
  time_slot_id int not null,
  address_id int not null,
  foreign key (address_id) references address(address_id),
  foreign key (order_id) references orders(order_id) on delete cascade,
  foreign key (time_slot_id) references timeslots(time_slot_id),
  foreign key (rider_id) references rider(rider_id)
);

create table payment(
  payment_id int primary key serial,
  method varchar(50),
  payment_time timestamp default current_timestamp,
  status varchar(50),
  order_id int unique not null,
  foreign key (order_id) references orders(order_id) on delete cascade
);



create table order_details(
    order_id int,
    product_id int,
    quantity int not null check(quantity>0),
    price decimal(10, 2) not null,
    primary key (order_id, product_id),
    foreign key (order_id) references orders(order_id),
    foreign key (product_id) references products(product_id)
);

CREATE TABLE product_review (
    review_id serial primary key,
    rating int check(rating >=1 and rating <=5),
    comment text,
    user_id int not null,
    product_id int not null,
    foreign key (user_id) references users(user_id) on delete cascade,
    foreign key (product_id) references products(product_id) on delete cascade
);

create table order_applied_offer(
  order_id int primary key not null,
  offer_id int,
  foreign key (order_id) references orders(order_id) on delete cascade,
  foreign key (offer_id) references order_offer(offer_id) on delete cascade,
);


create table time_slots(
  time_slot_id int primary key serial,
  start_time TIME not null,
  end_time TIME not null,
  max_capacity int default 10,
  check(start_time < end_time)
);


create table time_slots(
  time_slot_id serial primary key,
  start_time TIME not null,
  end_time TIME not null,
  max_capacity int default 10,
  check(start_time < end_time)
);
create table person(
  person_id serial primary key,
  name varchar(100) not null,
  email varchar(100) unique not null,
  phone varchar(20) not null,
  role varchar(50) check (role in ('user','admin','seller','rider'))
);
create table "users" (
  user_id int primary key,
  loyalty_points int default 0,
  products_ordered int default 0,
  foreign key (user_id) references person(person_id) on delete cascade
);
create table admin(
  admin_id int primary key,
  foreign key (admin_id) references person(person_id) on delete cascade
);
create table rider(
  rider_id int primary key,
  rating decimal(3,2) check(rating>=0.0 and rating<=5),
  orders_delivered int default 0,
  vehicle_type varchar(50),
  foreign key (rider_id) references person(person_id) on delete cascade
);

create table seller(
  seller_id int primary key,
  company_name varchar(100),
  orders_delivered int default 0,
  foreign key (seller_id) references person(person_id) on delete cascade
);
create table address(
  address_id serial primary key ,
  street varchar(255) not null,
  city varchar(100),
  division VARCHAR(50),
  zip VARCHAR(20),
  post_office VARCHAR(100),
  label VARCHAR(50),
  area_id INT not null,
  foreign key (area_id) references area(area_id)
);
create table person_address(
  person_id int not null,
  address_id int not null,
  label varchar(50),
  foreign key (person_id) references person(person_id) on delete cascade,
  foreign key (address_id) references address(address_id) on delete cascade,
  primary key (person_id,address_id)
);
create table category (
  category_id serial primary key,
  name varchar(100) not null,
  image_url varchar(255) not null,
  parent_id int,
  foreign key (parent_id) references category(category_id)
);

create table product_offer(
  product_offer_id serial primary key,
  offer_type varchar(50),
  amount decimal(10,2),
  percentage decimal(10,2),
  expiry_date date
);


create table products(
  product_id serial primary key ,
  name varchar(100) not null,
  description text,
  unit varchar(20),
  unit_price decimal(10,2) not null check(unit_price>=0),
  stock INT default 0 check(stock>=0),
  rating decimal(3,2) default 0.0,
  image_url varchar(255),
  sell_count int default 0,
  product_offer_id int,
  category_id int not null,
  foreign key (product_offer_id) references product_offer(product_offer_id) on delete set null,
  foreign key (category_id) references category(category_id)
);

create table cart(
  cart_id serial primary key,
  total_cost decimal(10,2) default 0.0,
  discount decimal(10,2) default 0.0,
  delivery_fee decimal(10,2) default 0.0,
  user_id int unique not null,
  foreign key (user_id) references users(user_id) on delete cascade
);

create table Cart_Items (
    cart_id int,
    product_id int,
    quantity int not null check(quantity>0),
    price decimal(10, 2) not null,
    add_time time default current_time,
    primary key (cart_id,product_id),
    foreign key (cart_id) references cart(cart_id) on delete cascade,
    foreign key (product_id) references products(product_id) on delete cascade
);

create table orders(
  order_id serial primary key,
  order_time timestamp default current_timestamp,
  status varchar(50) check(status in('pending','delivered','ontheway')),
  user_id int not null,
  foreign key (user_id) references users(user_id)
);

create table order_offer(
  offer_id serial primary key,
  coupon_code varchar(255) unique,
  offer_type varchar(50),
  max_cap decimal(10,2),
  discount_amount decimal(10,2),
  percentage decimal(10,2),
  expires_at date
);

create table order_applied_offer(
  order_id int primary key not null,
  offer_id int,
  foreign key (order_id) references orders(order_id) on delete cascade,
  foreign key (offer_id) references order_offer(offer_id) on delete cascade
);

create table delivery(
  delivery_id serial primary key ,
  status varchar(50),
  pickup_time timestamp,
  estimated_arrival timestamp,
  order_id int unique not null,
  rider_id int not null,
  time_slot_id int not null,
  address_id int not null,
  foreign key (address_id) references address(address_id),
  foreign key (order_id) references orders(order_id) on delete cascade,
  foreign key (time_slot_id) references time_slots(time_slot_id),
  foreign key (rider_id) references rider(rider_id)
);

create table payment(
  payment_id serial primary key,
  method varchar(50),
  payment_time timestamp default current_timestamp,
  status varchar(50),
  order_id int unique not null,
  foreign key (order_id) references orders(order_id) on delete cascade
);

create table order_details(
    order_id int,
    product_id int,
    quantity int not null check(quantity>0),
    price decimal(10, 2) not null,
    primary key (order_id, product_id),
    foreign key (order_id) references orders(order_id),
    foreign key (product_id) references products(product_id)
);

CREATE TABLE product_review (
    review_id serial primary key,
    rating int check(rating >=1 and rating <=5),
    comment text,
    user_id int not null,
    product_id int not null,
    foreign key (user_id) references users(user_id) on delete cascade,
    foreign key (product_id) references products(product_id) on delete cascade
);


-- INSERT INTO category (category_id, name, image_url,parent_id)
-- VALUES (1, 'Main Catalog', 'https://www.pinclipart.com/picdir/big/535-5359859_grocery-icon-png-clipart.png',null)
-- ON CONFLICT (category_id) DO NOTHING;

-- insert into category(
--   name,
--   parent_id,
--   image_url
-- )
-- select 
--   name,
--   1,
--   'https://www.pinclipart.com/picdir/big/535-5359859_grocery-icon-png-clipart.png'
--  from backup_catagories;

--  INSERT INTO products (
--   name,
--   unit,
--   unit_price,
--   stock,
--   rating,
--   image_url,
--   category_id
-- )
-- SELECT 
--   name,
--   unit,
--   price,          
--   stock_quantity, 
--   0,               
--   image_url,
--   1               
-- FROM backup_products;

alter table person add column password varchar(255);
alter table person drop column person;

create table user_offer(
  offer_id int not null,
  min_loyality int ,
  start_time timestamp default current_timestamp,
  end_time timestamp,
  primary key(offer_id),
  foreign key(offer_id) references order_offer(offer_id)
);

alter table payment add column amount decimal;

-- Add the foreign key column
ALTER TABLE products 
ADD COLUMN seller_id INT;


ALTER TABLE products 
ADD CONSTRAINT fk_products_seller 
FOREIGN KEY (seller_id) REFERENCES seller(seller_id) ON DELETE CASCADE;

alter table orders 
add column address_id int;

alter table orders 
add constraint fk_orders_address 
foreign key (address_id) references address(address_id);

alter table person_address
add column is_default boolean default false;


ALTER TABLE products
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- ==========================================
-- 1. UPDATE INCORRECT IMAGES
-- ==========================================

-- Update Coca-Cola (Covers 250ml, 600ml, 1.25L, 2.25L and Batch 2)
UPDATE products 
SET image_url = 'https://chaldn.com/_mpimage/coca-cola-250-ml?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D146979&q=best&v=1' 
WHERE name ILIKE '%Coca-Cola%';

-- Update Basmati Rice
UPDATE products 
SET image_url = 'https://chaldn.com/_mpimage/fortune-biryani-special-basmati-rice-1-kg?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D182969&q=best&v=1&m=400' 
WHERE name ILIKE '%Basmati Rice%';

-- Update Mug Dal
UPDATE products 
SET image_url = 'https://chaldn.com/_mpimage/pran-mug-dal-500-gm?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D108367&q=best&v=1&m=400&m=400' 
WHERE name ILIKE '%Mug Dal%';

-- Update Deshi Masoor Dal
UPDATE products 
SET image_url = 'https://chaldn.com/_mpimage/pran-mug-dal-500-gm?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D108367&q=best&v=1&m=400&m=400' 
WHERE name ILIKE '%Masoor Dal%';

-- Update 7 Up
UPDATE products 
SET image_url = 'https://chaldn.com/_mpimage/7-up-175-ltr?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D177199&q=best&v=1&m=400' 
WHERE name ILIKE '%7 Up%';


-- ==========================================
-- 2. ADD NEW CATEGORIES & PRODUCTS
-- ==========================================

-- Insert new categories first (Assuming IDs 6 and 7 are available)
INSERT INTO category (category_id, name, parent_id, image_url) 
VALUES 
  (8, 'Electronics', null, 'https://cdn-icons-png.flaticon.com/512/3659/3659898.png'),
  (7, 'Clothing', null, 'https://cdn-icons-png.flaticon.com/512/3159/3159614.png');

-- Insert Electronics
INSERT INTO products (name, description, unit, unit_price, stock, rating, image_url, sell_count, category_id, is_active) 
VALUES 
  ('Apple AirPods Pro 2', 'Wireless noise cancelling earbuds', '1 pair', 28500.00, 15, 0.00, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83_AV1', 0, 6, 'true'),
  ('Samsung Galaxy Watch 6', 'Smartwatch with fitness tracking', '1 pcs', 32000.00, 10, 0.00, 'https://images.samsung.com/is/image/samsung/p6pim/levant/sm-r930nzekmea/gallery/levant-galaxy-watch6-r930-sm-r930nzekmea-537406603', 0, 6, 'true'),
  ('Anker PowerCore 10000mAh', 'Portable phone charger and power bank', '1 pcs', 2500.00, 40, 0.00, 'https://m.media-amazon.com/images/I/610hO6SioYL._AC_SL1500_.jpg', 0, 6, 'true');

-- Insert Clothing
INSERT INTO products (name, description, unit, unit_price, stock, rating, image_url, sell_count, category_id, is_active) 
VALUES 
  ('Men''s Cotton T-Shirt (Black)', '100% Cotton solid black t-shirt', '1 pcs', 350.00, 50, 0.00, 'https://m.media-amazon.com/images/I/51wX1l18Q-L._AC_UY1000_.jpg', 0, 7, 'true'),
  ('Men''s Winter Denim Jacket', 'Classic blue denim jacket', '1 pcs', 1850.00, 20, 0.00, 'https://m.media-amazon.com/images/I/71KkI38v3yL._AC_UY1000_.jpg', 0, 7, 'true'),
  ('Women''s Silk Scarf', 'Lightweight floral silk scarf', '1 pcs', 450.00, 35, 0.00, 'https://m.media-amazon.com/images/I/71a+I2oM0OL._AC_UY1000_.jpg', 0, 7, 'true');


alter table product_review
add column is_active boolean default true;

create or replace function update_product_rating()
returns trigger as $$
begin
  update products set
  rating=(
    select coalesce(avg(rating),0)
    from product_review
    where product_id=NEW.product_id and is_active=true
  )
  where product_id=NEW.product_id;
  return NEW;

end;
$$ language plpgsql;
create or replace trigger rating_update_trig
after insert or update of rating,is_active 
on product_review
for each row execute function update_product_rating();


create or replace function loyalty_points_generate()
returns trigger as $$
declare
  total decimal;
  points int;
  cus_id int;
begin
  select user_id into cus_id
  from orders
  where order_id=new.order_id;

  select coalesce(sum(quantity*price),0) into total
  from order_details
  where order_id=new.order_id;

  points:=floor(total/100);
  update "users"
  set products_ordered=products_ordered+
  (
    select coalesce(sum(quantity),0)
    from order_details 
    where order_id=new.order_id
  ),
  loyalty_points=loyalty_points+points
  where user_id=cus_id;

  return new;

end;

$$ language plpgsql;

create or replace trigger loyalty_trig 
after insert on payment 
for each row execute function loyalty_points_generate();

create or replace function place_order(
    p_user_id int,
    p_address_id int,
    p_total_amount decimal,
    p_payment_method varchar(100),
    p_contact_name varchar(100),
    p_contact_phone varchar(20),
    p_items jsonb
) returns int as $$
declare
    new_order_id int;
    item record;
begin
    
    insert into orders (user_id, address_id, status, order_time) 
    values (p_user_id, p_address_id, 'pending', NOW()) 
    returning order_id into new_order_id;

    for item in select * from jsonb_to_recordset(p_items) as x(id int, qty int, price decimal,name varchar,image varchar)
    loop

        insert into  order_details (order_id, product_id, quantity, price,product_name,image_url) 
        values (new_order_id, item.id, item.qty, item.price,item.name,item.image);

        update products 
        set stock = stock - item.qty ,
        sell_count=sell_count+item.qty
        where product_id = item.id;
    end loop;

    insert into payment (order_id, amount, method, status, payment_time) 
    values (new_order_id, p_total_amount, p_payment_method, 'pending', NOW());

    insert into delivery (order_id,address_id,status,contact_name,contact_phone)
    values (new_order_id,p_address_id,'pending',p_contact_name,p_contact_phone);
    return new_order_id;
end;
$$ language plpgsql;


create or replace function cart_joiner(v_user_id int)
returns table
(
  id int,
  name varchar,
  image varchar,
  price decimal,
  qty int
) as $$
begin
  return query
  select 
  p.product_id as id,
  p.name,
  p.image_url as image,
  ci.price as price,
  ci.quantity as qty 
  from products p
  join cart_items ci on ci.product_id=p.product_id
  join cart c on c.cart_id=ci.cart_id
  where c.user_id=v_user_id;
end;
$$ language plpgsql;

alter table cart 
drop column total_cost,
drop column discount,
drop column delivery_fee;

create or replace function get_user_profile(v_user_id int)
returns json AS $$
declare
    profile_data json;
begin
    select
        json_build_object(
            'name', p.name,
            'email', p.email,
            'phone', p.phone,
            'image_url', p.image_url,
            'loyalty_points', u.loyalty_points,
            'orders', (
                select coalesce(
                    json_agg(
                        json_build_object(
                            'order_id', o.order_id,
                            'status', o.status,
                            'items', (
                                select json_agg(
                                    json_build_object(
                                        'product_id', od.product_id,
                                        'name', od.product_name,
                                        'price', od.price,    
                                        'qty', od.quantity,
                                        'image', od.image_url
                                    )
                                )
                                from order_details od
                                where od.order_id = o.order_id
                            )
                        )
                    ), '[]'::json
                )
                from orders o
                where o.user_id = v_user_id
            )
        )
    into profile_data
    from person p
    join "users" u on p.person_id = u.user_id
    where p.person_id = v_user_id;
    
    return profile_data;
end;
$$ language plpgsql;

alter table order_details
add column 
product_name varchar,
add column
image_url varchar;

update order_details
set
    product_name = products.name,
    image_url = products.image_url
from products
where order_details.product_id = products.product_id
and order_details.product_name is null; -- Only updates rows that are missing the data

drop function submit_review;
create or replace function submit_review(userId int,productId int,v_rating int,v_text varchar)
returns void as $$
declare 
rev_id int;
begin
  select review_id into rev_id 
  from product_review 
  where user_id=userId and product_id=productId;

  if (rev_id is null) then 
    insert into product_review (user_id,product_id,rating,comment) values 
    (userId,productId,v_rating,v_text);
  else 
    update product_review 
    set rating=v_rating,
    comment=v_text
    where review_id=rev_id;
  end if;
end;
$$ language plpgsql;

alter table person
add column 
image_url varchar default null;

update orders
set status='delivered' where order_id=28;

alter table orders
add column rider_id int references rider(rider_id);

create or replace function get_rider_jobs()
returns json
as $$
declare
order_data json;

begin

  --select all orders that have pending
  select coalesce(
    json_agg(
      json_build_object(
        'order_id',o.order_id,
        'customer_name',d.contact_name,
        'customer_phone',d.contact_phone,
        'street', a.street,
        'city', a.city,
        'division', a.division,
        'order_time', o.order_time,
        'delivery_fee',ar.delivery_fee
      )
  )
  ,'[]'::json
  ) into order_data
  from orders o
  join delivery d on d.order_id=o.order_id
  join address a on o.address_id=a.address_id
  join area ar on a.area_id=ar.area_id
  where upper(o.status)='PENDING' and o.rider_id is null;
  return order_data;
end;
$$ language plpgsql;

create or replace function update_rider_order_deliver()
returns trigger
as $$
begin
if new.status='delivered' and old.status is distinct from 'delivered' then
  if new.rider_id is not null then
    update rider
    set orders_delivered=coalesce(orders_delivered,0)+1
    where rider_id=NEW.rider_id;
  end if;
end if;
return new;
end;
$$ language plpgsql;

drop trigger if exists trg_update_delivery_cnt on orders;

create trigger trg_update_delivery_cnt
after update of status on orders
for each row
execute function update_rider_order_deliver();

CREATE TABLE IF NOT EXISTS admin_seller_messages (
    message_id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES person(person_id) ON DELETE CASCADE,
    seller_id INTEGER NOT NULL REFERENCES person(person_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id) ON DELETE SET NULL,
    subject VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_messages_seller ON admin_seller_messages(seller_id);
CREATE INDEX idx_admin_messages_admin ON admin_seller_messages(admin_id);

alter table delivery
alter column rider_id drop not null;

create or replace function sync_delivery_status()
returns trigger
as $$

declare

begin
if NEW.rider_id is not null and OLD.rider_id is null then
  update delivery
  set status='ontheway',
      rider_id=NEW.rider_id,
      pickup_time=current_timestamp
  where order_id=NEW.order_id;
end if;

if NEW.status='delivered' and old.status is distinct from 'delivered' then
  update delivery
  set arrival_time=current_timestamp,
      status='delivered'
  where order_id=NEW.order_id;
end if;

return new;
end;
$$ language plpgsql;

drop trigger if exists trg_delivery_table_sync on orders;

create trigger trg_delivery_table_sync
after update of rider_id,status on orders
for each row
execute function sync_delivery_status();

alter table delivery
rename column estimated_arrival to arrival_time;

alter table delivery
alter column time_slot_id drop not null;

insert into delivery
(order_id,status,address_id)
select order_id,status,address_id
from orders
where address_id is not null;

ALTER TABLE delivery 
ADD COLUMN contact_name VARCHAR(100),
ADD COLUMN contact_phone VARCHAR(20);

UPDATE delivery d
SET contact_name = p.name,
    contact_phone = p.phone
FROM orders o
JOIN "users" u ON o.user_id = u.user_id
JOIN person p ON p.person_id = u.user_id
WHERE d.order_id = o.order_id 
  AND d.contact_name IS NULL;


create or replace function increment_seller_delivered_count()
returns trigger as $$
begin
    
    if new.status = 'delivered' and old.status <> 'delivered' then
        
        update seller s
        set orders_delivered = s.orders_delivered + 1
        where s.seller_id in (
            select distinct p.seller_id
            from order_details od
            join products p on p.product_id = od.product_id
            where od.order_id = NEW.order_id
        );

    end if;
    return new;
end;
$$ language plpgsql;

create trigger trigger_order_delivered
after update of status on orders
for each row
execute function increment_seller_delivered_count();

update seller 
set company_name = person.name 
from person 
where seller.seller_id = person.person_id 
and seller.company_name is null;

CREATE TABLE IF NOT EXISTS rider_review (
          review_id serial primary key,
          rating int check(rating >=1 and rating <=5),
          comment text,
          user_id int not null,
          rider_id int not null,
          is_active boolean default true,
          foreign key (user_id) references "users"(user_id) on delete cascade,
          foreign key (rider_id) references rider(rider_id) on delete cascade,
          CONSTRAINT unique_user_rider_review UNIQUE (user_id, rider_id)
      );

CREATE OR REPLACE FUNCTION submit_rider_review(v_userId int, v_riderId int, v_rating int, v_text varchar)
RETURNS void AS $$
BEGIN
  INSERT INTO rider_review (user_id, rider_id, rating, comment)
  VALUES (v_userId, v_riderId, v_rating, v_text)
  ON CONFLICT (user_id, rider_id) 
  DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, is_active = true;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_rider_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE rider SET
  rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM rider_review
    WHERE rider_id = NEW.rider_id AND is_active = true
  )
  WHERE rider_id = NEW.rider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER rider_rating_update_trig
AFTER INSERT OR UPDATE OF rating, is_active 
ON rider_review
FOR EACH ROW EXECUTE FUNCTION update_rider_rating();

update products
set seller_id=34
where seller_id is null;

CREATE OR REPLACE PROCEDURE get_seller_stats(
    sellerId IN int,
    totalProfit OUT numeric,
    totalSales OUT int,
    sellerRating OUT numeric
)
AS $$
BEGIN
  SELECT 
      COALESCE(SUM(od.price * od.quantity), 0),
      COALESCE(SUM(od.quantity), 0)
  INTO 
      totalProfit, totalSales
  FROM order_details od
  JOIN products p ON p.product_id = od.product_id
  WHERE p.seller_id = sellerId;

  SELECT 
      COALESCE(AVG(p.rating), 0)
  INTO 
      sellerRating
  FROM products p
  WHERE p.seller_id = sellerId;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- ADVERTISEMENT SYSTEM
-- ==========================================

CREATE TABLE IF NOT EXISTS advertisements (
    ad_id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES person(person_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    tagline VARCHAR(300),
    budget DECIMAL(10,2) NOT NULL DEFAULT 0,
    duration_days INTEGER NOT NULL DEFAULT 7,
    gradient VARCHAR(300) DEFAULT 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ads_seller ON advertisements(seller_id);
CREATE INDEX IF NOT EXISTS idx_ads_product ON advertisements(product_id);
CREATE INDEX IF NOT EXISTS idx_ads_active ON advertisements(is_active, expires_at);

-- Add approval workflow to advertisements
ALTER TABLE advertisements
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));

ALTER TABLE advertisements
ADD COLUMN IF NOT EXISTS admin_note TEXT;

-- Ad display settings (singleton row)
CREATE TABLE IF NOT EXISTS ad_settings (
    id INT PRIMARY KEY DEFAULT 1,
    max_display_limit INT NOT NULL DEFAULT 5
);
INSERT INTO ad_settings (id, max_display_limit) VALUES (1, 5) ON CONFLICT DO NOTHING;

-- ==========================================
-- PRODUCT RETURN SYSTEM
-- ==========================================

CREATE TABLE IF NOT EXISTS return_requests (
    return_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES "users"(user_id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    condition VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS return_items (
    return_id INT NOT NULL REFERENCES return_requests(return_id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(product_id),
    quantity INT NOT NULL DEFAULT 1,
    PRIMARY KEY (return_id, product_id)
);

CREATE TABLE IF NOT EXISTS return_images (
    image_id SERIAL PRIMARY KEY,
    return_id INT NOT NULL REFERENCES return_requests(return_id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_return_order ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_user ON return_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_return_status ON return_requests(status);

CREATE OR REPLACE FUNCTION sync_cart_totals()
RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        UPDATE cart
        SET total_cost = (
            SELECT COALESCE(SUM(quantity * price), 0)
            FROM cart_items
            WHERE cart_id = OLD.cart_id
        )
        WHERE cart_id = OLD.cart_id;
        
        RETURN OLD;
    ELSE
        UPDATE cart
        SET total_cost = (
            SELECT COALESCE(SUM(quantity * price), 0)
            FROM cart_items
            WHERE cart_id = NEW.cart_id
        )
        WHERE cart_id = NEW.cart_id;
        
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE get_seller_stats(
    sellerId IN int,
    totalProfit OUT numeric,
    totalSales OUT int,
    sellerRating OUT numeric
)
AS $$
BEGIN
  SELECT 
      COALESCE(SUM(od.price * od.quantity), 0),
      COALESCE(SUM(od.quantity), 0)
  INTO 
      totalProfit, totalSales
  FROM order_details od
  JOIN products p ON p.product_id = od.product_id
  WHERE p.seller_id = sellerId;
  SELECT 
      COALESCE(AVG(NULLIF(p.rating, 0)), 0)
  INTO 
      sellerRating
  FROM products p
  WHERE p.seller_id = sellerId;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE update_profile(
    v_person_id IN INT,
    v_name IN VARCHAR,
    v_phone IN VARCHAR,
    v_password IN VARCHAR DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE person 
    SET 
        name = COALESCE(v_name, name),
        phone = COALESCE(v_phone, phone),
        password = COALESCE(v_password, password)
    WHERE person_id = v_person_id;
END;
$$;

create or replace procedure admin_toggle_product(
    v_product_id IN INT,
    v_status IN BOOLEAN
)

as $$
begin
    update products 
    set is_active = v_status 
    where product_id = v_product_id;
end;
$$ language plpgsql;

CREATE TABLE IF NOT EXISTS loyalty_tiers (
  tier_id    SERIAL PRIMARY KEY,
  tier_name  VARCHAR(50) NOT NULL,
  min_points INT NOT NULL,
  color      VARCHAR(20) DEFAULT '#888',
  icon       VARCHAR(10) DEFAULT '🎖️'
);

CREATE TABLE IF NOT EXISTS coupons (
  coupon_id        SERIAL PRIMARY KEY,
  code             VARCHAR(50) UNIQUE NOT NULL,
  tier_id          INT REFERENCES loyalty_tiers(tier_id) ON DELETE SET NULL,
  discount_type    VARCHAR(20) NOT NULL CHECK (discount_type IN ('percent', 'flat')),
  discount_value   DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  min_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_discount     DECIMAL(10,2),
  description      TEXT,
  is_active        BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS user_coupons (
  user_id      INT NOT NULL REFERENCES "users"(user_id) ON DELETE CASCADE,
  coupon_id    INT NOT NULL REFERENCES coupons(coupon_id) ON DELETE CASCADE,
  used         BOOLEAN DEFAULT FALSE,
  assigned_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, coupon_id)
);

INSERT INTO loyalty_tiers (tier_name, min_points, color, icon) VALUES
  ('Bronze',   0,    '#cd7f32', '🥉'),
  ('Silver',   200,  '#a8a9ad', '🥈'),
  ('Gold',     500,  '#ffd700', '🥇'),
  ('Platinum', 1000, '#e5e4e2', '💎')
ON CONFLICT DO NOTHING;


INSERT INTO coupons (code, tier_id, discount_type, discount_value, min_order_amount, max_discount, description) VALUES
  ('BRONZE10', (SELECT tier_id FROM loyalty_tiers WHERE tier_name='Bronze'),   'percent', 10, 200,  50,  '10% off, up to ৳50. Min order ৳200.'),
  ('SILVER15', (SELECT tier_id FROM loyalty_tiers WHERE tier_name='Silver'),   'percent', 15, 400,  100, '15% off, up to ৳100. Min order ৳400.'),
  ('GOLD20',   (SELECT tier_id FROM loyalty_tiers WHERE tier_name='Gold'),     'percent', 20, 600,  200, '20% off, up to ৳200. Min order ৳600.'),
  ('PLAT30',   (SELECT tier_id FROM loyalty_tiers WHERE tier_name='Platinum'), 'percent', 30, 800,  400, '30% off, up to ৳400. Min order ৳800.')
ON CONFLICT (code) DO NOTHING;

CREATE OR REPLACE PROCEDURE assign_tier_coupons(p_user_id INT)
LANGUAGE plpgsql AS $$
DECLARE
  v_points INT;
BEGIN
  SELECT loyalty_points INTO v_points FROM "users" WHERE user_id = p_user_id;

  -- Insert any coupon for tiers the user qualifies for, skip if already assigned
  INSERT INTO user_coupons (user_id, coupon_id)
  SELECT p_user_id, c.coupon_id
  FROM coupons c
  JOIN loyalty_tiers lt ON c.tier_id = lt.tier_id
  WHERE lt.min_points <= v_points
    AND c.is_active = TRUE
  ON CONFLICT (user_id, coupon_id) DO NOTHING;
END;
$$;


CREATE OR REPLACE FUNCTION trigger_assign_coupons()
RETURNS TRIGGER AS $$
BEGIN
  CALL assign_tier_coupons(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_assign_coupons ON "users";
CREATE TRIGGER auto_assign_coupons
AFTER UPDATE OF loyalty_points ON "users"
FOR EACH ROW
EXECUTE FUNCTION trigger_assign_coupons();

CREATE INDEX IF NOT EXISTS idx_user_coupons_user ON user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_tier ON coupons(tier_id);