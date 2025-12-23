import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, Clock, CheckCircle2, Truck, MapPin, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
}

interface Order {
  id: string;
  status: string;
  delivery_mode: string;
  subtotal: number;
  delivery_fee: number;
  coupon_discount: number;
  points_discount: number;
  total: number;
  points_earned: number;
  created_at: string;
  order_items?: OrderItem[];
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: 'Pedido Realizado', icon: Clock, color: 'text-yellow-500' },
  accepted: { label: 'Pedido Aceito', icon: CheckCircle2, color: 'text-blue-500' },
  preparing: { label: 'Preparando', icon: RefreshCw, color: 'text-orange-500' },
  sent: { label: 'Saiu para Entrega', icon: Truck, color: 'text-purple-500' },
  delivered: { label: 'Entregue', icon: MapPin, color: 'text-green-500' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'text-destructive' },
};

const statusOrder = ['pending', 'accepted', 'preparing', 'sent', 'delivered'];

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data as Order[]);
        if (data.length > 0 && !selectedOrder) {
          setSelectedOrder(data[0] as Order);
        }
      }
      setLoading(false);
    };

    fetchOrders();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setOrders((current) =>
            current.map((order) =>
              order.id === payload.new.id
                ? { ...order, ...payload.new }
                : order
            )
          );
          if (selectedOrder?.id === payload.new.id) {
            setSelectedOrder((prev) => prev ? { ...prev, ...payload.new } : null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedOrder?.id]);

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusIndex = (status: string) => statusOrder.indexOf(status);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h1 className="font-serif text-xl font-semibold">Meus Pedidos</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
              Nenhum pedido ainda
            </h2>
            <p className="text-muted-foreground mb-6">
              Faça seu primeiro pedido e acompanhe aqui!
            </p>
            <Button onClick={() => navigate('/')}>Ver cardápio</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-1 space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground mb-4">
                Histórico de pedidos
              </h2>
              {orders.map((order) => {
                const status = statusConfig[order.status];
                const StatusIcon = status?.icon || Clock;
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={cn(
                      "w-full p-4 rounded-lg border text-left transition-all",
                      selectedOrder?.id === order.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.created_at)}
                        </p>
                        <p className="font-semibold text-foreground mt-1">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                      <div className={cn("flex items-center gap-1 text-xs font-medium", status?.color)}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        <span>{status?.label}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {order.order_items?.length || 0} {order.order_items?.length === 1 ? 'item' : 'itens'}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Order Details */}
            {selectedOrder && (
              <div className="lg:col-span-2 space-y-6">
                {/* Status Timeline */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-serif text-lg font-semibold mb-6">
                    Acompanhe seu pedido
                  </h3>
                  
                  {selectedOrder.status === 'cancelled' ? (
                    <div className="flex items-center gap-3 text-destructive">
                      <XCircle className="h-8 w-8" />
                      <div>
                        <p className="font-medium">Pedido Cancelado</p>
                        <p className="text-sm text-muted-foreground">
                          Este pedido foi cancelado
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Progress Line */}
                      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />
                      <div 
                        className="absolute left-4 top-4 w-0.5 bg-primary transition-all duration-500"
                        style={{
                          height: `${(getStatusIndex(selectedOrder.status) / (statusOrder.length - 1)) * 100}%`,
                        }}
                      />

                      {/* Status Steps */}
                      <div className="space-y-6">
                        {statusOrder.map((status, index) => {
                          const config = statusConfig[status];
                          const Icon = config.icon;
                          const isActive = index <= getStatusIndex(selectedOrder.status);
                          const isCurrent = status === selectedOrder.status;

                          return (
                            <div key={status} className="flex items-center gap-4 relative">
                              <div
                                className={cn(
                                  "h-8 w-8 rounded-full flex items-center justify-center z-10 transition-all",
                                  isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground",
                                  isCurrent && "ring-4 ring-primary/20"
                                )}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <p
                                  className={cn(
                                    "font-medium",
                                    isActive ? "text-foreground" : "text-muted-foreground"
                                  )}
                                >
                                  {config.label}
                                </p>
                                {isCurrent && (
                                  <p className="text-xs text-primary animate-pulse">
                                    Status atual
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-serif text-lg font-semibold mb-4">
                    Itens do pedido
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {item.quantity}x {item.product_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.product_price)} cada
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatPrice(item.product_price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-serif text-lg font-semibold mb-4">
                    Resumo
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa de entrega</span>
                      <span>
                        {selectedOrder.delivery_fee === 0
                          ? 'Grátis'
                          : formatPrice(selectedOrder.delivery_fee)}
                      </span>
                    </div>
                    {selectedOrder.coupon_discount > 0 && (
                      <div className="flex justify-between text-primary">
                        <span>Desconto do cupom</span>
                        <span>-{formatPrice(selectedOrder.coupon_discount)}</span>
                      </div>
                    )}
                    {selectedOrder.points_discount > 0 && (
                      <div className="flex justify-between text-primary">
                        <span>Desconto de pontos</span>
                        <span>-{formatPrice(selectedOrder.points_discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(selectedOrder.total)}</span>
                    </div>
                    {selectedOrder.points_earned > 0 && (
                      <p className="text-xs text-muted-foreground pt-2">
                        Você ganhou {selectedOrder.points_earned} pontos com este pedido!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
