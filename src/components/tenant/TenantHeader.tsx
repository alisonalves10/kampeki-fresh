import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTenant } from '@/context/TenantContext';
import { useMarketplaceCart } from '@/context/MarketplaceCartContext';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';

export function TenantHeader() {
  const { slug } = useParams();
  const { restaurant, branding } = useTenant();
  const { totalItems, setIsCartOpen } = useMarketplaceCart();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!restaurant) return null;

  const logoUrl = branding?.logo_url || restaurant.logo_url;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={`/r/${slug}`} className="flex items-center gap-3">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={restaurant.name} 
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: branding?.primary_color || 'hsl(var(--primary))' }}
              >
                {restaurant.name.charAt(0)}
              </div>
            )}
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-foreground">{restaurant.name}</h1>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {restaurant.is_open ? (
                  <Badge variant="outline" className="text-green-600 border-green-600 text-[10px] px-1.5 py-0">
                    Aberto
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-600 text-[10px] px-1.5 py-0">
                    Fechado
                  </Badge>
                )}
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4">
            {restaurant.phone && (
              <a 
                href={`tel:${restaurant.phone}`}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4" />
                {restaurant.phone}
              </a>
            )}
            
            {user ? (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/painel/cliente">
                  <User className="h-4 w-4 mr-1.5" />
                  Minha Conta
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/login?next=/r/${slug}`}>
                  Entrar
                </Link>
              </Button>
            )}

            <Button 
              onClick={() => setIsCartOpen(true)}
              className="relative"
              style={{ 
                backgroundColor: branding?.primary_color || undefined,
              }}
            >
              <ShoppingBag className="h-4 w-4 mr-1.5" />
              Carrinho
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </nav>

          {/* Mobile Nav */}
          <div className="flex items-center gap-2 md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsCartOpen(true)}
              className="relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-6 mt-6">
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt={restaurant.name} 
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div 
                        className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: branding?.primary_color || 'hsl(var(--primary))' }}
                      >
                        {restaurant.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h2 className="font-display font-bold">{restaurant.name}</h2>
                      {restaurant.is_open ? (
                        <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                          Aberto
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                          Fechado
                        </Badge>
                      )}
                    </div>
                  </div>

                  {restaurant.address && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{restaurant.address}, {restaurant.city} - {restaurant.state}</span>
                    </div>
                  )}

                  {restaurant.phone && (
                    <a 
                      href={`tel:${restaurant.phone}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Phone className="h-4 w-4" />
                      {restaurant.phone}
                    </a>
                  )}

                  <div className="border-t pt-4 space-y-2">
                    {user ? (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        asChild
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link to="/painel/cliente">
                          <User className="h-4 w-4 mr-2" />
                          Minha Conta
                        </Link>
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        asChild
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link to={`/login?next=/r/${slug}`}>
                          Entrar
                        </Link>
                      </Button>
                    )}
                    
                    <Button 
                      className="w-full"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsCartOpen(true);
                      }}
                      style={{ 
                        backgroundColor: branding?.primary_color || undefined,
                      }}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Ver Carrinho ({totalItems})
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
