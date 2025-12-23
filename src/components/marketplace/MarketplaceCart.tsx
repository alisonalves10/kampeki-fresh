import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  Truck, 
  Store, 
  CreditCard,
  MapPin,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMarketplaceCart } from '@/context/MarketplaceCartContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { MarketplaceCheckout } from './MarketplaceCheckout';

interface MarketplaceCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MarketplaceCart({ isOpen, onClose }: MarketplaceCartProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    restaurantName,
    items,
    updateQuantity,
    removeItem,
    subtotal,
    deliveryFee,
    total,
    deliveryMode,
    setDeliveryMode,
    minOrderValue,
  } = useMarketplaceCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const canCheckout = subtotal >= minOrderValue;

  const handleCheckoutClick = () => {
    if (!user) {
      toast({
        title: 'Faça login para continuar',
        description: 'Você precisa estar logado para finalizar o pedido.',
        variant: 'destructive',
      });
      navigate('/auth');
      onClose();
      return;
    }

    if (!canCheckout) {
      toast({
        title: 'Pedido mínimo não atingido',
        description: `O pedido mínimo é de ${formatPrice(minOrderValue)}.`,
        variant: 'destructive',
      });
      return;
    }

    setIsCheckingOut(true);
  };

  const handleCheckoutComplete = () => {
    setIsCheckingOut(false);
    onClose();
  };

  const handleCheckoutBack = () => {
    setIsCheckingOut(false);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Cart Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-display text-xl font-semibold">
                {isCheckingOut ? 'Finalizar Pedido' : 'Meu Carrinho'}
              </h2>
              {restaurantName && !isCheckingOut && (
                <p className="text-xs text-muted-foreground">{restaurantName}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isCheckingOut ? (
            <div className="p-4 h-full">
              <MarketplaceCheckout onBack={handleCheckoutBack} onComplete={handleCheckoutComplete} />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                Seu carrinho está vazio
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione itens do cardápio!
              </p>
              <Button onClick={onClose} variant="default">
                Ver cardápio
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Items */}
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex gap-3 p-3 bg-secondary/50 rounded-lg"
                >
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🍽️
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm line-clamp-2">
                      {item.product.name}
                    </h4>
                    <p className="text-primary font-semibold mt-1">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-background rounded-lg border border-border">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="p-1.5 hover:bg-secondary rounded-l-lg transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-3 text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="p-1.5 hover:bg-secondary rounded-r-lg transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.cartItemId)}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Delivery Mode Selection */}
              <div className="p-3 bg-secondary/50 rounded-lg space-y-3">
                <p className="text-sm font-medium">Modo de entrega</p>
                <div className="flex gap-2">
                  <Button
                    variant={deliveryMode === 'delivery' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => setDeliveryMode('delivery')}
                  >
                    <Truck className="h-4 w-4" />
                    Entrega
                  </Button>
                  <Button
                    variant={deliveryMode === 'pickup' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => setDeliveryMode('pickup')}
                  >
                    <Store className="h-4 w-4" />
                    Retirada
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && !isCheckingOut && (
          <div className="border-t border-border p-4 space-y-4">
            {/* Summary */}
            <div className="space-y-2">
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
              {minOrderValue > 0 && subtotal < minOrderValue && (
                <p className="text-xs text-destructive">
                  Pedido mínimo: {formatPrice(minOrderValue)} (faltam {formatPrice(minOrderValue - subtotal)})
                </p>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button 
              onClick={handleCheckoutClick}
              className="w-full h-12 text-base glow-primary"
              disabled={!canCheckout}
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Finalizar Pedido
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
