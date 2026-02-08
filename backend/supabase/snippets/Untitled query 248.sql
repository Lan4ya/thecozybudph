select
  *
from
  auth.user;


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