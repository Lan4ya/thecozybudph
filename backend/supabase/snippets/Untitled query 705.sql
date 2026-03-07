fgi
truncate table cart_items;

DROP TABLE IF EXISTS product_variants CASCADE;
 -- profile.id of the user

update auth.users
set raw_app_meta_data = jsonb_set(
  raw_app_meta_data,
  '{role}',
  '"admin"',
  true
)
where id = 'ae0fa835-25ff-4a72-9f1b-286c839bc6ce'; -- profile.id of the user


select * from profiles;
select * from products;

select * from auth.users;


SELECT id, email, raw_app_meta_data
FROM auth.users
WHERE raw_app_meta_data->>'role' = 'admin';


DELETE FROM auth.users
WHERE id = '76e6b921-d3f1-4282-969a-7df7f6d40e08';


