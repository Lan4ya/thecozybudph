SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

drop extension if exists "pg_net";


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."cleanup_orphaned_categories"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Delete categories that have no products referencing them
  DELETE FROM product_categories c
  WHERE NOT EXISTS (
    SELECT 1 FROM products m
    WHERE m.product_category_id = c.id
  );

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."cleanup_orphaned_categories"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_orphaned_collections"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Delete categories that have no products referencing them
  DELETE FROM product_categories c
  WHERE NOT EXISTS (
    SELECT 1 FROM products m
    WHERE m.product_category_id = c.id
  );

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."cleanup_orphaned_collections"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO carts(profile_id)
  VALUES (NEW.id)
  ON CONFLICT (profile_id) DO NOTHING;

  return NEW;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_cart_item"("p_cart_id" "uuid", "p_product_id" "uuid", "p_quantity" integer, "p_product_variant" "jsonb", "p_card_messages" character varying[] DEFAULT '{}'::character varying[]) RETURNS TABLE("product_id" "uuid", "quantity" integer, "product_variant" "jsonb", "card_messages" character varying[])
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_existing_quantity int;
  v_existing_messages varchar(600)[];
  v_new_quantity int;
  v_new_messages varchar(600)[];
BEGIN


  -- Fetch existing row with lock
  SELECT ci.quantity, ci.card_messages
  INTO v_existing_quantity, v_existing_messages
  FROM cart_items AS ci
  WHERE ci.cart_id = p_cart_id
    AND ci.product_id = p_product_id
    AND ci.product_variant = p_product_variant
  FOR UPDATE;

  IF FOUND THEN
    -- Merge quantities
    v_new_quantity := v_existing_quantity + p_quantity;

    -- Merge messages safely
    v_new_messages := COALESCE(v_existing_messages, '{}') || COALESCE(p_card_messages, '{}');

    -- Validate merged state
    IF array_length(v_new_messages, 1) > v_new_quantity THEN
      RAISE EXCEPTION
        'Total messages (%) exceed total quantity (%) after merge',
        array_length(v_new_messages, 1),
        v_new_quantity;
    END IF;

    -- Update row
    UPDATE cart_items AS ci
    SET quantity = v_new_quantity,
        card_messages = v_new_messages
    WHERE ci.cart_id = p_cart_id
      AND ci.product_id = p_product_id
      AND ci.product_variant = p_product_variant;

  ELSE
    -- Insert new row
    INSERT INTO cart_items (
      cart_id,
      product_id,
      quantity,
      product_variant,
      card_messages
    )
    VALUES (
      p_cart_id,
      p_product_id,
      p_quantity,
      p_product_variant,
      COALESCE(p_card_messages, '{}')
    );
  END IF;

  -- Return final row
  RETURN QUERY
  SELECT
    ci.product_id,
    ci.quantity,
    ci.product_variant,
    ci.card_messages
  FROM cart_items AS ci
  WHERE ci.cart_id = p_cart_id
    AND ci.product_id = p_product_id
    AND ci.product_variant = p_product_variant;

END;
$$;


ALTER FUNCTION "public"."upsert_cart_item"("p_cart_id" "uuid", "p_product_id" "uuid", "p_quantity" integer, "p_product_variant" "jsonb", "p_card_messages" character varying[]) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


ALTER TABLE "public"."addresses" OWNER TO "postgres";
ALTER TABLE "public"."carts" OWNER TO "postgres";
ALTER TABLE "public"."order_items" OWNER TO "postgres";
ALTER TABLE "public"."orders" OWNER TO "postgres";
ALTER TABLE "public"."payments" OWNER TO "postgres";
ALTER TABLE "public"."product_categories" OWNER TO "postgres";
ALTER TABLE "public"."product_collections" OWNER TO "postgres";
ALTER TABLE "public"."products" OWNER TO "postgres";
ALTER TABLE "public"."profiles" OWNER TO "postgres";
ALTER TABLE "public"."webhook_events" OWNER TO "postgres";




CREATE OR REPLACE TRIGGER "trigger_cleanup_categories" AFTER DELETE OR UPDATE ON "public"."products" FOR EACH STATEMENT EXECUTE FUNCTION "public"."cleanup_orphaned_categories"();



