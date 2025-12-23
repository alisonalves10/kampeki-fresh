import { Link, useParams } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTenant } from '@/context/TenantContext';
import { useMarketplaceCart } from '@/context/MarketplaceCartContext';
import { Separator } from '@/components/ui/separator';

export default function TenantCartPage() {
  const { slug } = useParams();
  const { restaurant, branding } = useTenant();
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useMarketplaceCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  if (!restaurant) return null;

  if (items.length === 0) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          Seu carrinho está vazio
        </h1>
        <p className="text-muted-foreground mb-6">
          Adicione itens do cardápio para continuar
        </p>
        <Button asChild>
          <Link to={`/r/${slug}`}>Ver Cardápio</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Seu Carrinho
        </h1>
        <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{restaurant.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.cartItemId} className="flex items-center gap-4">
              {item.product.image_url && (
                <img 
                  src={item.product.image_url} 
                  alt={item.product.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{item.product.name}</h3>
                <p className="text-sm text-muted-foreground">{formatPrice(item.product.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => removeItem(item.cartItemId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
        <Separator />
        <CardFooter className="flex-col items-stretch pt-4 gap-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Button 
            asChild 
            size="lg" 
            className="w-full"
            style={{ 
              backgroundColor: branding?.primary_color || undefined,
            }}
          >
            <Link to={`/r/${slug}/checkout`}>
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
