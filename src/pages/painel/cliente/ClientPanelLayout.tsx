import { useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, MapPin, Star, User, LogOut, ChevronLeft, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { path: '/painel/cliente', label: 'Meus Pedidos', icon: ShoppingBag, exact: true },
  { path: '/painel/cliente/enderecos', label: 'Endereços', icon: MapPin },
  { path: '/painel/cliente/pontos', label: 'Meus Pontos', icon: Star },
  { path: '/painel/cliente/perfil', label: 'Perfil', icon: User },
];

export default function ClientPanelLayout() {
  const { user, loading: authLoading, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?next=/painel/cliente');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const NavContent = () => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact 
          ? location.pathname === item.path 
          : location.pathname.startsWith(item.path);
        
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <div className="py-4">
                    <h2 className="font-display font-bold text-lg mb-6">Minha Conta</h2>
                    <NavContent />
                    <div className="mt-6 pt-6 border-t border-border space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => navigate('/restaurantes')}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Ver restaurantes
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={signOut}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Link to="/" className="font-display font-bold text-xl text-primary">
                Delivery2U
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                Olá, <span className="text-foreground font-medium">{profile?.name || 'Cliente'}</span>
              </span>
              <Button variant="ghost" size="sm" onClick={signOut} className="hidden md:flex">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h2 className="font-display font-bold text-lg mb-4">Minha Conta</h2>
              <NavContent />
              <div className="mt-6 pt-6 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/restaurantes')}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Ver restaurantes
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
