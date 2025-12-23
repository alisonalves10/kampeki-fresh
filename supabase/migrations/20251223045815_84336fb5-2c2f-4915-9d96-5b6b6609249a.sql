-- Update RLS policies for db_products to include lojista
DROP POLICY IF EXISTS "Admins can manage products" ON public.db_products;
CREATE POLICY "Admins and lojistas can manage products"
ON public.db_products FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'lojista'));

-- Update RLS policies for coupons to include lojista
DROP POLICY IF EXISTS "Admins can do everything with coupons" ON public.coupons;
CREATE POLICY "Admins and lojistas can manage coupons"
ON public.coupons FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'lojista'));

-- Update RLS policies for orders to include lojista (view and update)
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

CREATE POLICY "Admins and lojistas can view all orders"
ON public.orders FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'lojista'));

CREATE POLICY "Admins and lojistas can update all orders"
ON public.orders FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'lojista'));

-- Add policy for lojistas/admins to view order_items
CREATE POLICY "Admins and lojistas can view all order items"
ON public.order_items FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'lojista'));