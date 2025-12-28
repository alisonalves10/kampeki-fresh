import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, Eye, Upload, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TenantBranding {
  id?: string;
  restaurant_id: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  header_image_url: string | null;
  header_title: string | null;
  header_subtitle: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  subdomain: string | null;
  subdomain_enabled: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

const defaultBranding: Omit<TenantBranding, 'restaurant_id'> = {
  primary_color: '#FBBF24',
  secondary_color: '#F97316',
  background_color: '#0a0a0a',
  text_color: '#fafafa',
  header_image_url: null,
  header_title: null,
  header_subtitle: null,
  logo_url: null,
  favicon_url: null,
  subdomain: null,
  subdomain_enabled: false,
};

export default function RestaurantBranding() {
  const { restaurant } = useOutletContext<{ restaurant: Restaurant | null }>();
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (restaurant?.id) {
      fetchBranding();
    }
  }, [restaurant?.id]);

  const fetchBranding = async () => {
    if (!restaurant?.id) return;

    const { data, error } = await supabase
      .from('tenant_branding')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .maybeSingle();

    if (!error && data) {
      setBranding(data);
    } else {
      setBranding({
        ...defaultBranding,
        restaurant_id: restaurant.id,
        header_title: restaurant.name,
      });
    }
    setLoading(false);
  };

  const validateSubdomain = (subdomain: string): boolean => {
    if (!subdomain) return true;
    const pattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    return pattern.test(subdomain.toLowerCase());
  };

  const checkSubdomainAvailability = async (subdomain: string): Promise<boolean> => {
    if (!subdomain) return true;
    
    const { data, error } = await supabase
      .from('tenant_branding')
      .select('id')
      .eq('subdomain', subdomain.toLowerCase())
      .neq('restaurant_id', restaurant?.id || '')
      .maybeSingle();

    return !data;
  };

  const handleSubdomainChange = async (value: string) => {
    const cleanValue = value.toLowerCase().trim();
    setBranding(prev => prev ? { ...prev, subdomain: cleanValue || null } : null);

    if (!cleanValue) {
      setSubdomainError(null);
      return;
    }

    if (!validateSubdomain(cleanValue)) {
      setSubdomainError('Use apenas letras minúsculas, números e hífen');
      return;
    }

    const isAvailable = await checkSubdomainAvailability(cleanValue);
    if (!isAvailable) {
      setSubdomainError('Este subdomínio já está em uso');
      return;
    }

    setSubdomainError(null);
  };

  const handleSave = async () => {
    if (!restaurant?.id || !branding) return;
    if (subdomainError) {
      toast({
        title: 'Erro',
        description: 'Corrija os erros antes de salvar',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const brandingData = {
        restaurant_id: restaurant.id,
        primary_color: branding.primary_color,
        secondary_color: branding.secondary_color,
        background_color: branding.background_color,
        text_color: branding.text_color,
        header_image_url: branding.header_image_url,
        header_title: branding.header_title,
        header_subtitle: branding.header_subtitle,
        logo_url: branding.logo_url,
        favicon_url: branding.favicon_url,
        subdomain: branding.subdomain?.toLowerCase() || null,
        subdomain_enabled: branding.subdomain_enabled,
      };

      if (branding.id) {
        const { error } = await supabase
          .from('tenant_branding')
          .update(brandingData)
          .eq('id', branding.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('tenant_branding')
          .insert(brandingData)
          .select()
          .single();

        if (error) throw error;
        setBranding(data);
      }

      toast({ title: 'Personalização salva com sucesso!' });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar as configurações',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (!restaurant) return;
    const previewUrl = `/r/${restaurant.slug}`;
    window.open(previewUrl, '_blank');
  };

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Nenhum restaurante encontrado</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Personalização</h1>
          <p className="text-muted-foreground">Configure a identidade visual do seu cardápio</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Visualizar Menu
          </Button>
          <Button onClick={handleSave} disabled={saving || !!subdomainError}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cores */}
        <Card>
          <CardHeader>
            <CardTitle>Cores</CardTitle>
            <CardDescription>Defina as cores do seu cardápio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Cor Primária</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="primary_color"
                    value={branding?.primary_color || '#FBBF24'}
                    onChange={(e) => setBranding(prev => prev ? { ...prev, primary_color: e.target.value } : null)}
                    className="h-10 w-14 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={branding?.primary_color || ''}
                    onChange={(e) => setBranding(prev => prev ? { ...prev, primary_color: e.target.value } : null)}
                    placeholder="#FBBF24"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_color">Cor Secundária</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="secondary_color"
                    value={branding?.secondary_color || '#F97316'}
                    onChange={(e) => setBranding(prev => prev ? { ...prev, secondary_color: e.target.value } : null)}
                    className="h-10 w-14 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={branding?.secondary_color || ''}
                    onChange={(e) => setBranding(prev => prev ? { ...prev, secondary_color: e.target.value } : null)}
                    placeholder="#F97316"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="background_color">Cor de Fundo</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="background_color"
                    value={branding?.background_color || '#0a0a0a'}
                    onChange={(e) => setBranding(prev => prev ? { ...prev, background_color: e.target.value } : null)}
                    className="h-10 w-14 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={branding?.background_color || ''}
                    onChange={(e) => setBranding(prev => prev ? { ...prev, background_color: e.target.value } : null)}
                    placeholder="#0a0a0a"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="text_color">Cor do Texto</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="text_color"
                    value={branding?.text_color || '#fafafa'}
                    onChange={(e) => setBranding(prev => prev ? { ...prev, text_color: e.target.value } : null)}
                    className="h-10 w-14 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={branding?.text_color || ''}
                    onChange={(e) => setBranding(prev => prev ? { ...prev, text_color: e.target.value } : null)}
                    placeholder="#fafafa"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle>Header</CardTitle>
            <CardDescription>Configure o cabeçalho do seu cardápio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="header_title">Título Principal</Label>
              <Input
                id="header_title"
                value={branding?.header_title || ''}
                onChange={(e) => setBranding(prev => prev ? { ...prev, header_title: e.target.value } : null)}
                placeholder="Nome do seu restaurante"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="header_subtitle">Subtítulo</Label>
              <Input
                id="header_subtitle"
                value={branding?.header_subtitle || ''}
                onChange={(e) => setBranding(prev => prev ? { ...prev, header_subtitle: e.target.value } : null)}
                placeholder="Slogan ou descrição curta"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="header_image_url">URL da Imagem do Header</Label>
              <Input
                id="header_image_url"
                value={branding?.header_image_url || ''}
                onChange={(e) => setBranding(prev => prev ? { ...prev, header_image_url: e.target.value || null } : null)}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo e Favicon */}
        <Card>
          <CardHeader>
            <CardTitle>Logo e Favicon</CardTitle>
            <CardDescription>Imagens da sua marca</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo_url">URL do Logo</Label>
              <Input
                id="logo_url"
                value={branding?.logo_url || ''}
                onChange={(e) => setBranding(prev => prev ? { ...prev, logo_url: e.target.value || null } : null)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="favicon_url">URL do Favicon</Label>
              <Input
                id="favicon_url"
                value={branding?.favicon_url || ''}
                onChange={(e) => setBranding(prev => prev ? { ...prev, favicon_url: e.target.value || null } : null)}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Subdomínio */}
        <Card>
          <CardHeader>
            <CardTitle>Subdomínio</CardTitle>
            <CardDescription>Configure seu endereço personalizado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomínio</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="subdomain"
                  value={branding?.subdomain || ''}
                  onChange={(e) => handleSubdomainChange(e.target.value)}
                  placeholder="seurestaurante"
                  className={subdomainError ? 'border-destructive' : ''}
                />
                <span className="text-muted-foreground whitespace-nowrap">.delivery2u.com.br</span>
              </div>
              {subdomainError && (
                <p className="text-sm text-destructive">{subdomainError}</p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="subdomain_enabled">Ativar Subdomínio</Label>
                <p className="text-sm text-muted-foreground">
                  Permite acessar seu menu via subdomínio personalizado
                </p>
              </div>
              <Switch
                id="subdomain_enabled"
                checked={branding?.subdomain_enabled || false}
                onCheckedChange={(checked) => setBranding(prev => prev ? { ...prev, subdomain_enabled: checked } : null)}
                disabled={!branding?.subdomain}
              />
            </div>
            {branding?.subdomain && branding?.subdomain_enabled && (
              <Alert>
                <ExternalLink className="h-4 w-4" />
                <AlertDescription>
                  Seu menu estará disponível em:{' '}
                  <strong>{branding.subdomain}.delivery2u.com.br</strong>
                </AlertDescription>
              </Alert>
            )}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Enquanto o subdomínio não estiver configurado, seu menu continuará disponível em{' '}
                <strong>delivery2u.com.br/r/{restaurant.slug}</strong>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Preview Visual */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Visualização das cores selecionadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-lg p-6 space-y-4"
            style={{
              backgroundColor: branding?.background_color || '#0a0a0a',
              color: branding?.text_color || '#fafafa',
            }}
          >
            <div className="flex items-center gap-4">
              {branding?.logo_url && (
                <img src={branding.logo_url} alt="Logo" className="h-12 w-12 object-contain" />
              )}
              <div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: branding?.primary_color || '#FBBF24' }}
                >
                  {branding?.header_title || restaurant.name}
                </h3>
                <p className="text-sm opacity-80">{branding?.header_subtitle || 'Seu slogan aqui'}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                className="px-4 py-2 rounded-lg font-medium"
                style={{
                  backgroundColor: branding?.primary_color || '#FBBF24',
                  color: branding?.background_color || '#0a0a0a',
                }}
              >
                Botão Primário
              </button>
              <button
                className="px-4 py-2 rounded-lg font-medium"
                style={{
                  backgroundColor: branding?.secondary_color || '#F97316',
                  color: branding?.background_color || '#0a0a0a',
                }}
              >
                Botão Secundário
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
