fselect
  *
from
  auth.user;


;

truncate table product_collections cascade;
select * from products;

select * from carts;
SELECT relrowsecurity
FROM pg_class
WHERE relname = 'profiles';

SELECT * FROM profiles WHERE id = 'af3ce14c-a7db-466a-b6de-402562768f39';

select * from cart_items;

L
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


select * from product_options;


select * from product_variant_option_values;

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


select * from products;

update auth.users
set raw_app_meta_data = jsonb_set(
  raw_app_meta_data,
  '{role}',
  '"admin"',
  true
)
where id = 'd63ec195-6a98-4bf4-a5a1-9174d65d3c34'; -- profile.id of the user