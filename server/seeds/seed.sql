-- Seed script for Dakshin Bhavan South Indian Restaurant with exact Menu & Prices from uploaded Menu Cards

-- 1. Clean existing seed data cleanly
TRUNCATE TABLE order_items, payments, orders, menu_items, categories, offers, coupons, reviews, contact_enquiries, restaurant_settings CASCADE;

-- 2. Insert Categories
INSERT INTO categories (id, name, slug, description, image_url, display_order) VALUES
(1, 'Tea & Beverages', 'beverages', 'Traditional Tea, Coffee & Milk', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80', 1),
(2, 'Dosa', 'dosa', 'Crispy traditional South Indian Crepes', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', 2),
(3, 'Special Dosa', 'special-dosa', 'Ghee, Podi & Gourmet Special Dosas', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', 3),
(4, 'Uttapam', 'uttapam', 'Thick savory pancakes with delicious toppings', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', 4),
(5, 'Idli', 'idli', 'Steamed rice cakes served with Sambar & Chutneys', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', 5),
(6, 'Vada', 'vada', 'Crispy lentil donuts & Combos', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80', 6),
(7, 'Sheera & Desserts', 'desserts', 'Authentic South Indian Sweets', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80', 7),
(8, 'Rice', 'rice', 'Seasoned aromatic rice dishes', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80', 8),
(9, 'Extras', 'extras', 'Add-ons: Cheese, Butter & Masala', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', 9);

SELECT setval('categories_id_seq', 9, true);

-- 3. Insert Menu Items (Exact Items & Updated Prices from Menu Card Photos)
INSERT INTO menu_items (id, category_id, name, description, price, image_url, is_veg, spice_level, preparation_time, is_available, is_bestseller, is_featured, rating) VALUES

-- 1. Beverages / चहा
(1, 1, 'Chaha', 'Traditional hot spiced Indian tea', 10.00, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '5 mins', TRUE, TRUE, TRUE, 4.8),
(2, 1, 'Black Tea', 'Strong aromatic black tea', 15.00, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '5 mins', TRUE, FALSE, FALSE, 4.5),
(3, 1, 'Coffee', 'Authentic South Indian hot coffee', 25.00, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '5 mins', TRUE, TRUE, TRUE, 4.9),
(4, 1, 'Milk', 'Fresh hot milk', 20.00, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '5 mins', TRUE, FALSE, FALSE, 4.4),

-- 2. Special Dosa / स्पेशल डोसा
(5, 3, 'Special Dosa', 'Signature South Indian crispy Special Dosa', 60.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', TRUE, 'medium', '12 mins', TRUE, TRUE, TRUE, 4.8),
(6, 3, 'Ghee Namma South Special Dosa', 'Grand special dosa loaded with pure A2 Ghee & South Indian herbs', 125.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'medium', '15 mins', TRUE, TRUE, TRUE, 4.9),
(7, 3, 'Ghee Podi Masala Dosa', 'Crispy Dosa layered with pure Ghee, spicy gun-powder podi & potato masala', 115.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', TRUE, 'spicy', '12 mins', TRUE, TRUE, TRUE, 4.8),
(8, 3, 'Ghee Mysore Masala Dosa', 'Rich Ghee roasted Dosa smeared with red garlic chutney & potato filling', 115.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'spicy', '12 mins', TRUE, TRUE, FALSE, 4.8),
(9, 3, 'Ghee Garlic Masala Dosa', 'Fragrant roasted Ghee & Garlic paste stuffed Masala Dosa', 115.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', TRUE, 'medium', '12 mins', TRUE, FALSE, FALSE, 4.6),
(10, 3, 'Ghee Pudina Masala Dosa', 'Fresh mint (pudina) chutney spread Dosa roasted in pure Ghee', 115.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'medium', '12 mins', TRUE, FALSE, FALSE, 4.6),
(11, 3, 'Loni Sponge Dosa 2 Pcs', 'Soft fluffy sponge dosas smeared with homemade white butter (Loni)', 50.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '10 mins', TRUE, TRUE, TRUE, 4.9),
(12, 3, 'Loni Sponge Dosa 3 Pcs', 'Triple set of soft butter sponge dosas', 70.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '10 mins', TRUE, TRUE, FALSE, 4.8),

-- 3. Dosa / डोसा
(13, 2, 'Plain Dosa', 'Golden crisp plain fermented crepe served with chutneys & sambar', 60.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '10 mins', TRUE, FALSE, TRUE, 4.6),
(14, 2, 'Masala Dosa', 'Classic crispy Dosa stuffed with spiced potato masala', 70.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', TRUE, 'medium', '12 mins', TRUE, TRUE, TRUE, 4.8),
(15, 2, 'Cheese Masala Dosa', 'Potato masala dosa topped with melted Amul cheese', 90.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '12 mins', TRUE, TRUE, FALSE, 4.7),
(16, 2, 'Mysore Masala Dosa', 'Red chili paste spread dosa loaded with spiced potato filling', 85.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'spicy', '12 mins', TRUE, TRUE, TRUE, 4.7),
(17, 2, 'Garlic Masala Dosa', 'Garlic spiced spicy potato masala dosa', 85.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', TRUE, 'spicy', '12 mins', TRUE, FALSE, FALSE, 4.5),
(18, 2, 'Pudina Masala Dosa', 'Refreshing mint herb paste spread masala dosa', 80.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', TRUE, 'medium', '12 mins', TRUE, FALSE, FALSE, 4.5),
(19, 2, 'Palak Masala Dosa', 'Nutritious green spinach (Palak) paste layered masala dosa', 80.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '12 mins', TRUE, FALSE, FALSE, 4.6),
(20, 2, 'Cut Masala Dosa', 'Crispy dosa sliced into bite-sized roll cuts with potato masala', 85.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', TRUE, 'medium', '12 mins', TRUE, TRUE, FALSE, 4.7),
(21, 2, 'Schezwan Masala Dosa', 'Indo-Chinese Schezwan sauce spiced masala dosa', 95.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'spicy', '12 mins', TRUE, TRUE, FALSE, 4.6),
(22, 2, 'Butter Podi Masala Dosa', 'Pure Amul butter & South Indian podi powder spiced dosa', 95.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', TRUE, 'medium', '12 mins', TRUE, TRUE, TRUE, 4.8),
(23, 2, 'Open Dosa', 'Open face crispy dosa served with potato bhaji & butter top', 80.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'medium', '12 mins', TRUE, FALSE, FALSE, 4.5),
(24, 2, 'Paper Plain Dosa', 'Extra long, paper-thin ultra-crispy plain dosa', 110.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '15 mins', TRUE, TRUE, TRUE, 4.8),
(25, 2, 'Paper Masala Dosa', 'Giant paper-thin crispy dosa served with spiced potato masala', 130.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', TRUE, 'medium', '15 mins', TRUE, TRUE, TRUE, 4.9),
(26, 2, 'Pizza Dosa', 'Fusion Dosa loaded with cheese, capsicum, corn, tomatoes & pizza herbs', 130.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '15 mins', TRUE, TRUE, TRUE, 4.9),

-- 4. Uttapam / उत्तापा
(27, 4, 'Plain Uttapam', 'Soft thick rice pancake served with sambar & chutney', 75.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '12 mins', TRUE, FALSE, FALSE, 4.4),
(28, 4, 'Onion Uttapam', 'Thick Uttapam topped with chopped onions & coriander', 85.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '12 mins', TRUE, TRUE, TRUE, 4.7),
(29, 4, 'Tomato Uttapam', 'Juicy fresh tomato slice topped soft Uttapam', 85.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '12 mins', TRUE, FALSE, FALSE, 4.5),
(30, 4, 'Onion Tomato Uttapam', 'Classic onion & tomato combination topped Uttapam', 90.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '12 mins', TRUE, TRUE, TRUE, 4.8),
(31, 4, 'Mysore Uttapam', 'Red garlic spicy chutney spread Uttapam', 95.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'spicy', '12 mins', TRUE, FALSE, FALSE, 4.6),
(32, 4, 'Garlic Uttapam', 'Roasted garlic & herb topped Uttapam', 85.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'medium', '12 mins', TRUE, FALSE, FALSE, 4.5),
(33, 4, 'Masala Uttapam', 'Uttapam topped with potato bhaji & spices', 85.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'medium', '12 mins', TRUE, FALSE, FALSE, 4.6),
(34, 4, 'Schezwan Uttapam', 'Spicy Schezwan sauce layered Uttapam', 95.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'spicy', '12 mins', TRUE, FALSE, FALSE, 4.5),
(35, 4, 'Cheese Onion Uttapam', 'Onion Uttapam loaded with melted cheese', 95.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '12 mins', TRUE, TRUE, FALSE, 4.7),
(36, 4, 'Cheese Chilli Uttapam', 'Spicy green chillies & melted cheese Uttapam', 95.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'spicy', '12 mins', TRUE, FALSE, FALSE, 4.6),
(37, 4, 'Cheese Masala Uttapam', 'Potato masala & cheese topped savory Uttapam', 100.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'medium', '15 mins', TRUE, TRUE, TRUE, 4.8),
(38, 4, 'Cheese Corn Uttapam', 'Sweet corn & melted cheese Uttapam', 100.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '15 mins', TRUE, TRUE, FALSE, 4.8),

-- 5. Sheera / शिरा
(39, 7, 'Pineapple Sheera', 'Sweet semolina dessert cooked with fresh pineapple pieces, cashews & Ghee', 60.00, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '8 mins', TRUE, TRUE, TRUE, 4.9),

-- 6. Vada / वडा
(40, 6, 'Medu Vada 2 Pcs', 'Crispy golden fried lentil donuts served with coconut chutney & sambar', 60.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80', TRUE, 'medium', '8 mins', TRUE, TRUE, TRUE, 4.8),
(41, 6, 'Idli Medu Vada Combo 2 Pcs', 'Combo of 1 steamed Idli and 1 Medu Vada served with hot sambar', 40.00, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '5 mins', TRUE, TRUE, TRUE, 4.9),

-- 7. Idli / इटली
(42, 5, 'Idli 1 Pc', 'Single soft steamed rice idli with sambar & chutney', 15.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '5 mins', TRUE, TRUE, FALSE, 4.7),
(43, 5, 'Masala Idli', 'Tossed idli pieces tempered with podi masala, curry leaves & ghee', 80.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'medium', '8 mins', TRUE, TRUE, TRUE, 4.8),
(44, 5, 'Thatte Idli', 'Traditional large plate-sized flat Karnataka soft Thatte Idli', 70.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '8 mins', TRUE, TRUE, TRUE, 4.9),
(45, 5, 'Button Idli', 'Mini bite-sized idlis dipped in hot sambar bowl', 60.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '8 mins', TRUE, TRUE, FALSE, 4.7),

-- 8. Rice / राईस
(46, 8, 'Masala Rice', 'Spiced South Indian rice tempered with mustard, chillies & spices', 90.00, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80', TRUE, 'medium', '10 mins', TRUE, TRUE, FALSE, 4.6),
(47, 8, 'Curd Rice', 'Soothing rice mixed with fresh curd, mustard & pomegranate', 90.00, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '8 mins', TRUE, TRUE, TRUE, 4.9),
(48, 8, 'Lemon Rice', 'Tangy steamed rice tempered with lemon juice, peanuts & curry leaves', 85.00, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '10 mins', TRUE, TRUE, FALSE, 4.7),

-- 9. Extras / एक्स्ट्रा
(49, 9, 'Extra Cheese', 'Add-on extra shredded Amul Cheese', 25.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '2 mins', TRUE, FALSE, FALSE, 4.5),
(50, 9, 'Extra Butter', 'Add-on extra dollop of Amul Butter', 15.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', TRUE, 'mild', '2 mins', TRUE, FALSE, FALSE, 4.5),
(51, 9, 'Extra Masala', 'Add-on extra spiced potato masala filling bowl', 20.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', TRUE, 'medium', '2 mins', TRUE, FALSE, FALSE, 4.5);

SELECT setval('menu_items_id_seq', 51, true);

-- 4. Insert Offers
INSERT INTO offers (id, title, description, code, discount_percentage, discount_amount, min_order_amount, image_url, start_date, end_date, is_active) VALUES
(1, 'Buy 5 Masala Dosa & Get 1 Plain Dosa Free!', 'Order 5 Masala Dosa and get 1 Plain Dosa (Worth ₹60) absolutely FREE!', 'FREEPLAIN1', 0.00, 60.00, 350.00, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80', '2026-01-01', '2026-12-31', TRUE);

SELECT setval('offers_id_seq', 1, true);

-- 5. Insert Coupons
INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, start_date, expiry_date, is_active) VALUES
(1, 'SOUTH10', 'Enjoy 10% instant discount on your order', 'percentage', 10.00, 150.00, 50.00, '2026-01-01', '2026-12-31', TRUE),
(2, 'SOUTH20', 'Flat 20% discount on order above ₹300', 'percentage', 20.00, 300.00, 100.00, '2026-01-01', '2026-12-31', TRUE),
(3, 'WELCOME50', 'Flat ₹50 OFF on your first food order', 'fixed', 50.00, 200.00, 50.00, '2026-01-01', '2026-12-31', TRUE);

SELECT setval('coupons_id_seq', 3, true);

-- 6. Insert Initial Reviews
INSERT INTO reviews (customer_name, rating, comment, is_approved) VALUES
('Ramesh Kumar', 5, 'The Ghee Namma South Special Dosa and Loni Sponge Dosa are amazing! Freshly prepared and super delicious.', TRUE),
('Ananya S', 5, 'Pineapple Sheera and Thatte Idli are incredible! Authentic South Indian taste.', TRUE),
('Venkatesh Rao', 5, 'Paper Masala Dosa and Filter Coffee combo is top quality. Highly recommended!', TRUE);

-- 7. Insert Default Restaurant Settings
INSERT INTO restaurant_settings (key, value) VALUES
('restaurant_name', 'Dakshin Bhavan South Indian Restaurant'),
('tagline', 'Authentic South Indian Food, Delivered Fresh'),
('address', '108 Indiranagar 100 Feet Road, Bengaluru, Karnataka 560038'),
('phone', '+91 98765 43210'),
('email', 'info@dakshinbhavan.com'),
('tax_rate_percent', '5.0'),
('packing_charge', '15.0'),
('delivery_charge', '30.0'),
('free_delivery_threshold', '250.0'),
('opening_hours', '7:00 AM - 11:00 PM Daily'),
('upi_id', 'Pos.11424716@indus');
