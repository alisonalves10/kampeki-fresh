import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Loader2, MapPin, Save, Truck, Clock } from 'lucide-react';
import { BusinessHours, DayHours, DEFAULT_HOURS, getDayName } from '@/hooks/useStoreStatus';

interface StoreAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  formatted: string;
}

interface DeliverySettings {
  fee: number;
  free_above: number;
}

const DAY_KEYS: (keyof BusinessHours)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isSavingDelivery, setIsSavingDelivery] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [address, setAddress] = useState<StoreAddress>({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    formatted: ''
  });
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>({
    fee: 11.99,
    free_above: 150
  });
  const [businessHours, setBusinessHours] = useState<BusinessHours>(DEFAULT_HOURS);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    
    const [addressResult, deliveryResult, hoursResult] = await Promise.all([
      supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'store_address')
        .maybeSingle(),
      supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'delivery_settings')
        .maybeSingle(),
      supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'business_hours')
        .maybeSingle()
    ]);

    if (!addressResult.error && addressResult.data) {
      setAddress(addressResult.data.value as unknown as StoreAddress);
    }
    
    if (!deliveryResult.error && deliveryResult.data) {
      setDeliverySettings(deliveryResult.data.value as unknown as DeliverySettings);
    }

    if (!hoursResult.error && hoursResult.data) {
      setBusinessHours(hoursResult.data.value as unknown as BusinessHours);
    }
    
    setIsLoading(false);
  };

  const formatAddress = (addr: StoreAddress): string => {
    return `${addr.street}, ${addr.number} - ${addr.neighborhood}, ${addr.city}/${addr.state}`;
  };

  const handleAddressChange = (field: keyof StoreAddress, value: string) => {
    setAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeliveryChange = (field: keyof DeliverySettings, value: string) => {
    const numValue = parseFloat(value.replace(',', '.')) || 0;
    setDeliverySettings(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleHoursChange = (day: keyof BusinessHours, field: keyof DayHours, value: string | boolean) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSaveAddress = async () => {
    if (!address.street || !address.number || !address.neighborhood || !address.city || !address.state) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos do endereço.',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingAddress(true);
    
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
    
    setIsSavingAddress(false);
  };

  const handleSaveDelivery = async () => {
    if (deliverySettings.fee < 0 || deliverySettings.free_above < 0) {
      toast({
        title: 'Valores inválidos',
        description: 'Os valores não podem ser negativos.',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingDelivery(true);

    const { error } = await supabase
      .from('store_settings')
      .update({ value: JSON.parse(JSON.stringify(deliverySettings)) })
      .eq('key', 'delivery_settings');

    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações de entrega. Tente novamente.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Configurações atualizadas',
        description: 'As configurações de entrega foram atualizadas com sucesso.',
      });
    }
    
    setIsSavingDelivery(false);
  };

  const handleSaveHours = async () => {
    setIsSavingHours(true);

    const { error } = await supabase
      .from('store_settings')
      .update({ value: JSON.parse(JSON.stringify(businessHours)) })
      .eq('key', 'business_hours');

    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar os horários. Tente novamente.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Horários atualizados',
        description: 'Os horários de funcionamento foram atualizados com sucesso.',
      });
    }
    
    setIsSavingHours(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
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

      {/* Business Hours Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horário de Funcionamento
          </CardTitle>
          <CardDescription>
            Configure os dias e horários de funcionamento do estabelecimento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {DAY_KEYS.map((day) => (
              <div key={day} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <Switch
                  checked={businessHours[day].enabled}
                  onCheckedChange={(checked) => handleHoursChange(day, 'enabled', checked)}
                />
                <span className="w-24 font-medium">{getDayName(day)}</span>
                {businessHours[day].enabled ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={businessHours[day].open}
                      onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">às</span>
                    <Input
                      type="time"
                      value={businessHours[day].close}
                      onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                      className="w-32"
                    />
                  </div>
                ) : (
                  <span className="text-muted-foreground">Fechado</span>
                )}
              </div>
            ))}
          </div>

          <Button onClick={handleSaveHours} disabled={isSavingHours} className="w-full md:w-auto">
            {isSavingHours ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Horários
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Delivery Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Taxa de Entrega
          </CardTitle>
          <CardDescription>
            Configure a taxa de entrega e o valor mínimo para frete grátis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fee">Taxa de Entrega (R$)</Label>
              <Input
                id="fee"
                type="number"
                step="0.01"
                min="0"
                value={deliverySettings.fee}
                onChange={(e) => handleDeliveryChange('fee', e.target.value)}
                placeholder="11.99"
              />
              <p className="text-xs text-muted-foreground">
                Valor cobrado para entregas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="free_above">Frete Grátis Acima de (R$)</Label>
              <Input
                id="free_above"
                type="number"
                step="0.01"
                min="0"
                value={deliverySettings.free_above}
                onChange={(e) => handleDeliveryChange('free_above', e.target.value)}
                placeholder="150"
              />
              <p className="text-xs text-muted-foreground">
                Pedidos acima deste valor terão frete grátis (0 = nunca grátis)
              </p>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Preview:</p>
            <p className="font-medium">
              Taxa: {formatPrice(deliverySettings.fee)} | 
              {deliverySettings.free_above > 0 
                ? ` Grátis acima de ${formatPrice(deliverySettings.free_above)}`
                : ' Sem frete grátis'}
            </p>
          </div>

          <Button onClick={handleSaveDelivery} disabled={isSavingDelivery} className="w-full md:w-auto">
            {isSavingDelivery ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Taxa de Entrega
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Store Address Card */}
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
                onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="Ex: Rua das Palmeiras"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                value={address.number}
                onChange={(e) => handleAddressChange('number', e.target.value)}
                placeholder="Ex: 123"
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input
                id="neighborhood"
                value={address.neighborhood}
                onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                placeholder="Ex: Centro"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="Ex: São Paulo"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                value={address.state}
                onChange={(e) => handleAddressChange('state', e.target.value.toUpperCase())}
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

          <Button onClick={handleSaveAddress} disabled={isSavingAddress} className="w-full md:w-auto">
            {isSavingAddress ? (
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
