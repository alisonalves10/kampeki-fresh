import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingBag, DollarSign, TrendingUp, Clock, Package, Users } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  totalProducts: number;
  monthlyRevenue: number;
  totalCustomers: number;
}

interface RecentOrder {
  id: string;
  total: number;
  status: string;
  created_at: string;
}

export default function RestaurantDashboard() {
  const { restaurant } = useOutletContext<{ restaurant: Restaurant | null }>();
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
    monthlyRevenue: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthISO = firstDayOfMonth.toISOString();

      // Today's orders
      const { data: todayOrdersData } = await supabase
        .from('orders')
        .select('id, total')
        .gte('created_at', todayISO);

      const todayOrders = todayOrdersData?.length || 0;
      const todayRevenue = todayOrdersData?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

      // Pending orders
      const { data: pendingOrdersData } = await supabase
        .from('orders')
        .select('id')
        .in('status', ['pending', 'confirmed', 'preparing']);

      const pendingOrders = pendingOrdersData?.length || 0;

      // Total products
      const { data: productsData } = await supabase
        .from('db_products')
        .select('id')
        .eq('is_available', true);

      const totalProducts = productsData?.length || 0;

      // Monthly revenue
      const { data: monthlyOrdersData } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', monthISO);

      const monthlyRevenue = monthlyOrdersData?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

      // Total customers (unique users who ordered)
      const { data: customersData } = await supabase
        .from('orders')
        .select('user_id');

      const uniqueCustomers = new Set(customersData?.map(o => o.user_id));
      const totalCustomers = uniqueCustomers.size;

      setStats({
        todayOrders,
        todayRevenue,
        pendingOrders,
        totalProducts,
        monthlyRevenue,
        totalCustomers,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select('id, total, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentOrders(data || []);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'Pendente', variant: 'secondary' },
      confirmed: { label: 'Confirmado', variant: 'default' },
      preparing: { label: 'Preparando', variant: 'default' },
      ready: { label: 'Pronto', variant: 'default' },
      delivered: { label: 'Entregue', variant: 'outline' },
      cancelled: { label: 'Cancelado', variant: 'destructive' },
    };
    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statCards = [
    {
      title: 'Pedidos Hoje',
      value: stats.todayOrders,
      icon: ShoppingBag,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Faturamento Hoje',
      value: `R$ ${stats.todayRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Pedidos Pendentes',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Faturamento Mensal',
      value: `R$ ${stats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Produtos Ativos',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      title: 'Total de Clientes',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
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
        <p className="text-muted-foreground">
          Visão geral do seu restaurante
          {restaurant && ` - ${restaurant.name}`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} h-8 w-8 rounded-full flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
          <CardDescription>Últimos pedidos recebidos</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhum pedido recente
            </p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Pedido #{order.id.substring(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(order.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <p className="font-medium text-foreground">
                      R$ {Number(order.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
