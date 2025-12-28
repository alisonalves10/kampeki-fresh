-- 1. Tabela tenant_branding (white-label completo)
CREATE TABLE public.tenant_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL UNIQUE,
  primary_color TEXT DEFAULT '#FBBF24',
  secondary_color TEXT DEFAULT '#F97316',
  background_color TEXT DEFAULT '#0a0a0a',
  text_color TEXT DEFAULT '#fafafa',
  header_image_url TEXT,
  header_title TEXT,
  header_subtitle TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  subdomain TEXT UNIQUE,
  subdomain_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. RLS Policies para tenant_branding
ALTER TABLE public.tenant_branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view branding" ON public.tenant_branding
FOR SELECT USING (true);

CREATE POLICY "Owners can manage their branding" ON public.tenant_branding
FOR ALL USING (
  restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = auth.uid())
);

CREATE POLICY "Admins can manage all branding" ON public.tenant_branding
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Adicionar restaurant_id às tabelas existentes (se não existir)
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ;
ALTER TABLE public.addon_groups ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- 4. Trigger para updated_at em tenant_branding
CREATE TRIGGER update_tenant_branding_updated_at
BEFORE UPDATE ON public.tenant_branding
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();