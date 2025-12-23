import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Package, CreditCard, Banknote, QrCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useTenant } from '@/context/TenantContext';
import { useMarketplaceCart } from '@/context/MarketplaceCartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type DeliveryMode = 'delivery' | 'pickup';
type PaymentMethod = 'card' | 'meal_voucher' | 'pix' | 'cash';

export default function TenantCheckoutPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { restaurant, branding } = useTenant();
  const { items, subtotal, clearCart } = useMarketplaceCart();
  const { user } = useAuth();

  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [changeFor, setChangeFor] = useState('');
  const [loading, setLoading] = useState(false);

  const deliveryFee = deliveryMode === 'delivery' ? 5 : 0; // Simplified - will use delivery_rules later
  const total = subtotal + deliveryFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Faça login para continuar');
      navigate(`/login?next=/r/${slug}/checkout`);
      return;
    }

    if (!restaurant) return;

    if (deliveryMode === 'delivery' && !deliveryAddress.trim()) {
      toast.error('Informe o endereço de entrega');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          restaurant_id: restaurant.id,
          status: 'pending',
          delivery_mode: deliveryMode,
          delivery_address: deliveryMode === 'delivery' ? deliveryAddress : null,
          subtotal,
          delivery_fee: deliveryFee,
          coupon_discount: 0,
          points_discount: 0,
          total,
          payment_method: paymentMethod,
          payment_change_for: paymentMethod === 'cash' && changeFor ? parseFloat(changeFor) : null,
          notes: notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart and redirect to tracking
      clearCart();
      toast.success('Pedido realizado com sucesso!');
      navigate(`/pedido/${order.id}`);
    } catch (err) {
      console.error('Error creating order:', err);
      toast.error('Erro ao criar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!restaurant || items.length === 0) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          Carrinho vazio
        </h1>
        <p className="text-muted-foreground mb-6">
          Adicione itens ao carrinho para fazer o checkout
        </p>
        <Button onClick={() => navigate(`/r/${slug}`)}>Ver Cardápio</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">
        Finalizar Pedido
      </h1>

      {/* Delivery Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Forma de Recebimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={deliveryMode} 
            onValueChange={(v) => setDeliveryMode(v as DeliveryMode)}
            className="grid grid-cols-2 gap-4"
          >
            {restaurant.delivery_enabled && (
              <Label 
                htmlFor="delivery" 
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  deliveryMode === 'delivery' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <RadioGroupItem value="delivery" id="delivery" className="sr-only" />
                <MapPin className="h-6 w-6 mb-2" />
                <span className="font-medium">Entrega</span>
                <span className="text-sm text-muted-foreground">{formatPrice(5)}</span>
              </Label>
            )}
            {restaurant.pickup_enabled && (
              <Label 
                htmlFor="pickup" 
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  deliveryMode === 'pickup' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
                <Package className="h-6 w-6 mb-2" />
                <span className="font-medium">Retirada</span>
                <span className="text-sm text-muted-foreground">Grátis</span>
              </Label>
            )}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Address */}
      {deliveryMode === 'delivery' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Rua, número, bairro, complemento..."
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="min-h-[80px]"
            />
          </CardContent>
        </Card>
      )}

      {/* Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup 
            value={paymentMethod} 
            onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
            className="space-y-2"
          >
            <Label 
              htmlFor="card" 
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="card" id="card" />
              <CreditCard className="h-5 w-5" />
              <span>Cartão de Crédito/Débito</span>
            </Label>
            <Label 
              htmlFor="meal_voucher" 
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                paymentMethod === 'meal_voucher' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="meal_voucher" id="meal_voucher" />
              <CreditCard className="h-5 w-5" />
              <span>Vale Refeição</span>
            </Label>
            <Label 
              htmlFor="pix" 
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                paymentMethod === 'pix' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="pix" id="pix" />
              <QrCode className="h-5 w-5" />
              <span>Pix</span>
            </Label>
            <Label 
              htmlFor="cash" 
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="cash" id="cash" />
              <Banknote className="h-5 w-5" />
              <span>Dinheiro</span>
            </Label>
          </RadioGroup>

          {paymentMethod === 'cash' && (
            <div className="pt-2">
              <Label htmlFor="change">Troco para</Label>
              <Input
                id="change"
                type="number"
                placeholder="Ex: 50"
                value={changeFor}
                onChange={(e) => setChangeFor(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Alguma observação para o restaurante?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[60px]"
          />
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.name}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <Separator className="my-2" />
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Taxa de entrega</span>
            <span>{deliveryFee > 0 ? formatPrice(deliveryFee) : 'Grátis'}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={loading}
        size="lg"
        className="w-full"
        style={{ 
          backgroundColor: branding?.primary_color || undefined,
        }}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processando...
          </>
        ) : (
          `Finalizar Pedido • ${formatPrice(total)}`
        )}
      </Button>
    </div>
  );
}
