import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, Store, MapPin, Phone, Clock } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  whatsapp: string | null;
  is_open: boolean;
  pickup_enabled: boolean;
  delivery_enabled: boolean;
  min_order_value: number;
}

export default function RestaurantSettings() {
  const { restaurant: contextRestaurant } = useOutletContext<{ restaurant: { id: string } | null }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contextRestaurant?.id) {
      fetchRestaurant();
    }
  }, [contextRestaurant?.id]);

  const fetchRestaurant = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', contextRestaurant?.id)
        .single();

      if (error) throw error;
      setRestaurant(data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!restaurant) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          name: restaurant.name,
          description: restaurant.description,
          address: restaurant.address,
          city: restaurant.city,
          state: restaurant.state,
          phone: restaurant.phone,
          whatsapp: restaurant.whatsapp,
          is_open: restaurant.is_open,
          pickup_enabled: restaurant.pickup_enabled,
          delivery_enabled: restaurant.delivery_enabled,
          min_order_value: restaurant.min_order_value,
        })
        .eq('id', restaurant.id);

      if (error) throw error;
      toast.success('Configurações salvas');
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum restaurante encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as informações do seu restaurante</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
          <CardDescription>Nome e descrição do seu restaurante</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Restaurante</Label>
              <Input
                value={restaurant.name}
                onChange={(e) => setRestaurant(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input value={restaurant.slug} disabled className="bg-secondary" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={restaurant.description || ''}
              onChange={(e) => setRestaurant(prev => prev ? { ...prev, description: e.target.value } : null)}
              placeholder="Descreva seu restaurante..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Localização
          </CardTitle>
          <CardDescription>Endereço do seu restaurante</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input
              value={restaurant.address || ''}
              onChange={(e) => setRestaurant(prev => prev ? { ...prev, address: e.target.value } : null)}
              placeholder="Rua, número, bairro"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                value={restaurant.city || ''}
                onChange={(e) => setRestaurant(prev => prev ? { ...prev, city: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input
                value={restaurant.state || ''}
                onChange={(e) => setRestaurant(prev => prev ? { ...prev, state: e.target.value } : null)}
                placeholder="SP"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contato
          </CardTitle>
          <CardDescription>Informações de contato</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={restaurant.phone || ''}
                onChange={(e) => setRestaurant(prev => prev ? { ...prev, phone: e.target.value } : null)}
                placeholder="(11) 1234-5678"
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input
                value={restaurant.whatsapp || ''}
                onChange={(e) => setRestaurant(prev => prev ? { ...prev, whatsapp: e.target.value } : null)}
                placeholder="11912345678"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operação
          </CardTitle>
          <CardDescription>Configurações de funcionamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Restaurante Aberto</Label>
              <p className="text-sm text-muted-foreground">
                Permitir novos pedidos
              </p>
            </div>
            <Switch
              checked={restaurant.is_open}
              onCheckedChange={(checked) => setRestaurant(prev => prev ? { ...prev, is_open: checked } : null)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Retirada no Local</Label>
              <p className="text-sm text-muted-foreground">
                Permitir que clientes retirem no restaurante
              </p>
            </div>
            <Switch
              checked={restaurant.pickup_enabled}
              onCheckedChange={(checked) => setRestaurant(prev => prev ? { ...prev, pickup_enabled: checked } : null)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Delivery</Label>
              <p className="text-sm text-muted-foreground">
                Permitir entregas
              </p>
            </div>
            <Switch
              checked={restaurant.delivery_enabled}
              onCheckedChange={(checked) => setRestaurant(prev => prev ? { ...prev, delivery_enabled: checked } : null)}
            />
          </div>

          <div className="space-y-2">
            <Label>Pedido Mínimo (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={restaurant.min_order_value || 0}
              onChange={(e) => setRestaurant(prev => prev ? { ...prev, min_order_value: parseFloat(e.target.value) || 0 } : null)}
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
