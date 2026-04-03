truncate table profiles cascade;

truncate table addresses;

select * from addresses;

select * from addresses where profile_id = 'b4899edf-5366-4a7e-9215-7e018ce1a97c';

select * from products;

select * from profiles;

g
select * from profiles where id = 'b008db3d-1d00-440c-b8b2-20815a106bf0';

delete from addresses where profile_id = 'b008db3d-1d00-440c-b8b2-20815a106bf0';
 
select * from auth.users;
select id, email
from auth.users
where id = ;

INSERT INTO addresses (profile_id, full_name, region, city, province, postal_code, barangay, address_line, phone_number)
VALUES ('b4899edf-5366-4a7e-9215-7e018ce1a97c', 'Test', 'NCR', 'Quezon City', 'Metro Manila', '1100', 'Barangay Central', '123 Main St', '+639171234567');

CREATE USER rls_client
WITH
   LOGIN PASSWORD 'TheCozyBud2025DB';
GRANT anon TO rls_client;
GRANT authenticated TO rls_client;


select * from categories where 

select * from product_variants where product_id = '1d42b365-3349-41a6-a26c-aabff93a2707';

L