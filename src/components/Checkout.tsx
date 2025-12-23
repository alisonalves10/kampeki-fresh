import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { 
  MapPin, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Check, 
  ChevronLeft, 
  ChevronRight,
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

interface CheckoutProps {
  onBack: () => void;
  onComplete: () => void;
}

type PaymentMethod = 'pix' | 'card' | 'cash';

interface StoreAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  formatted: string;
}

// Endereço padrão caso não carregue do banco
const DEFAULT_STORE_ADDRESS: StoreAddress = {
  street: 'Rua das Palmeiras',
  number: '123',
  neighborhood: 'Centro',
  city: 'São Paulo',
  state: 'SP',
  formatted: 'Rua das Palmeiras, 123 - Centro, São Paulo/SP'
};

const Checkout = ({ onBack, onComplete }: CheckoutProps) => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { 
    items, 
    deliveryMode,
    setDeliveryMode,
    subtotal, 
    deliveryFee, 
    couponDiscount, 
    pointsDiscount, 
    total, 
    earnedPoints,
    appliedCoupon,
    pointsToRedeem,
    clearCart 
  } = useCart();

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [storeAddress, setStoreAddress] = useState<StoreAddress>(DEFAULT_STORE_ADDRESS);

  // Passos: 1=Modo, 2=Endereço(se delivery), 3=Pagamento, 4=Confirmação
  const totalSteps = deliveryMode === 'delivery' ? 4 : 3;

  // Fetch store address on mount
  useEffect(() => {
    fetchStoreAddress();
  }, []);

  useEffect(() => {
    if (deliveryMode === 'delivery') {
      fetchAddresses();
    } else {
      setIsLoadingAddresses(false);
    }
  }, [deliveryMode]);

  const fetchStoreAddress = async () => {
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'store_address')
      .single();

    if (!error && data) {
      setStoreAddress(data.value as unknown as StoreAddress);
    }
  };

  // Quando mudar o modo de entrega, resetar o passo de endereço se necessário
  const handleDeliveryModeChange = (mode: 'delivery' | 'pickup') => {
    setDeliveryMode(mode);
    if (mode === 'delivery') {
      fetchAddresses();
    }
  };

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
    // Validar seleção de endereço no passo 2 para delivery
    if (deliveryMode === 'delivery' && step === 2 && !selectedAddressId) {
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

      // 1. Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          delivery_mode: deliveryMode,
          delivery_address: deliveryAddressText,
          subtotal,
          delivery_fee: deliveryFee,
          coupon_code: appliedCoupon?.code || null,
          coupon_discount: couponDiscount,
          points_used: pointsToRedeem,
          points_discount: pointsDiscount,
          points_earned: earnedPoints,
          total,
          payment_method: paymentMethod,
          payment_change_for: paymentMethod === 'cash' && changeFor 
            ? parseFloat(changeFor.replace(',', '.')) 
            : null,
          notes: orderNotes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
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

      // 3. Update user points and create transactions
      const currentPoints = profile?.points ?? 0;
      const newPoints = currentPoints - pointsToRedeem + earnedPoints;

      const { error: pointsError } = await supabase
        .from('profiles')
        .update({ points: newPoints })
        .eq('user_id', user.id);

      if (pointsError) throw pointsError;

      // 4. Create points transactions
      const pointsTransactions = [];
      
      if (pointsToRedeem > 0) {
        pointsTransactions.push({
          user_id: user.id,
          order_id: order.id,
          type: 'used',
          amount: -pointsToRedeem,
          description: `Resgate no pedido #${order.id.slice(0, 8)}`,
        });
      }

      if (earnedPoints > 0) {
        pointsTransactions.push({
          user_id: user.id,
          order_id: order.id,
          type: 'earned',
          amount: earnedPoints,
          description: `Pontos ganhos no pedido #${order.id.slice(0, 8)}`,
        });
      }

      if (pointsTransactions.length > 0) {
        const { error: transError } = await supabase
          .from('points_transactions')
          .insert(pointsTransactions);

        if (transError) throw transError;
      }

      // 5. Increment coupon usage if applicable
      if (appliedCoupon) {
        // Fetch current coupon uses and increment
        const { data: couponData } = await supabase
          .from('coupons')
          .select('current_uses')
          .eq('id', appliedCoupon.id)
          .single();
        
        const { error: couponError } = await supabase
          .from('coupons')
          .update({ current_uses: (couponData?.current_uses ?? 0) + 1 })
          .eq('id', appliedCoupon.id);
        if (couponError) console.error('Failed to update coupon:', couponError);
      }

      // 6. Refresh profile to get updated points
      await refreshProfile();

      // 7. Clear cart
      clearCart();

      toast({
        title: 'Pedido realizado com sucesso!',
        description: `Seu pedido #${order.id.slice(0, 8)} foi enviado.`,
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

  const renderStepIndicator = () => (
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
  );

  const renderDeliveryModeStep = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Truck className="h-5 w-5 text-primary" />
        Como deseja receber seu pedido?
      </h3>

      <RadioGroup
        value={deliveryMode}
        onValueChange={(value) => handleDeliveryModeChange(value as 'delivery' | 'pickup')}
        className="space-y-3"
      >
        <div
          className={cn(
            'flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors',
            deliveryMode === 'delivery'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          )}
          onClick={() => handleDeliveryModeChange('delivery')}
        >
          <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
          <Truck className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <span className="font-medium">Entrega</span>
            <p className="text-sm text-muted-foreground mt-1">
              Receba no seu endereço
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Taxa de entrega: <span className="font-medium">{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Grátis!'}</span>
            </p>
          </div>
        </div>

        <div
          className={cn(
            'flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors',
            deliveryMode === 'pickup'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          )}
          onClick={() => handleDeliveryModeChange('pickup')}
        >
          <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
          <Store className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <span className="font-medium">Retirar no local</span>
            <p className="text-sm text-muted-foreground mt-1">
              {storeAddress.formatted}
            </p>
            <p className="text-xs text-green-600 mt-1 font-medium">
              Sem taxa de entrega
            </p>
          </div>
        </div>
      </RadioGroup>
    </div>
  );

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
        <div
          className={cn(
            'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors',
            paymentMethod === 'pix'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          )}
          onClick={() => setPaymentMethod('pix')}
        >
          <RadioGroupItem value="pix" id="pix" />
          <QrCode className="h-5 w-5 text-primary" />
          <div>
            <span className="font-medium">PIX</span>
            <p className="text-xs text-muted-foreground">Pagamento instantâneo</p>
          </div>
        </div>

        <div
          className={cn(
            'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors',
            paymentMethod === 'card'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          )}
          onClick={() => setPaymentMethod('card')}
        >
          <RadioGroupItem value="card" id="card" />
          <CreditCard className="h-5 w-5 text-primary" />
          <div>
            <span className="font-medium">Cartão na Entrega</span>
            <p className="text-xs text-muted-foreground">Débito ou crédito</p>
          </div>
        </div>

        <div
          className={cn(
            'flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors',
            paymentMethod === 'cash'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          )}
          onClick={() => setPaymentMethod('cash')}
        >
          <RadioGroupItem value="cash" id="cash" />
          <Banknote className="h-5 w-5 text-primary" />
          <div>
            <span className="font-medium">Dinheiro</span>
            <p className="text-xs text-muted-foreground">Pagamento na entrega</p>
          </div>
        </div>
      </RadioGroup>

      {paymentMethod === 'cash' && (
        <div className="space-y-2 mt-4">
          <Label htmlFor="changeFor">Troco para quanto?</Label>
          <Input
            id="changeFor"
            type="text"
            placeholder="Ex: 100,00"
            value={changeFor}
            onChange={(e) => setChangeFor(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-2 mt-4">
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Ex: Sem cebola, apartamento 101..."
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );

  const renderConfirmationStep = () => {
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Check className="h-5 w-5 text-primary" />
          Confirmar Pedido
        </h3>

        {/* Items */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Itens do pedido</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.product.name}</span>
                <span>{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            {deliveryMode === 'delivery' ? 'Endereço de Entrega' : 'Retirada'}
          </h4>
          <div className="flex items-start gap-2">
            {deliveryMode === 'delivery' ? (
              <Truck className="h-4 w-4 text-primary mt-0.5" />
            ) : (
              <Store className="h-4 w-4 text-primary mt-0.5" />
            )}
            <p className="text-sm">
              {deliveryMode === 'delivery' && selectedAddress
                ? formatAddress(selectedAddress)
                : storeAddress.formatted}
            </p>
          </div>
        </div>

        {/* Payment */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Pagamento</h4>
          <p className="text-sm">
            {paymentMethod === 'pix' && 'PIX'}
            {paymentMethod === 'card' && 'Cartão na Entrega'}
            {paymentMethod === 'cash' && `Dinheiro${changeFor ? ` (Troco para R$ ${changeFor})` : ''}`}
          </p>
        </div>

        {orderNotes && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Observações</h4>
            <p className="text-sm">{orderNotes}</p>
          </div>
        )}

        {/* Totals */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {deliveryFee > 0 && (
            <div className="flex justify-between text-sm">
              <span>Entrega</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between text-sm text-success">
              <span>Cupom ({appliedCoupon?.code})</span>
              <span>-{formatPrice(couponDiscount)}</span>
            </div>
          )}
          {pointsDiscount > 0 && (
            <div className="flex justify-between text-sm text-success">
              <span>Pontos ({pointsToRedeem} pts)</span>
              <span>-{formatPrice(pointsDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>
          {earnedPoints > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Você ganhará <span className="text-primary font-medium">{earnedPoints} pontos</span> neste pedido
            </p>
          )}
        </div>
      </div>
    );
  };

  const getCurrentStepContent = () => {
    // Passo 1 é sempre a seleção de modo de entrega
    if (step === 1) {
      return renderDeliveryModeStep();
    }

    if (deliveryMode === 'delivery') {
      // Delivery: 1=Modo, 2=Endereço, 3=Pagamento, 4=Confirmação
      switch (step) {
        case 2:
          return renderAddressStep();
        case 3:
          return renderPaymentStep();
        case 4:
          return renderConfirmationStep();
      }
    } else {
      // Pickup: 1=Modo, 2=Pagamento, 3=Confirmação
      switch (step) {
        case 2:
          return renderPaymentStep();
        case 3:
          return renderConfirmationStep();
      }
    }
  };

  const isLastStep = step === totalSteps;

  return (
    <div className="flex flex-col h-full">
      {renderStepIndicator()}

      <div className="flex-1 overflow-y-auto px-1">
        {getCurrentStepContent()}
      </div>

      <div className="flex gap-3 pt-4 border-t mt-4">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          className="flex-1"
          disabled={isLoading}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>

        {isLastStep ? (
          <Button
            onClick={handleConfirmOrder}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Confirmar Pedido
                <Check className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNextStep}
            className="flex-1"
            disabled={deliveryMode === 'delivery' && step === 2 && addresses.length === 0}
          >
            Próximo
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Checkout;
