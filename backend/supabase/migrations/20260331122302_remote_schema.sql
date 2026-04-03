drop policy "users can select own profile" on "public"."profiles";

drop policy "users can update own profile" on "public"."profiles";


  create policy "users can select own profile"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using ((auth.uid() = id));



  create policy "users can update own profile"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((auth.uid() = id))
with check ((auth.uid() = id));



