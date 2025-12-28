CREATE POLICY "users can select own carts"
ON public.carts
FOR SELECT
USING (profile_id = auth.uid());

CREATE POLICY "users can insert carts"
ON public.carts
FOR INSERT
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "users can update own carts"
ON public.carts
FOR UPDATE
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());




CREATE POLICY "users can select own cart_items"
ON public.cart_items
FOR SELECT
USING (cart_id IN (SELECT id FROM public.carts WHERE profile_id = auth.uid()));

CREATE POLICY "users can insert cart_items"
ON public.cart_items
FOR INSERT
WITH CHECK (cart_id IN (SELECT id FROM public.carts WHERE profile_id = auth.uid()));

CREATE POLICY "users can update own cart_items"
ON public.cart_items
FOR UPDATE
USING (cart_id IN (SELECT id FROM public.carts WHERE profile_id = auth.uid()))
WITH CHECK (cart_id IN (SELECT id FROM public.carts WHERE profile_id = auth.uid()));

CREATE POLICY "users can delete own cart_items"
ON public.cart_items
FOR DELETE
USING (cart_id IN (SELECT id FROM public.carts WHERE profile_id = auth.uid()));