CREATE OR REPLACE TRIGGER "trigger_cleanup_collections" AFTER DELETE OR UPDATE ON "public"."products" FOR EACH STATEMENT EXECUTE FUNCTION "public"."cleanup_orphaned_collections"();



CREATE OR REPLACE TRIGGER "update_products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "on_auth_user_created" AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();




ALTER TABLE "public"."addresses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "allow public read" ON "public"."product_categories" FOR SELECT USING (true);



CREATE POLICY "allow public read" ON "public"."product_collections" FOR SELECT USING (true);



CREATE POLICY "allow public read" ON "public"."products" FOR SELECT USING (true);


CREATE POLICY "allow public read access 1doady1_0" on "storage"."objects" as permissive for select to public using ((bucket_id = 'events'::text));


CREATE POLICY "allow public read 1ifhysk_0" on "storage"."objects" as permissive for select to public using ((bucket_id = 'products'::text));





ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."carts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_collections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users can delete own cart_items" ON "public"."cart_items" FOR DELETE USING (("cart_id" IN ( SELECT "carts"."id"
   FROM "public"."carts"
  WHERE ("carts"."profile_id" = "auth"."uid"()))));



CREATE POLICY "users can insert cart_items" ON "public"."cart_items" FOR INSERT WITH CHECK (("cart_id" IN ( SELECT "carts"."id"
   FROM "public"."carts"
  WHERE ("carts"."profile_id" = "auth"."uid"()))));



CREATE POLICY "users can select own cart_items" ON "public"."cart_items" FOR SELECT USING (("cart_id" IN ( SELECT "carts"."id"
   FROM "public"."carts"
  WHERE ("carts"."profile_id" = "auth"."uid"()))));



CREATE POLICY "users can select own carts" ON "public"."carts" FOR SELECT USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "users can select own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "users can update own cart_items" ON "public"."cart_items" FOR UPDATE USING (("cart_id" IN ( SELECT "carts"."id"
   FROM "public"."carts"
  WHERE ("carts"."profile_id" = "auth"."uid"())))) WITH CHECK (("cart_id" IN ( SELECT "carts"."id"
   FROM "public"."carts"
  WHERE ("carts"."profile_id" = "auth"."uid"()))));



CREATE POLICY "users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



ALTER TABLE "public"."webhook_events" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_orphaned_categories"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_orphaned_categories"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_orphaned_categories"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_orphaned_collections"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_orphaned_collections"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_orphaned_collections"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_cart_item"("p_cart_id" "uuid", "p_product_id" "uuid", "p_quantity" integer, "p_product_variant" "jsonb", "p_card_messages" character varying[]) TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_cart_item"("p_cart_id" "uuid", "p_product_id" "uuid", "p_quantity" integer, "p_product_variant" "jsonb", "p_card_messages" character varying[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_cart_item"("p_cart_id" "uuid", "p_product_id" "uuid", "p_quantity" integer, "p_product_variant" "jsonb", "p_card_messages" character varying[]) TO "service_role";



GRANT ALL ON TABLE "public"."addresses" TO "anon";
GRANT ALL ON TABLE "public"."addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."addresses" TO "service_role";



GRANT ALL ON TABLE "public"."cart_items" TO "anon";
GRANT ALL ON TABLE "public"."cart_items" TO "authenticated";
GRANT ALL ON TABLE "public"."cart_items" TO "service_role";



GRANT ALL ON TABLE "public"."carts" TO "anon";
GRANT ALL ON TABLE "public"."carts" TO "authenticated";
GRANT ALL ON TABLE "public"."carts" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."product_categories" TO "anon";
GRANT ALL ON TABLE "public"."product_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."product_categories" TO "service_role";



GRANT ALL ON TABLE "public"."product_collections" TO "anon";
GRANT ALL ON TABLE "public"."product_collections" TO "authenticated";
GRANT ALL ON TABLE "public"."product_collections" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."webhook_events" TO "anon";
GRANT ALL ON TABLE "public"."webhook_events" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_events" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
