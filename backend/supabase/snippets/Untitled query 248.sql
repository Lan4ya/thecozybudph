fselect
  *
from
  auth.user;

update auth.users
set raw_app_meta_data = jsonb_set(
  raw_app_meta_data,
  '{role}',
  '"admin"',
  true
)
where id = 'd576c508-07c3-4c4f-8d5c-0c68bc76e7a8';


select * from products;
