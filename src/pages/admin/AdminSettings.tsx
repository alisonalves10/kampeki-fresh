import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, MapPin, Save } from 'lucide-react';

interface StoreAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  formatted: string;
}

const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [address, setAddress] = useState<StoreAddress>({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    formatted: ''
  });

  useEffect(() => {
    fetchStoreAddress();
  }, []);

  const fetchStoreAddress = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'store_address')
      .single();

    if (!error && data) {
      setAddress(data.value as unknown as StoreAddress);
    }
    setIsLoading(false);
  };

  const formatAddress = (addr: StoreAddress): string => {
    return `${addr.street}, ${addr.number} - ${addr.neighborhood}, ${addr.city}/${addr.state}`;
  };

  const handleChange = (field: keyof StoreAddress, value: string) => {
    setAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!address.street || !address.number || !address.neighborhood || !address.city || !address.state) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos do endereço.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    
    const updatedAddress = {
      ...address,
      formatted: formatAddress(address)
    };

    const { error } = await supabase
      .from('store_settings')
      .update({ value: updatedAddress })
      .eq('key', 'store_address');

    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o endereço. Tente novamente.',
        variant: 'destructive',
      });
    } else {
      setAddress(updatedAddress);
      toast({
        title: 'Endereço atualizado',
        description: 'O endereço do estabelecimento foi atualizado com sucesso.',
      });
    }
    
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da loja</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço do Estabelecimento
          </CardTitle>
          <CardDescription>
            Este endereço será exibido para clientes que optarem por retirar o pedido no local.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="street">Rua/Avenida *</Label>
              <Input
                id="street"
                value={address.street}
                onChange={(e) => handleChange('street', e.target.value)}
                placeholder="Ex: Rua das Palmeiras"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                value={address.number}
                onChange={(e) => handleChange('number', e.target.value)}
                placeholder="Ex: 123"
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input
                id="neighborhood"
                value={address.neighborhood}
                onChange={(e) => handleChange('neighborhood', e.target.value)}
                placeholder="Ex: Centro"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={address.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Ex: São Paulo"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                value={address.state}
                onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                placeholder="Ex: SP"
                maxLength={2}
              />
            </div>
          </div>

          {address.street && address.number && address.neighborhood && address.city && address.state && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Preview:</p>
              <p className="font-medium">{formatAddress(address)}</p>
            </div>
          )}

          <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Endereço
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
