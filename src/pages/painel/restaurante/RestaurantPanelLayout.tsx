import { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  LogOut, 
  Menu, 
  X, 
  ChevronLeft, 
  Store,
  BarChart3,
  Settings,
  Palette,
  FolderOpen,
  Puzzle,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}

const navItems: NavItem[] = [
  { path: '/painel/restaurante', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/painel/restaurante/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { path: '/painel/restaurante/produtos', label: 'Produtos', icon: Package },
  { path: '/painel/restaurante/categorias', label: 'Categorias', icon: FolderOpen },
  { path: '/painel/restaurante/complementos', label: 'Complementos', icon: Puzzle },
  { path: '/painel/restaurante/cupons', label: 'Cupons', icon: Tag },
  { path: '/painel/restaurante/relatorios', label: 'Relatórios', icon: BarChart3 },
  { path: '/painel/restaurante/personalizacao', label: 'Personalização', icon: Palette },
  { path: '/painel/restaurante/configuracoes', label: 'Configurações', icon: Settings },
];

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export default function RestaurantPanelLayout() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLojista, setIsLojista] = useState<boolean | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkLojistaRole();
    }
  }, [user, authLoading, navigate]);

  const checkLojistaRole = async () => {
    if (!user?.id) {
      setIsLojista(false);
      return;
    }

    console.log('Checking role for user:', user.id);

    // Wait a bit for trigger to create role (if user just signed up)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check for lojista or admin role - try multiple times
    let roleData = null;
    let attempts = 0;
    const maxAttempts = 10;

    while (!roleData && attempts < maxAttempts) {
      const { data, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'lojista'])
        .maybeSingle();

      if (roleError) {
        console.error('Error checking role (attempt', attempts + 1, '):', roleError);
      } else if (data) {
        roleData = data;
        console.log('User role found:', data.role);
        break;
      } else {
        console.log('Role not found yet (attempt', attempts + 1, ')');
      }

      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    // If still no role after all attempts, try to create it manually (fallback)
    if (!roleData) {
      console.warn('Role not found after', maxAttempts, 'attempts. Trying to create role manually...');
      
      // Try to create the role as a fallback
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role: 'lojista' })
        .select()
        .maybeSingle();

      if (!insertError) {
        console.log('Role created manually as fallback');
        roleData = { role: 'lojista' };
      } else {
        console.error('Failed to create role manually:', insertError);
        console.error('User does not have lojista or admin role and could not be created');
        setIsLojista(false);
        return;
      }
    }

    setIsLojista(true);

    // Fetch profile to get tenant_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      setRestaurant(null);
      return;
    }

    if (!profileData) {
      console.log('Profile not found for user');
      setRestaurant(null);
      return;
    }

    console.log('Profile tenant_id:', profileData.tenant_id);

    // If no tenant_id, user is not linked to a restaurant yet
    // But they can still access the panel (they'll need to create/link a restaurant)
    if (!profileData.tenant_id) {
      console.log('User has no tenant_id - not linked to restaurant yet');
      setRestaurant(null);
      // Allow access to panel even without tenant_id - they can create restaurant in settings
      return;
    }

    // Fetch restaurant using tenant_id
    const { data: restaurantData, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name, slug, logo_url')
      .eq('id', profileData.tenant_id)
      .maybeSingle();

    if (restaurantError) {
      console.error('Error fetching restaurant:', restaurantError);
      setRestaurant(null);
      return;
    }

    if (restaurantData) {
      console.log('Restaurant found:', restaurantData.name);
      setRestaurant(restaurantData);
    } else {
      console.log('Restaurant not found for tenant_id:', profileData.tenant_id);
      setRestaurant(null);
    }
  };

  if (authLoading || isLojista === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isLojista) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-foreground mb-2">
            Acesso Negado
          </h1>
          <p className="text-muted-foreground mb-2">
            Você não tem permissão para acessar o painel do restaurante.
          </p>
          <p className="text-sm text-muted-foreground/70 mb-6">
            Para acessar este painel, você precisa ter o role "lojista" ou "admin" na tabela user_roles.
            <br />
            Verifique o console do navegador (F12) para mais detalhes.
          </p>
          <Button onClick={() => navigate('/')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  // Allow access even without restaurant - user can create one in settings
  // The dashboard and other pages will handle the case when restaurant is null

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              {restaurant?.logo_url ? (
                <img 
                  src={restaurant.logo_url} 
                  alt={restaurant.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <Store className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
              <div className="overflow-hidden">
                <h1 className="font-serif text-lg font-semibold text-foreground truncate">
                  {restaurant?.name || 'Meu Restaurante'}
                </h1>
                <p className="text-xs text-muted-foreground">Painel do Lojista</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? location.pathname === item.path 
                : location.pathname.startsWith(item.path) && item.path !== '/painel/restaurante';
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive || (item.exact && location.pathname === item.path)
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

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-2">
            {restaurant && (
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => window.open(`/r/${restaurant.slug}`, '_blank')}
              >
                <Store className="h-4 w-4 mr-2" />
                Ver minha loja
              </Button>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate('/')}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar ao site
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
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">
                  {restaurant?.name || 'Lojista'}
                </span>
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet context={{ restaurant }} />
        </main>
      </div>
    </div>
  );
}
