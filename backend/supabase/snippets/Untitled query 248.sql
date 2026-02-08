select
  *
from
  auth.user;

update auth.users
set raw_app_meta_data = jsonb_set(
  raw_app_meta_data,
  '{role}',
  '"admin"',
  true
);
where id = '4d55a868-0cdf-4134-8fe8-ea537a1a8571';

select * from profiles;

select * from products;

select * from carts;



SELECT
  conname,
  contype,
  pg_get_constraintdef(c.oid) AS definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'carts';