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
  (6, 'Electronics', null, 'https://cdn-icons-png.flaticon.com/512/3659/3659898.png'),
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