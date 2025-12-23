import { useState, useEffect } from 'react';
import { Helmet } from "react-helmet-async";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShoppingBag, AlertCircle } from "lucide-react";
import { RestaurantHeader } from "@/components/marketplace/RestaurantHeader";
import { RestaurantMenu } from "@/components/marketplace/RestaurantMenu";
import { MarketplaceCart } from "@/components/marketplace/MarketplaceCart";
import { useMarketplaceCart, MarketplaceProduct } from "@/context/MarketplaceCartContext";
import { Button } from "@/components/ui/button";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  whatsapp: string | null;
  is_open: boolean;
  is_active: boolean;
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  min_order_value: number;
}

export default function RestaurantPage() {
  const { slug } = useParams();
  const { totalItems, isCartOpen, setIsCartOpen } = useMarketplaceCart();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!slug) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch restaurant by slug
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('slug', slug)
          .single();

        if (restaurantError) {
          if (restaurantError.code === 'PGRST116') {
            setError('Restaurante não encontrado.');
          } else {
            throw restaurantError;
          }
          return;
        }

        if (!restaurantData.is_active) {
          setError('Este restaurante não está ativo no momento.');
          return;
        }

        setRestaurant(restaurantData);

        // Fetch products for this restaurant
        // For now, we'll use db_products with a category filter or create restaurant-specific products
        // This is a simplified version - in production, you'd have a restaurant_id on products
        const { data: productsData, error: productsError } = await supabase
          .from('db_products')
          .select('id, name, description, price, image_url, category')
          .eq('is_available', true)
          .order('sort_order', { ascending: true });

        if (productsError) throw productsError;

        setProducts(productsData || []);
      } catch (err) {
        console.error('Error fetching restaurant:', err);
        setError('Erro ao carregar o restaurante. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurant();
  }, [slug]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Carregando... - Delivery2U</title>
        </Helmet>
        <LandingHeader />
        <main className="pt-20 min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <LandingFooter />
      </>
    );
  }

  if (error || !restaurant) {
    return (
      <>
        <Helmet>
          <title>Restaurante não encontrado - Delivery2U</title>
        </Helmet>
        <LandingHeader />
        <main className="pt-20 min-h-screen bg-background">
          <div className="container-landing py-16 text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              {error || 'Restaurante não encontrado'}
            </h1>
            <p className="text-muted-foreground mb-6">
              O restaurante que você está procurando não existe ou não está disponível.
            </p>
            <Button onClick={() => window.history.back()}>
              Voltar
            </Button>
          </div>
        </main>
        <LandingFooter />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{restaurant.name} - Delivery2U</title>
        <meta name="description" content={restaurant.description || `Peça no ${restaurant.name} pelo Delivery2U`} />
      </Helmet>

      <LandingHeader />

      <main className="pt-20 min-h-screen bg-background pb-24">
        {/* Restaurant Header */}
        <RestaurantHeader restaurant={restaurant} />

        {/* Menu Section */}
        <div className="container-landing py-8">
          <h2 className="text-2xl font-display font-bold text-foreground mb-6">
            Cardápio
          </h2>
          
          <RestaurantMenu 
            products={products}
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
            restaurantSlug={restaurant.slug}
          />
        </div>
      </main>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setIsCartOpen(true)}
            size="lg"
            className="h-14 px-6 rounded-full shadow-lg glow-primary gap-2"
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

      <LandingFooter />
    </>
  );
}
