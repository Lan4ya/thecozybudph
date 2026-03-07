select
  *
from
  auth.user;


SELECT event_object_table AS table_name, trigger_name, event_manipulation AS event_type, action_timing AS timing
FROM information_schema.triggers
ORDER BY table_name, trigger_name;


truncate table products cascade;

truncate table product_collections cascade;
gi
SELECT relrowsecurity
FROM pg_class
WHERE relname = 'profiles';

SELECT * FROM profiles WHERE id = 'af3ce14c-a7db-466a-b6de-402562768f39';
g


SELECT
  conname,
  contype,
  pg_get_constraintdef(c.oid) AS definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'carts';

SELECT
  conname,
  pg_get_constraintdef(c.oid) AS definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'cart_items'
  AND c.contype = 'c';

INSERT INTO profiles (id, email)
VALUES ('af3ce14c-a7db-466a-b6de-402562768f39', 'thecozybudph@gmail.com')
ON CONFLICT DO NOTHING;


select * from product_option_values;




select * from cart_items;

SELECT
    pv.id,
    pv.sku,
    pv.price_cents,
    jsonb_object_agg(po.name, pov.value) AS options
FROM product_variants pv
JOIN product_variant_option_values pvov
    ON pvov.variant_id = pv.id
JOIN product_option_values pov
    ON pov.id = pvov.option_value_id
JOIN product_options po
    ON po.id = pov.option_id
WHERE pv.product_id = 'e4e47f0c-c69e-5bcf-861d-9e7bcbf297ec'
GROUP BY pv.id;


select * from profiles;

SELECT event_object_table AS table_name, trigger_name, event_manipulation AS event, action_timing AS timing, action_statement AS definition
FROM information_schema.triggers
ORDER BY table_name, trigger_name;


select * from products;
select * from carts;
select * from profiles;

select * from carts
where profile_id = '4fd833ae-3f7b-4dca-9730-de7be9e18f2b';
