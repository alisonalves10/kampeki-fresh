-- =============================================
-- FASE 2: Schema do Marketplace Delivery2U
-- =============================================

-- 1. Tabela LEADS (Captura de leads B2B - sem autenticação)
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  city TEXT NOT NULL,
  orders_per_day TEXT,
  status TEXT NOT NULL DEFAULT 'novo',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS: Qualquer pessoa pode inserir leads (formulário público)
CREATE POLICY "Anyone can insert leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- RLS: Apenas admins podem visualizar leads
CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- RLS: Apenas admins podem atualizar leads
CREATE POLICY "Admins can update leads"
ON public.leads
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- RLS: Apenas admins podem deletar leads
CREATE POLICY "Admins can delete leads"
ON public.leads
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Trigger para updated_at
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 2. Tabela RESTAURANTS (Lojas cadastradas)
-- =============================================

CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'SP',
  phone TEXT,
  whatsapp TEXT,
  is_active BOOLEAN DEFAULT false,
  is_open BOOLEAN DEFAULT true,
  opening_hours JSONB,
  delivery_enabled BOOLEAN DEFAULT true,
  pickup_enabled BOOLEAN DEFAULT true,
  min_order_value NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- RLS: Qualquer pessoa pode ver restaurantes ativos
CREATE POLICY "Anyone can view active restaurants"
ON public.restaurants
FOR SELECT
USING (is_active = true);

-- RLS: Lojistas podem ver seus próprios restaurantes
CREATE POLICY "Owners can view their restaurants"
ON public.restaurants
FOR SELECT
USING (auth.uid() = owner_id);

-- RLS: Admins podem ver todos
CREATE POLICY "Admins can view all restaurants"
ON public.restaurants
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- RLS: Lojistas podem inserir seus restaurantes
CREATE POLICY "Owners can insert their restaurants"
ON public.restaurants
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- RLS: Lojistas podem atualizar seus restaurantes
CREATE POLICY "Owners can update their restaurants"
ON public.restaurants
FOR UPDATE
USING (auth.uid() = owner_id);

-- RLS: Admins podem gerenciar todos
CREATE POLICY "Admins can manage all restaurants"
ON public.restaurants
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Trigger para updated_at
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index para slug (buscas frequentes)
CREATE INDEX idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX idx_restaurants_city ON public.restaurants(city);

-- =============================================
-- 3. Tabela DELIVERY_RULES (Regras de frete)
-- =============================================

CREATE TABLE public.delivery_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  km_start NUMERIC NOT NULL,
  km_end NUMERIC NOT NULL,
  fee NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_rules ENABLE ROW LEVEL SECURITY;

-- RLS: Qualquer pessoa pode ver regras de frete ativas
CREATE POLICY "Anyone can view active delivery rules"
ON public.delivery_rules
FOR SELECT
USING (is_active = true);

-- RLS: Lojistas podem gerenciar regras do próprio restaurante
CREATE POLICY "Owners can manage their delivery rules"
ON public.delivery_rules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE restaurants.id = delivery_rules.restaurant_id
    AND restaurants.owner_id = auth.uid()
  )
);

-- RLS: Admins podem gerenciar todas
CREATE POLICY "Admins can manage all delivery rules"
ON public.delivery_rules
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Index para restaurant_id
CREATE INDEX idx_delivery_rules_restaurant ON public.delivery_rules(restaurant_id);