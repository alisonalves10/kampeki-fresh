import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock, Check, Truck, Package, ChefHat, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  delivery_mode: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-blue-500', icon: Check },
  preparing: { label: 'Preparando', color: 'bg-orange-500', icon: ChefHat },
  ready: { label: 'Pronto', color: 'bg-purple-500', icon: Package },
  delivering: { label: 'A caminho', color: 'bg-cyan-500', icon: Truck },
  delivered: { label: 'Entregue', color: 'bg-green-500', icon: Check },
  cancelled: { label: 'Cancelado', color: 'bg-red-500', icon: X },
};

export default function ClientOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, status, total, created_at, delivery_mode')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('client-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-display font-bold">Meus Pedidos</h1>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          Nenhum pedido ainda
        </h1>
        <p className="text-muted-foreground mb-6">
          Quando você fizer seu primeiro pedido, ele aparecerá aqui.
        </p>
        <Button asChild>
          <Link to="/restaurantes">Ver Restaurantes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Meus Pedidos</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status] || statusConfig.pending;
          const StatusIcon = status.icon;

          return (
            <Card key={order.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <Link to={`/pedido/${order.id}`} className="block">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full ${status.color} flex items-center justify-center`}>
                        <StatusIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Pedido #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${status.color} text-white mb-1`}>
                        {status.label}
                      </Badge>
                      <p className="text-sm font-semibold text-foreground">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
