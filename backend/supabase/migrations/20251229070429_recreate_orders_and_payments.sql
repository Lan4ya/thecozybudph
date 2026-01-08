-- I decided to reset these tables, instead of altering them to avoid fragmented code and messy alter sprinkles.

drop table payments;

drop table order_items;

drop table orders;

drop table guest_customers; -- dropped this completely. not needed




CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  profile_id uuid NULL REFERENCES profiles(id), -- null means not signed up yet, since we allow no signup orders 
  status text NOT NULL DEFAULT 'pending',

  subtotal_cents integer NOT NULL CHECK (subtotal_cents >= 0),
  shipping_cents integer NOT NULL DEFAULT 0,
  tax_cents integer NOT NULL DEFAULT 0,
  discount_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL CHECK (total_cents > 0),
  
  -- Customer Info
  customer_first_name text NOT NULL,
  customer_last_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address jsonb,
  billing_address jsonb,

  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT orders_status_check CHECK (
    status IN ('pending', 'awaiting_payment', 'paid', 'failed', 'cancelled', 'refunded')
  )
  
);





CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  product_id uuid,
  name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  subtotal_cents integer NOT NULL CHECK (subtotal_cents >= 0),
  
  created_at timestamptz DEFAULT now()
);





CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  payment_intent_id text NOT NULL,       -- PayMongo payment intent
  payment_id text,                       -- Actual payment transaction id
  
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  currency text NOT NULL DEFAULT 'PHP',
  
  status text NOT NULL CHECK (
    status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')
  ),
  method text,                          -- e.g. gcash, BPI, etc. TODO: add constraints later for supported payment methods.
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
