-- Create categories table
CREATE TABLE public.categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '🍣',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories are viewable by everyone
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

-- Admins and lojistas can manage categories
CREATE POLICY "Admins and lojistas can manage categories" 
ON public.categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'lojista'::app_role));

-- Create addon_groups table
CREATE TABLE public.addon_groups (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    min_selections INTEGER DEFAULT 0,
    max_selections INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on addon_groups
ALTER TABLE public.addon_groups ENABLE ROW LEVEL SECURITY;

-- Addon groups are viewable by everyone
CREATE POLICY "Addon groups are viewable by everyone" 
ON public.addon_groups 
FOR SELECT 
USING (true);

-- Admins and lojistas can manage addon groups
CREATE POLICY "Admins and lojistas can manage addon groups" 
ON public.addon_groups 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'lojista'::app_role));

-- Create addon_options table
CREATE TABLE public.addon_options (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.addon_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    additional_price NUMERIC DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on addon_options
ALTER TABLE public.addon_options ENABLE ROW LEVEL SECURITY;

-- Addon options are viewable by everyone
CREATE POLICY "Addon options are viewable by everyone" 
ON public.addon_options 
FOR SELECT 
USING (true);

-- Admins and lojistas can manage addon options
CREATE POLICY "Admins and lojistas can manage addon options" 
ON public.addon_options 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'lojista'::app_role));

-- Create product_addon_groups junction table
CREATE TABLE public.product_addon_groups (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.db_products(id) ON DELETE CASCADE,
    addon_group_id UUID NOT NULL REFERENCES public.addon_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(product_id, addon_group_id)
);

-- Enable RLS on product_addon_groups
ALTER TABLE public.product_addon_groups ENABLE ROW LEVEL SECURITY;

-- Product addon groups are viewable by everyone
CREATE POLICY "Product addon groups are viewable by everyone" 
ON public.product_addon_groups 
FOR SELECT 
USING (true);

-- Admins and lojistas can manage product addon groups
CREATE POLICY "Admins and lojistas can manage product addon groups" 
ON public.product_addon_groups 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'lojista'::app_role));

-- Add category_id to db_products
ALTER TABLE public.db_products ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Create trigger for updated_at on new tables
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_addon_groups_updated_at
BEFORE UPDATE ON public.addon_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_addon_options_updated_at
BEFORE UPDATE ON public.addon_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();