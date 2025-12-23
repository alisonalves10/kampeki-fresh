-- Create table for products included in combos/bundles
CREATE TABLE public.product_included_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.db_products(id) ON DELETE CASCADE,
  included_product_id UUID NOT NULL REFERENCES public.db_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT different_products CHECK (product_id != included_product_id)
);

-- Enable Row Level Security
ALTER TABLE public.product_included_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Product included items are viewable by everyone" 
ON public.product_included_items 
FOR SELECT 
USING (true);

-- Create policies for admin/lojista management
CREATE POLICY "Admins and lojistas can manage product included items" 
ON public.product_included_items 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'lojista'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_product_included_items_product_id ON public.product_included_items(product_id);
CREATE INDEX idx_product_included_items_included_product_id ON public.product_included_items(included_product_id);