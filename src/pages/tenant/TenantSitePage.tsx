import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/context/TenantContext';
import { useMarketplaceCart, MarketplaceProduct } from '@/context/MarketplaceCartContext';
import { TenantHero } from '@/components/tenant/TenantHero';
import { RestaurantMenu } from '@/components/marketplace/RestaurantMenu';
import { MarketplaceCart } from '@/components/marketplace/MarketplaceCart';

export default function TenantSitePage() {
  const { restaurant, branding } = useTenant();
  const { totalItems, isCartOpen, setIsCartOpen } = useMarketplaceCart();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurant) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch products for this restaurant
        const { data, error } = await (supabase
          .from('db_products')
          .select('id, name, description, price, image_url, category') as any)
          .eq('restaurant_id', restaurant.id)
          .eq('is_available', true)
          .order('sort_order', { ascending: true });

        if (error) throw error;
        setProducts((data || []) as MarketplaceProduct[]);
      } catch (err) {
        console.error('Error fetching products:', err);
        // Fallback: fetch all products if restaurant_id filter fails
        const { data } = await supabase
          .from('db_products')
          .select('id, name, description, price, image_url, category')
          .eq('is_available', true)
          .order('sort_order', { ascending: true });
        
        setProducts((data || []) as MarketplaceProduct[]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [restaurant]);

  if (!restaurant) return null;

  return (
    <>
      {/* Hero Section */}
      <TenantHero />

      {/* Menu Section */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-display font-bold text-foreground mb-6">
          Cardápio
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <RestaurantMenu 
            products={products}
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
            restaurantSlug={restaurant.slug}
          />
        )}
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setIsCartOpen(true)}
            size="lg"
            className="h-14 px-6 rounded-full shadow-lg gap-2"
            style={{ 
              backgroundColor: branding?.primary_color || undefined,
            }}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="font-semibold">{totalItems}</span>
          </Button>
        </div>
      )}

      {/* Cart Sidebar */}
      <MarketplaceCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  );
}
