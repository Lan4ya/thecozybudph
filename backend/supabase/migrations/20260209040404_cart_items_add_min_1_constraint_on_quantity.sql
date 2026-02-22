ALTER TABLE cart_items
ADD CONSTRAINT cart_items_quantity_min_1
CHECK (quantity >= 1);
