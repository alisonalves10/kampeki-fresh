-- Create audit_logs table for tracking important system actions
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Only admins can insert audit logs (or via service role)
CREATE POLICY "Only admins can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create global_settings table for platform-wide configurations
CREATE TABLE public.global_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can view global settings
CREATE POLICY "Anyone can view global settings"
ON public.global_settings
FOR SELECT
USING (true);

-- Only admins can manage global settings
CREATE POLICY "Only admins can manage global settings"
ON public.global_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_global_settings_updated_at
BEFORE UPDATE ON public.global_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default global settings
INSERT INTO public.global_settings (key, value, description) VALUES
('platform_name', '"Pede.AI"', 'Nome da plataforma'),
('platform_fee_percentage', '5', 'Taxa percentual cobrada dos restaurantes'),
('min_order_value', '20', 'Valor mínimo de pedido padrão'),
('points_per_real', '1', 'Pontos ganhos por real gasto'),
('points_value', '0.01', 'Valor em reais de cada ponto'),
('maintenance_mode', 'false', 'Modo de manutenção ativo');