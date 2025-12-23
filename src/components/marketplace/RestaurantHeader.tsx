import { Store, MapPin, Clock, Star, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  min_order_value: number;
}

interface RestaurantHeaderProps {
  restaurant: Restaurant;
}

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <>
      {/* Cover */}
      <div className="h-48 md:h-64 bg-gradient-teal relative overflow-hidden">
        {restaurant.cover_url && (
          <img 
            src={restaurant.cover_url} 
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>
      
      {/* Restaurant Info Card */}
      <div className="container-landing -mt-16 relative z-10">
        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
          <div className="flex flex-col md:flex-row items-start gap-4">
            {/* Logo */}
            <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-background shadow-md flex-shrink-0">
              {restaurant.logo_url ? (
                <img 
                  src={restaurant.logo_url} 
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store className="h-12 w-12 text-primary" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  {restaurant.name}
                </h1>
                <Badge 
                  variant={restaurant.is_open ? "default" : "secondary"}
                  className={restaurant.is_open 
                    ? "bg-d2u-green/10 text-d2u-green border-d2u-green/20" 
                    : "bg-destructive/10 text-destructive border-destructive/20"
                  }
                >
                  {restaurant.is_open ? 'Aberto' : 'Fechado'}
                </Badge>
              </div>

              {restaurant.description && (
                <p className="text-muted-foreground mb-3">{restaurant.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-accent fill-accent" /> 4.8
                </span>
                {restaurant.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> 
                    {restaurant.city}, {restaurant.state}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> 30-45 min
                </span>
                {restaurant.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" /> {restaurant.phone}
                  </span>
                )}
              </div>

              {/* Delivery/Pickup Info */}
              <div className="flex flex-wrap gap-2 mt-3">
                {restaurant.delivery_enabled && (
                  <Badge variant="outline" className="text-xs">
                    🚴 Delivery
                  </Badge>
                )}
                {restaurant.pickup_enabled && (
                  <Badge variant="outline" className="text-xs">
                    🏪 Retirada
                  </Badge>
                )}
                {restaurant.min_order_value > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Pedido mín: {formatPrice(restaurant.min_order_value)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
