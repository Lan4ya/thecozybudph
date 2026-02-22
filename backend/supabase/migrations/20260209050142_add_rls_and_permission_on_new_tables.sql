GRANT SELECT, UPDATE, INSERT ON TABLE public.profiles TO authenticated;
GRANT SELECT, UPDATE, INSERT ON TABLE public.addresses TO authenticated;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE public.cart_items TO authenticated;



drop policy "users can insert carts" on "public"."carts";
drop policy "users can update own carts" on "public"."carts";



ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
