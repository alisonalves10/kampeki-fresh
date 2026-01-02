import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Store, Users, ShoppingBag, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  totalRestaurants: number;
  activeRestaurants: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingRestaurants: number;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  city: string | null;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRestaurants: 0,
    activeRestaurants: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingRestaurants: 0,
  });
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch restaurants
      const { data: restaurantsData } = await supabase
        .from('restaurants')
        .select('id, name, slug, is_active, created_at, city')
        .order('created_at', { ascending: false });
      
      const restaurantsList = restaurantsData || [];
      setRestaurants(restaurantsList);

      const totalRestaurants = restaurantsList.length;
      const activeRestaurants = restaurantsList.filter(r => r.is_active).length;
      const pendingRestaurants = restaurantsList.filter(r => !r.is_active).length;

      // Fetch users count
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id');
      const totalUsers = profiles?.length || 0;

      // Fetch orders stats
      const { data: orders } = await supabase
        .from('orders')
        .select('id, total');
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

      setStats({
        totalRestaurants,
        activeRestaurants,
        totalUsers,
        totalOrders,
        totalRevenue,
        pendingRestaurants,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRestaurantStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setRestaurants(prev =>
        prev.map(r => r.id === id ? { ...r, is_active: !currentStatus } : r)
      );

      toast.success(currentStatus ? 'Restaurante desativado' : 'Restaurante ativado');
      fetchData();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast.error('Erro ao atualizar restaurante');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const statCards = [
    {
      title: 'Restaurantes',
      value: stats.totalRestaurants,
      subtitle: `${stats.activeRestaurants} ativos`,
      icon: Store,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Usuários',
      value: stats.totalUsers,
      subtitle: 'cadastrados',
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Pedidos',
      value: stats.totalOrders,
      subtitle: 'realizados',
      icon: ShoppingBag,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Faturamento',
      value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: 'total da plataforma',
      icon: TrendingUp,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da plataforma</p>
      </div>

      {/* Alert for pending restaurants */}
      {stats.pendingRestaurants > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {stats.pendingRestaurants} restaurante{stats.pendingRestaurants > 1 ? 's' : ''} pendente{stats.pendingRestaurants > 1 ? 's' : ''} de aprovação
              </p>
              <p className="text-sm text-muted-foreground">
                Revise a lista abaixo para ativar
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={cn(stat.bgColor, 'h-8 w-8 rounded-full flex items-center justify-center')}>
                  <Icon className={cn('h-4 w-4', stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Restaurants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurantes</CardTitle>
          <CardDescription>Lista de todos os restaurantes cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Subdomínio</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Store className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhum restaurante cadastrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                restaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell className="font-medium">{restaurant.name}</TableCell>
                    <TableCell className="font-mono text-sm">{restaurant.slug}</TableCell>
                    <TableCell>{restaurant.city || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={restaurant.is_active ? 'default' : 'secondary'}>
                        {restaurant.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(restaurant.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={restaurant.is_active ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => toggleRestaurantStatus(restaurant.id, restaurant.is_active)}
                      >
                        {restaurant.is_active ? (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Ativar
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
