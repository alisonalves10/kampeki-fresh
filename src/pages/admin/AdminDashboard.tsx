import { useEffect, useState } from 'react';
import { ShoppingBag, DollarSign, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  todayOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    todayOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
      const pendingOrders = orders?.filter(o => ['pending', 'accepted', 'preparing'].includes(o.status)).length || 0;
      const todayOrders = orders?.filter(o => new Date(o.created_at) >= today).length || 0;

      setStats({ totalOrders, totalRevenue, pendingOrders, todayOrders });
      setRecentOrders(orders?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500' },
    accepted: { label: 'Aceito', color: 'bg-blue-500/10 text-blue-500' },
    preparing: { label: 'Preparando', color: 'bg-orange-500/10 text-orange-500' },
    sent: { label: 'Enviado', color: 'bg-purple-500/10 text-purple-500' },
    delivered: { label: 'Entregue', color: 'bg-green-500/10 text-green-500' },
    cancelled: { label: 'Cancelado', color: 'bg-red-500/10 text-red-500' },
  };

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
        <h1 className="font-serif text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu negócio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Pedidos</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold text-foreground">{formatPrice(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pedidos Pendentes</p>
              <p className="text-2xl font-bold text-foreground">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pedidos Hoje</p>
              <p className="text-2xl font-bold text-foreground">{stats.todayOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="font-serif text-lg font-semibold">Pedidos Recentes</h2>
        </div>
        <div className="divide-y divide-border">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum pedido encontrado
            </div>
          ) : (
            recentOrders.map((order) => {
              const status = statusLabels[order.status] || statusLabels.pending;
              return (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Pedido #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(Number(order.total))}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
