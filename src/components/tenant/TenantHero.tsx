import { useTenant } from '@/context/TenantContext';
import { MapPin, Clock, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function TenantHero() {
  const { restaurant, branding } = useTenant();

  if (!restaurant) return null;

  const heroImage = branding?.header_image_url || restaurant.cover_url;
  const heroTitle = branding?.header_title || restaurant.name;
  const heroSubtitle = branding?.header_subtitle || restaurant.description;
  const logoUrl = branding?.logo_url || restaurant.logo_url;

  return (
    <section className="relative">
      {/* Hero Image */}
      <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
        {heroImage ? (
          <img 
            src={heroImage} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-accent" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container max-w-6xl mx-auto px-4 pb-6">
            <div className="flex items-end gap-4">
              {/* Logo */}
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={restaurant.name}
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl object-cover border-4 border-background shadow-lg flex-shrink-0"
                />
              ) : (
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-2xl border-4 border-background shadow-lg bg-primary flex-shrink-0">
                  {restaurant.name.charAt(0)}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground truncate">
                  {heroTitle}
                </h1>
                {heroSubtitle && (
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm sm:text-base">
                    {heroSubtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {/* Status */}
            {restaurant.is_open ? (
              <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                <Clock className="h-3 w-3 mr-1" />
                Aberto agora
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">
                <Clock className="h-3 w-3 mr-1" />
                Fechado
              </Badge>
            )}

            {/* Delivery/Pickup */}
            <div className="flex items-center gap-2">
              {restaurant.delivery_enabled && (
                <Badge variant="outline" className="text-xs">Entrega</Badge>
              )}
              {restaurant.pickup_enabled && (
                <Badge variant="outline" className="text-xs">Retirada</Badge>
              )}
            </div>

            {/* Min Order */}
            {restaurant.min_order_value > 0 && (
              <span className="text-muted-foreground hidden sm:inline">
                Pedido mínimo: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(restaurant.min_order_value)}
              </span>
            )}

            {/* Address */}
            {restaurant.city && (
              <span className="text-muted-foreground flex items-center gap-1 hidden md:flex">
                <MapPin className="h-3 w-3" />
                {restaurant.city}, {restaurant.state}
              </span>
            )}

            {/* Phone */}
            {restaurant.phone && (
              <a 
                href={`tel:${restaurant.phone}`}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 ml-auto"
              >
                <Phone className="h-3 w-3" />
                <span className="hidden sm:inline">{restaurant.phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
