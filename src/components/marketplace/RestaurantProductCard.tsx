import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMarketplaceCart, MarketplaceProduct } from '@/context/MarketplaceCartContext';

interface RestaurantProductCardProps {
  product: MarketplaceProduct;
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
}

export function RestaurantProductCard({ 
  product, 
  restaurantId, 
  restaurantName,
  restaurantSlug 
}: RestaurantProductCardProps) {
  const { addItem } = useMarketplaceCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handleAddToCart = () => {
    addItem(product, restaurantId, restaurantName, restaurantSlug);
  };

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/30">
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          <Button 
            size="sm" 
            onClick={handleAddToCart}
            className="gap-1 glow-primary"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
}
