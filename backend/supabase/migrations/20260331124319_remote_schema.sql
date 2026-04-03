drop policy "users can delete own cart_items" on "public"."cart_items";

drop policy "users can select own cart_items" on "public"."cart_items";

drop policy "users can update own cart_items" on "public"."cart_items";

drop policy "users can select own carts" on "public"."carts";


  create policy "users can delete own cart_items"
  on "public"."cart_items"
  as permissive
  for delete
  to authenticated
using ((cart_id IN ( SELECT carts.id
   FROM public.carts
  WHERE (carts.profile_id = auth.uid()))));



  create policy "users can select own cart_items"
  on "public"."cart_items"
  as permissive
  for select
  to authenticated
using ((cart_id IN ( SELECT carts.id
   FROM public.carts
  WHERE (carts.profile_id = auth.uid()))));



  create policy "users can update own cart_items"
  on "public"."cart_items"
  as permissive
  for update
  to authenticated
using ((cart_id IN ( SELECT carts.id
   FROM public.carts
  WHERE (carts.profile_id = auth.uid()))))
with check ((cart_id IN ( SELECT carts.id
   FROM public.carts
  WHERE (carts.profile_id = auth.uid()))));



  create policy "users can select own carts"
  on "public"."carts"
  as permissive
  for select
  to authenticated
using ((profile_id = auth.uid()));



