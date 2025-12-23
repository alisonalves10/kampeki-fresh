import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarketplaceCart } from '@/context/MarketplaceCartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { 
  MapPin, 
  CreditCard, 
  Banknote, 
  QrCode, 
  ChevronLeft, 
  Loader2,
  Plus,
  Home,
  Truck,
  Store
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
}

interface MarketplaceCheckoutProps {
  onBack: () => void;
  onComplete: () => void;
}

type PaymentMethod = 'pix' | 'card' | 'cash';

export function MarketplaceCheckout({ onBack, onComplete }: MarketplaceCheckoutProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    restaurantId,
    restaurantName,
    items, 
    deliveryMode,
    setDeliveryMode,
    subtotal, 
    deliveryFee, 
    total, 
    clearCart 
  } = useMarketplaceCart();

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  const totalSteps = deliveryMode === 'delivery' ? 3 : 2;

  useEffect(() => {
    if (deliveryMode === 'delivery') {
      fetchAddresses();
    } else {
      setIsLoadingAddresses(false);
    }
  }, [deliveryMode]);

  const fetchAddresses = async () => {
    if (!user) return;
    
    setIsLoadingAddresses(true);
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    if (!error && data) {
      setAddresses(data);
      const defaultAddress = data.find(a => a.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (data.length > 0) {
        setSelectedAddressId(data[0].id);
      }
    }
    setIsLoadingAddresses(false);
  };

  const formatAddress = (address: Address) => {
    let formatted = `${address.street}, ${address.number}`;
    if (address.complement) {
      formatted += ` - ${address.complement}`;
    }
    formatted += ` - ${address.neighborhood}, ${address.city}/${address.state}`;
    return formatted;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handleNextStep = () => {
    if (deliveryMode === 'delivery' && step === 1 && !selectedAddressId) {
      toast({
        title: 'Selecione um endereço',
        description: 'Por favor, selecione um endereço de entrega.',
        variant: 'destructive',
      });
      return;
    }
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrevStep = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep(prev => prev - 1);
    }
  };

  const handleConfirmOrder = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (paymentMethod === 'cash' && changeFor) {
      const changeValue = parseFloat(changeFor.replace(',', '.'));
      if (changeValue < total) {
        toast({
          title: 'Valor inválido',
          description: 'O valor para troco deve ser maior que o total do pedido.',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      const deliveryAddressText = deliveryMode === 'delivery' && selectedAddress 
        ? formatAddress(selectedAddress) 
        : null;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          delivery_mode: deliveryMode,
          delivery_address: deliveryAddressText,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          payment_method: paymentMethod,
          payment_change_for: paymentMethod === 'cash' && changeFor 
            ? parseFloat(changeFor.replace(',', '.')) 
            : null,
          notes: orderNotes ? `[${restaurantName}] ${orderNotes}` : `[${restaurantName}]`,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();

      toast({
        title: 'Pedido realizado com sucesso!',
        description: `Seu pedido #${order.id.slice(0, 8)} foi enviado para ${restaurantName}.`,
      });

      onComplete();
      navigate('/orders');
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Erro ao finalizar pedido',
        description: 'Ocorreu um erro ao processar seu pedido. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderAddressStep = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        Endereço de Entrega
      </h3>

      {isLoadingAddresses ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-8 space-y-4">
          <p className="text-muted-foreground">Nenhum endereço cadastrado.</p>
          <Button
            variant="outline"
            onClick={() => navigate('/profile')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Cadastrar Endereço
          </Button>
        </div>
      ) : (
        <RadioGroup
          value={selectedAddressId || ''}
          onValueChange={setSelectedAddressId}
          className="space-y-3"
        >
          {addresses.map((address) => (
            <div
              key={address.id}
              className={cn(
                'flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors',
                selectedAddressId === address.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
              onClick={() => setSelectedAddressId(address.id)}
            >
              <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{address.label}</span>
                  {address.is_default && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Padrão
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatAddress(address)}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>
      )}
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        Forma de Pagamento
      </h3>

      <RadioGroup
        value={paymentMethod}
        onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
        className="space-y-3"
      >
        {[
          { value: 'pix', icon: QrCode, label: 'PIX', description: 'Pagamento instantâneo' },
          { value: 'card', icon: CreditCard, label: 'Cartão', description: 'Crédito ou débito na entrega' },
          { value: 'cash', icon: Banknote, label: 'Dinheiro', description: 'Pagamento em espécie' },
        ].map(({ value, icon: Icon, label, description }) => (
          <div
            key={value}
            className={cn(
              'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors',
              paymentMethod === value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
            onClick={() => setPaymentMethod(value as PaymentMethod)}
          >
            <RadioGroupItem value={value} id={value} />
            <Icon className="h-5 w-5 text-primary" />
            <div>
              <span className="font-medium">{label}</span>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </RadioGroup>

      {paymentMethod === 'cash' && (
        <div className="mt-4">
          <label className="text-sm font-medium mb-2 block">Troco para:</label>
          <Input
            type="text"
            placeholder="Ex: 50,00"
            value={changeFor}
            onChange={(e) => setChangeFor(e.target.value)}
          />
        </div>
      )}

      <div className="mt-4">
        <label className="text-sm font-medium mb-2 block">Observações</label>
        <Textarea
          placeholder="Ex: Apartamento 42, interfone não funciona..."
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Confirme seu pedido</h3>

      <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          {deliveryMode === 'delivery' ? (
            <Truck className="h-4 w-4 text-primary" />
          ) : (
            <Store className="h-4 w-4 text-primary" />
          )}
          <span className="font-medium">
            {deliveryMode === 'delivery' ? 'Entrega' : 'Retirada'}
          </span>
        </div>

        {deliveryMode === 'delivery' && selectedAddressId && (
          <p className="text-sm text-muted-foreground">
            {formatAddress(addresses.find(a => a.id === selectedAddressId)!)}
          </p>
        )}

        <div className="flex items-center gap-2 text-sm">
          {paymentMethod === 'pix' && <QrCode className="h-4 w-4 text-primary" />}
          {paymentMethod === 'card' && <CreditCard className="h-4 w-4 text-primary" />}
          {paymentMethod === 'cash' && <Banknote className="h-4 w-4 text-primary" />}
          <span className="font-medium">
            {paymentMethod === 'pix' && 'PIX'}
            {paymentMethod === 'card' && 'Cartão'}
            {paymentMethod === 'cash' && `Dinheiro${changeFor ? ` (troco para R$ ${changeFor})` : ''}`}
          </span>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Taxa de entrega</span>
          <span className={deliveryFee === 0 ? 'text-d2u-green' : ''}>
            {deliveryFee === 0 ? 'Grátis' : formatPrice(deliveryFee)}
          </span>
        </div>
        <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
          <span>Total</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );

  const getStepContent = () => {
    if (deliveryMode === 'delivery') {
      if (step === 1) return renderAddressStep();
      if (step === 2) return renderPaymentStep();
      if (step === 3) return renderConfirmationStep();
    } else {
      if (step === 1) return renderPaymentStep();
      if (step === 2) return renderConfirmationStep();
    }
  };

  const isLastStep = step === totalSteps;

  return (
    <div className="h-full flex flex-col">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={cn(
              'w-3 h-3 rounded-full transition-colors',
              step > i ? 'bg-primary' : step === i + 1 ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {getStepContent()}
      </div>

      {/* Footer */}
      <div className="pt-4 flex gap-3">
        <Button variant="outline" onClick={handlePrevStep} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
        
        {isLastStep ? (
          <Button 
            onClick={handleConfirmOrder} 
            className="flex-1 glow-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              'Confirmar Pedido'
            )}
          </Button>
        ) : (
          <Button onClick={handleNextStep} className="flex-1">
            Continuar
          </Button>
        )}
      </div>
    </div>
  );
}
