import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, User, MapPin, Clock, Gift, Menu, X, Search, LogOut, Package, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onCartClick?: () => void;
}

export const Header = ({ onCartClick }: HeaderProps) => {
  const { totalItems, deliveryMode, setDeliveryMode } = useCart();
  const { user, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminRole();
  }, [user]);

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Main Header */}
      <div className="bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center glow-primary">
              <span className="text-primary-foreground font-serif font-bold text-lg">K</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-serif text-xl font-semibold text-foreground">Kampeki Sushi</h1>
              <p className="text-xs text-muted-foreground">Culinária Japonesa Premium</p>
            </div>
          </div>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar no cardápio..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Points - Desktop */}
            <Button variant="ghost" size="sm" className="hidden lg:flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <Gift className="h-4 w-4 text-primary" />
              <span className="text-sm">{profile?.points ?? 0} pts</span>
            </Button>

            {/* Admin Panel - Desktop (only for admins) */}
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden lg:flex items-center gap-2 text-primary hover:text-primary/80"
                onClick={() => navigate('/admin')}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="text-sm">Painel Admin</span>
              </Button>
            )}

            {/* Orders - Desktop (only when logged in) */}
            {user && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden lg:flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => navigate('/orders')}
                >
                  <Package className="h-4 w-4" />
                  <span className="text-sm">Pedidos</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden lg:flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => navigate('/profile')}
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">Minha Conta</span>
                </Button>
              </>
            )}

            {/* Login/User */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden sm:flex items-center gap-2"
              onClick={handleAuthClick}
            >
              {user ? (
                <>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Sair</span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Entrar</span>
                </>
              )}
            </Button>

            {/* User Name Badge - when logged in */}
            {user && profile?.name && (
              <span className="hidden lg:inline text-sm text-muted-foreground">
                Olá, <span className="text-foreground font-medium">{profile.name.split(' ')[0]}</span>
              </span>
            )}

            {/* Cart Button */}
            {onCartClick && (
              <Button
                onClick={onCartClick}
                variant="default"
                size="sm"
                className="relative flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-medium animate-scale-in">
                    {totalItems}
                  </span>
                )}
                <span className="hidden sm:inline">Carrinho</span>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-card border-b border-border">
        <div className="container py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Address */}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-muted-foreground">Av. Dom Pedro II, 1203 - São João, Porto Alegre</span>
            </div>

            {/* Status & Delivery Toggle */}
            <div className="flex items-center gap-4">
              {/* Status */}
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-muted-foreground">Fechado</span>
                <Clock className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                <span className="text-muted-foreground">Abre às 18:00</span>
              </div>

              {/* Delivery/Pickup Toggle */}
              <div className="flex bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setDeliveryMode('delivery')}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                    deliveryMode === 'delivery'
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Entrega
                </button>
                <button
                  onClick={() => setDeliveryMode('pickup')}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                    deliveryMode === 'pickup'
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Retirada
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border animate-fade-in">
          <div className="container py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar no cardápio..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Mobile Actions */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={handleAuthClick}
                >
                  {user ? (
                    <>
                      <LogOut className="h-4 w-4" />
                      <span>Sair ({profile?.name?.split(' ')[0] ?? 'Usuário'})</span>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      <span>Entrar / Cadastrar</span>
                    </>
                  )}
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-primary">
                  <Gift className="h-4 w-4" />
                  <span>{profile?.points ?? 0} pontos</span>
                </Button>
              </div>
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-2 justify-start text-primary"
                  onClick={() => {
                    navigate('/admin');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Painel Admin</span>
                </Button>
              )}
              {user && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-2 justify-start"
                    onClick={() => {
                      navigate('/orders');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Package className="h-4 w-4" />
                    <span>Meus Pedidos</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-2 justify-start"
                    onClick={() => {
                      navigate('/profile');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4" />
                    <span>Minha Conta</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
