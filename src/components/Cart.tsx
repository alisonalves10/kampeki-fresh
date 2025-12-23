import { X, Minus, Plus, Trash2, ShoppingBag, Truck, MapPin, CreditCard, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
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
  const {
    items,
    updateQuantity,
    removeItem,
    subtotal,
    deliveryFee,
    total,
    deliveryMode,
  } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
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
            <h2 className="font-serif text-xl font-semibold">Meu Carrinho</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
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
                return (
                  <div
                    key={item.product.id}
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
                      <p className="text-primary font-semibold mt-1">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center bg-background rounded-lg border border-border">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-secondary rounded-l-lg transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-3 text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-secondary rounded-r-lg transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
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

              {/* Coupon */}
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <input
                    type="text"
                    placeholder="Código do cupom"
                    className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                  />
                  <Button variant="ghost" size="sm" className="text-primary">
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-4">
            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de entrega</span>
                <span className={deliveryFee === 0 ? 'text-success' : ''}>
                  {deliveryFee === 0 ? 'Grátis' : formatPrice(deliveryFee)}
                </span>
              </div>
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
            <Button className="w-full h-12 text-base bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
              <CreditCard className="h-5 w-5 mr-2" />
              Finalizar Pedido
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
