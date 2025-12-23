import { useState, useMemo } from 'react';
import { RestaurantProductCard } from './RestaurantProductCard';
import { MarketplaceProduct } from '@/context/MarketplaceCartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RestaurantMenuProps {
  products: MarketplaceProduct[];
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
}

export function RestaurantMenu({ 
  products, 
  restaurantId, 
  restaurantName,
  restaurantSlug 
}: RestaurantMenuProps) {
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return ['Todos', ...cats];
  }, [products]);

  const [activeCategory, setActiveCategory] = useState('Todos');

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'Todos') return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">
          Este restaurante ainda não possui produtos cadastrados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category)}
            className={cn(
              "flex-shrink-0 transition-all",
              activeCategory === category && "glow-primary"
            )}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <RestaurantProductCard
            key={product.id}
            product={product}
            restaurantId={restaurantId}
            restaurantName={restaurantName}
            restaurantSlug={restaurantSlug}
          />
        ))}
      </div>
    </div>
  );
}
