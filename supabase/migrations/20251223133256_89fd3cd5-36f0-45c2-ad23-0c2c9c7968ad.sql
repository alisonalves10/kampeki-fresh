-- Create store_settings table for store configuration
CREATE TABLE public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read store settings
CREATE POLICY "Store settings are viewable by everyone"
ON public.store_settings
FOR SELECT
USING (true);

-- Only admins and lojistas can manage store settings
CREATE POLICY "Admins and lojistas can manage store settings"
ON public.store_settings
FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'lojista'));

-- Create trigger for updated_at
CREATE TRIGGER update_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default store address
INSERT INTO public.store_settings (key, value) VALUES (
  'store_address',
  '{"street": "Rua das Palmeiras", "number": "123", "neighborhood": "Centro", "city": "São Paulo", "state": "SP", "formatted": "Rua das Palmeiras, 123 - Centro, São Paulo/SP"}'::jsonb
);