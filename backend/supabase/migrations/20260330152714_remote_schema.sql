drop policy "users can insert cart_items" on "public"."cart_items";

alter table "public"."order_items_snapshots" enable row level security;

  create policy "users can insert cart_items on own cart"
  on "public"."cart_items"
  as permissive
  for insert
  to authenticated
with check ((cart_id IN ( SELECT carts.id
   FROM public.carts
  WHERE (carts.profile_id = auth.uid()))));
