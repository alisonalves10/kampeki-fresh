import { useState, useEffect, useRef } from 'react';
import { Palette, Image, Upload, Eye, Loader2, Check, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface TenantBranding {
  id?: string;
  restaurant_id: string;
  primary_color: string;
  secondary_color: string;
  background_color: string | null;
  text_color: string | null;
  header_image_url: string | null;
  header_title: string | null;
  header_subtitle: string | null;
  favicon_url: string | null;
  logo_url: string | null;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

const defaultBranding: Omit<TenantBranding, 'restaurant_id'> = {
  primary_color: '#0891b2',
  secondary_color: '#f97316',
  background_color: null,
  text_color: null,
  header_image_url: null,
  header_title: null,
  header_subtitle: null,
  favicon_url: null,
  logo_url: null,
};

export default function AdminBrandingPage() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get restaurant owned by this user
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id, name, slug')
        .eq('owner_id', user!.id)
        .maybeSingle();

      if (restaurantError) throw restaurantError;

      if (!restaurantData) {
        setLoading(false);
        return;
      }

      setRestaurant(restaurantData);

      // Get branding
      const { data: brandingData } = await supabase
        .from('tenant_branding' as any)
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .maybeSingle();

      if (brandingData) {
        setBranding(brandingData as unknown as TenantBranding);
      } else {
        setBranding({
          restaurant_id: restaurantData.id,
          ...defaultBranding,
        });
      }
    } catch (err) {
      console.error('Error fetching branding:', err);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!branding || !restaurant) return;

    setSaving(true);
    try {
      if (branding.id) {
        // Update existing
        const { error } = await supabase
          .from('tenant_branding' as any)
          .update({
            primary_color: branding.primary_color,
            secondary_color: branding.secondary_color,
            background_color: branding.background_color,
            text_color: branding.text_color,
            header_image_url: branding.header_image_url,
            header_title: branding.header_title,
            header_subtitle: branding.header_subtitle,
            favicon_url: branding.favicon_url,
            logo_url: branding.logo_url,
          })
          .eq('id', branding.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('tenant_branding' as any)
          .insert({
            restaurant_id: restaurant.id,
            primary_color: branding.primary_color,
            secondary_color: branding.secondary_color,
            background_color: branding.background_color,
            text_color: branding.text_color,
            header_image_url: branding.header_image_url,
            header_title: branding.header_title,
            header_subtitle: branding.header_subtitle,
            favicon_url: branding.favicon_url,
            logo_url: branding.logo_url,
          })
          .select()
          .single();

        if (error) throw error;
        setBranding(data as unknown as TenantBranding);
      }

      toast.success('Configurações salvas!');
    } catch (err) {
      console.error('Error saving branding:', err);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File, type: 'logo' | 'header' | 'favicon') => {
    if (!restaurant) return;

    setUploading(type);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `${restaurant.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('tenant-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tenant-assets')
        .getPublicUrl(filePath);

      // Update branding state
      const fieldMap = {
        logo: 'logo_url',
        header: 'header_image_url',
        favicon: 'favicon_url',
      };

      setBranding(prev => prev ? {
        ...prev,
        [fieldMap[type]]: publicUrl,
      } : null);

      toast.success('Imagem enviada!');
    } catch (err) {
      console.error('Error uploading:', err);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'header' | 'favicon') => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file, type);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-foreground mb-2">Nenhum restaurante encontrado</h2>
        <p className="text-muted-foreground">Você precisa ter um restaurante para configurar o whitelabel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Personalização</h1>
          <p className="text-muted-foreground">Configure a aparência do site do seu restaurante</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href={`/r/${restaurant.slug}`} target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </a>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Cores
            </CardTitle>
            <CardDescription>
              Defina as cores principais do seu site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary_color">Cor Primária</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    id="primary_color"
                    value={branding?.primary_color || '#0891b2'}
                    onChange={(e) => setBranding(prev => prev ? { ...prev, primary_color: e.target.value } : null)}
                    className="h-10 w-14 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={branding?.primary_color || '#0891b2'}
                    onChange={(e) => setBranding(prev => prev ? { ...prev, primary_color: e.target.value } : null)}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Botões, links e destaques</p>
              </div>
              <div>
                <Label htmlFor="secondary_color">Cor Secundária</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    id="secondary_color"
                    value={branding?.secondary_color || '#f97316'}
                    onChange={(e) => setBranding(prev => prev ? { ...prev, secondary_color: e.target.value } : null)}
                    className="h-10 w-14 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={branding?.secondary_color || '#f97316'}
                    onChange={(e) => setBranding(prev => prev ? { ...prev, secondary_color: e.target.value } : null)}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Badges e elementos secundários</p>
              </div>
            </div>

            {/* Preview Colors */}
            <div className="pt-4">
              <Label>Preview</Label>
              <div className="flex items-center gap-4 mt-2">
                <div
                  className="h-12 w-24 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: branding?.primary_color || '#0891b2' }}
                >
                  Primária
                </div>
                <div
                  className="h-12 w-24 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: branding?.secondary_color || '#f97316' }}
                >
                  Secundária
                </div>
                <div
                  className="h-12 flex-1 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                  style={{ 
                    background: `linear-gradient(135deg, ${branding?.primary_color || '#0891b2'}, ${branding?.secondary_color || '#f97316'})`
                  }}
                >
                  Gradiente
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Header Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Header (Hero)
            </CardTitle>
            <CardDescription>
              Imagem e textos do topo do site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Header Image */}
            <div>
              <Label>Imagem de Fundo</Label>
              <div className="mt-2">
                {branding?.header_image_url ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={branding.header_image_url}
                      alt="Header"
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => headerInputRef.current?.click()}
                        disabled={uploading === 'header'}
                      >
                        {uploading === 'header' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Trocar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-32"
                    onClick={() => headerInputRef.current?.click()}
                    disabled={uploading === 'header'}
                  >
                    {uploading === 'header' ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <div className="text-center">
                        <Upload className="h-6 w-6 mx-auto mb-2" />
                        <span>Enviar imagem</span>
                      </div>
                    )}
                  </Button>
                )}
                <input
                  ref={headerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'header')}
                  className="hidden"
                />
              </div>
            </div>

            {/* Header Title */}
            <div>
              <Label htmlFor="header_title">Título</Label>
              <Input
                id="header_title"
                value={branding?.header_title || ''}
                onChange={(e) => setBranding(prev => prev ? { ...prev, header_title: e.target.value } : null)}
                placeholder={restaurant.name}
              />
            </div>

            {/* Header Subtitle */}
            <div>
              <Label htmlFor="header_subtitle">Subtítulo</Label>
              <Input
                id="header_subtitle"
                value={branding?.header_subtitle || ''}
                onChange={(e) => setBranding(prev => prev ? { ...prev, header_subtitle: e.target.value } : null)}
                placeholder="Descrição curta do restaurante"
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
            <CardDescription>
              Logo do seu restaurante (exibida no header)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              {branding?.logo_url ? (
                <div className="relative">
                  <img
                    src={branding.logo_url}
                    alt="Logo"
                    className="h-24 w-24 rounded-lg object-cover border border-border"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute -bottom-2 -right-2"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploading === 'logo'}
                  >
                    {uploading === 'logo' ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="h-24 w-24"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploading === 'logo'}
                >
                  {uploading === 'logo' ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Upload className="h-6 w-6" />
                  )}
                </Button>
              )}
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Recomendado: imagem quadrada, mínimo 200x200px.
                  <br />
                  Formatos: PNG, JPG ou WEBP.
                </p>
              </div>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'logo')}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Favicon */}
        <Card>
          <CardHeader>
            <CardTitle>Favicon</CardTitle>
            <CardDescription>
              Ícone exibido na aba do navegador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              {branding?.favicon_url ? (
                <div className="relative">
                  <img
                    src={branding.favicon_url}
                    alt="Favicon"
                    className="h-16 w-16 rounded object-cover border border-border"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute -bottom-2 -right-2"
                    onClick={() => faviconInputRef.current?.click()}
                    disabled={uploading === 'favicon'}
                  >
                    {uploading === 'favicon' ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="h-16 w-16"
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={uploading === 'favicon'}
                >
                  {uploading === 'favicon' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                </Button>
              )}
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Recomendado: imagem quadrada, 32x32 ou 64x64px.
                  <br />
                  Formatos: PNG ou ICO.
                </p>
              </div>
            </div>
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/png,image/x-icon,image/ico"
              onChange={(e) => handleFileChange(e, 'favicon')}
              className="hidden"
            />
          </CardContent>
        </Card>
      </div>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview ao Vivo</CardTitle>
          <CardDescription>
            Veja como seu site vai ficar para os clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden bg-background">
            {/* Mock Header */}
            <div className="relative h-48 sm:h-56">
              {branding?.header_image_url ? (
                <img 
                  src={branding.header_image_url} 
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full"
                  style={{ 
                    background: `linear-gradient(135deg, ${branding?.primary_color || '#0891b2'}, ${branding?.secondary_color || '#f97316'})`
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <div className="absolute inset-0 flex items-end p-4 sm:p-6">
                <div className="flex items-end gap-4">
                  {branding?.logo_url ? (
                    <img 
                      src={branding.logo_url} 
                      alt="Logo"
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border-4 border-background shadow-lg"
                    />
                  ) : (
                    <div 
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl border-4 border-background shadow-lg"
                      style={{ backgroundColor: branding?.primary_color || '#0891b2' }}
                    >
                      {restaurant.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                      {branding?.header_title || restaurant.name}
                    </h2>
                    {branding?.header_subtitle && (
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {branding.header_subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Mock Content */}
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: branding?.primary_color || '#0891b2' }}
                >
                  Aberto agora
                </span>
                <span className="text-sm text-muted-foreground">Entrega • Retirada</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Cardápio</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border border-border p-3">
                    <div className="h-16 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-3/4 mb-1" />
                    <div className="h-2 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
