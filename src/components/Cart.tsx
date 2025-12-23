import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag, Truck, MapPin, CreditCard, Tag, Gift, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Checkout from '@/components/Checkout';
import comboSalmao from '@/assets/combo-salmao.jpg';
import comboExclusivo from '@/assets/combo-exclusivo.jpg';
import temaki from '@/assets/temaki.jpg';
import sashimi from '@/assets/sashimi.jpg';
import uramaki from '@/assets/uramaki.jpg';
import hossomaki from '@/assets/hossomaki.jpg';
import gunkan from '@/assets/gunkan.jpg';

const imageMap: Record<string, string> = {
  'combo-salmao': comboSalmao,
  'combo-exclusivo': comboExclusivo,
  'temaki': temaki,
  'sashimi': sashimi,
  'uramaki': uramaki,
  'hossomaki': hossomaki,
  'gunkan': gunkan,
};

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Cart = ({ isOpen, onClose }: CartProps) => {
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    removeItem,
    subtotal,
    deliveryFee,
    total,
    deliveryMode,
    appliedCoupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    pointsToRedeem,
    pointsDiscount,
    setPointsToRedeem,
    earnedPoints,
  } = useCart();

  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplyingCoupon(true);
    const result = await applyCoupon(couponCode);
    setIsApplyingCoupon(false);

    if (result.success) {
      toast({
        title: "Cupom aplicado!",
        description: result.message,
      });
      setCouponCode('');
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handlePointsChange = (value: number) => {
    const maxPoints = profile?.points ?? 0;
    // Limit points to max available and ensure min 0
    const validPoints = Math.min(Math.max(0, value), maxPoints);
    // Also limit to order value (no negative total)
    const maxRedeemable = Math.floor((subtotal + deliveryFee - couponDiscount) / 0.10);
    setPointsToRedeem(Math.min(validPoints, maxRedeemable));
  };

  const availablePoints = profile?.points ?? 0;

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
            <h2 className="font-serif text-xl font-semibold">
              {isCheckingOut ? 'Finalizar Pedido' : 'Meu Carrinho'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isCheckingOut ? (
            <div className="p-4 h-full">
              <Checkout onBack={handleCheckoutBack} onComplete={handleCheckoutComplete} />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                Seu carrinho está vazio
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione itens deliciosos do nosso cardápio!
              </p>
              <Button onClick={onClose} variant="default">
                Ver cardápio
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Items */}
              {items.map((item) => {
                const imageSrc = imageMap[item.product.image] || comboSalmao;
                const itemTotalPrice = (item.product.price + (item.addonsTotalPrice || 0)) * item.quantity;
                return (
                  <div
                    key={item.cartItemId}
                    className="flex gap-3 p-3 bg-secondary/50 rounded-lg"
                  >
                    <img
                      src={imageSrc}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm line-clamp-2">
                        {item.product.name}
                      </h4>
                      {/* Show selected addons */}
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.selectedAddons.map((addon, idx) => (
                            <span key={addon.optionId}>
                              {addon.optionName}
                              {addon.quantity > 1 && ` (x${addon.quantity})`}
                              {idx < item.selectedAddons!.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-primary font-semibold mt-1">
                        {formatPrice(itemTotalPrice)}
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
                );
              })}

              {/* Delivery Info */}
              <div className="p-3 bg-secondary/50 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  {deliveryMode === 'delivery' ? (
                    <Truck className="h-4 w-4 text-primary" />
                  ) : (
                    <MapPin className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm font-medium">
                    {deliveryMode === 'delivery' ? 'Entrega' : 'Retirada no local'}
                  </span>
                </div>
                {deliveryMode === 'delivery' && (
                  <button className="w-full text-left text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Adicionar endereço de entrega</span>
                  </button>
                )}
              </div>

              {/* Coupon Section */}
              <div className="p-3 bg-secondary/50 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Cupom de desconto</span>
                </div>
                
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-primary/10 p-2 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">{appliedCoupon.code}</span>
                      <span className="text-xs text-muted-foreground">
                        (-{appliedCoupon.discount_type === 'percentage' 
                          ? `${appliedCoupon.discount_value}%` 
                          : formatPrice(appliedCoupon.discount_value)})
                      </span>
                    </div>
                    <button 
                      onClick={removeCoupon}
                      className="text-xs text-destructive hover:underline"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Digite o código"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                    >
                      {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Points Section */}
              {user && (
                <div className="p-3 bg-secondary/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Usar pontos</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Você tem <span className="text-primary font-medium">{availablePoints}</span> pontos
                    </span>
                  </div>
                  
                  {availablePoints > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max={availablePoints}
                          value={pointsToRedeem}
                          onChange={(e) => handlePointsChange(parseInt(e.target.value))}
                          className="flex-1 accent-primary"
                        />
                        <div className="flex items-center gap-1 min-w-[80px]">
                          <input
                            type="number"
                            min="0"
                            max={availablePoints}
                            value={pointsToRedeem}
                            onChange={(e) => handlePointsChange(parseInt(e.target.value) || 0)}
                            className="w-16 bg-background border border-border rounded px-2 py-1 text-sm text-center"
                          />
                          <span className="text-xs text-muted-foreground">pts</span>
                        </div>
                      </div>
                      {pointsToRedeem > 0 && (
                        <p className="text-xs text-primary">
                          Desconto de {formatPrice(pointsDiscount)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Faça pedidos para acumular pontos! R$1 = 1 ponto
                    </p>
                  )}
                </div>
              )}

              {/* Points Earned Info */}
              {earnedPoints > 0 && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      Você ganhará <span className="font-semibold text-primary">{earnedPoints} pontos</span> com este pedido!
                    </span>
                  </div>
                </div>
              )}
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
                <span className={deliveryFee === 0 ? 'text-green-500' : ''}>
                  {deliveryFee === 0 ? 'Grátis' : formatPrice(deliveryFee)}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-primary">
                  <span>Desconto do cupom</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-sm text-primary">
                  <span>Desconto de pontos</span>
                  <span>-{formatPrice(pointsDiscount)}</span>
                </div>
              )}
              {subtotal < 150 && deliveryMode === 'delivery' && (
                <p className="text-xs text-muted-foreground">
                  Faltam {formatPrice(150 - subtotal)} para frete grátis
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
              className="w-full h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Finalizar Pedido
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
