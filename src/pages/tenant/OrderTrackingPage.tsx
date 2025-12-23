import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Check, Clock, Truck, Package, ChefHat, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';

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
  delivery_address: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  restaurant_id?: string | null;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
}

const statusSteps = [
  { key: 'pending', label: 'Pendente', icon: Clock },
  { key: 'confirmed', label: 'Confirmado', icon: Check },
  { key: 'preparing', label: 'Preparando', icon: ChefHat },
  { key: 'ready', label: 'Pronto', icon: Package },
  { key: 'delivering', label: 'A caminho', icon: Truck },
  { key: 'delivered', label: 'Entregue', icon: Check },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-500' },
  preparing: { label: 'Preparando', color: 'bg-orange-500' },
  ready: { label: 'Pronto', color: 'bg-purple-500' },
  delivering: { label: 'A caminho', color: 'bg-cyan-500' },
  delivered: { label: 'Entregue', color: 'bg-green-500' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500' },
};

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      setLoading(true);
      try {
        // Fetch order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (orderError) throw orderError;
        
        // Cast to Order type - restaurant_id may not exist in old types
        const typedOrder = orderData as unknown as Order;
        setOrder(typedOrder);

        // Fetch order items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', id);

        if (itemsError) throw itemsError;
        setItems(itemsData || []);

        // Fetch restaurant if available
        const restaurantId = (orderData as any).restaurant_id;
        if (restaurantId) {
          const { data: restaurantData } = await supabase
            .from('restaurants')
            .select('id, name, slug, phone')
            .eq('id', restaurantId)
            .single();

          if (restaurantData) {
            setRestaurant(restaurantData);
          }
        }
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`order-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setOrder(prev => prev ? { ...prev, ...payload.new } as Order : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

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

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(s => s.key === status);
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Carregando pedido... - Delivery2U</title>
        </Helmet>
        <LandingHeader />
        <main className="pt-20 min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <LandingFooter />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Helmet>
          <title>Pedido não encontrado - Delivery2U</title>
        </Helmet>
        <LandingHeader />
        <main className="pt-20 min-h-screen bg-background">
          <div className="container max-w-lg mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              Pedido não encontrado
            </h1>
            <p className="text-muted-foreground mb-6">
              O pedido que você está procurando não existe.
            </p>
            <Button asChild>
              <Link to="/restaurantes">Ver restaurantes</Link>
            </Button>
          </div>
        </main>
        <LandingFooter />
      </>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const status = statusLabels[order.status] || statusLabels.pending;

  return (
    <>
      <Helmet>
        <title>Pedido #{order.id.slice(0, 8)} - Delivery2U</title>
      </Helmet>
      <LandingHeader />
      
      <main className="pt-20 min-h-screen bg-background pb-16">
        <div className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <Badge className={`${status.color} text-white mb-4`}>
              {status.label}
            </Badge>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Pedido #{order.id.slice(0, 8)}
            </h1>
            <p className="text-muted-foreground">
              {formatDate(order.created_at)}
            </p>
            {restaurant && (
              <p className="text-sm text-muted-foreground mt-1">
                {restaurant.name}
              </p>
            )}
          </div>

          {/* Status Timeline */}
          {order.status !== 'cancelled' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acompanhamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {statusSteps.slice(0, order.delivery_mode === 'pickup' ? -1 : undefined).map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;

                    return (
                      <div key={step.key} className="flex items-center gap-4 relative">
                        {/* Line */}
                        {index < statusSteps.length - 1 && (
                          <div 
                            className={`absolute left-5 top-10 w-0.5 h-8 ${
                              index < currentStatusIndex ? 'bg-primary' : 'bg-border'
                            }`} 
                          />
                        )}
                        
                        {/* Icon */}
                        <div 
                          className={`h-10 w-10 rounded-full flex items-center justify-center z-10 ${
                            isCompleted 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        {/* Label */}
                        <div className={`py-2 ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                          <p className="font-medium">{step.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhes do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.product_name}</span>
                  <span>{formatPrice(item.product_price * item.quantity)}</span>
                </div>
              ))}

              <Separator />

              {/* Totals */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de entrega</span>
                  <span>{order.delivery_fee > 0 ? formatPrice(order.delivery_fee) : 'Grátis'}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {order.delivery_mode === 'delivery' ? 'Entrega' : 'Retirada'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.delivery_mode === 'delivery' && order.delivery_address && (
                <p className="text-sm text-muted-foreground">
                  {order.delivery_address}
                </p>
              )}
              {order.delivery_mode === 'pickup' && restaurant && (
                <p className="text-sm text-muted-foreground">
                  Retire no restaurante
                </p>
              )}
              {order.notes && (
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Obs:</strong> {order.notes}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            {restaurant && (
              <Button variant="outline" className="flex-1" asChild>
                <Link to={`/r/${restaurant.slug}`}>Ver restaurante</Link>
              </Button>
            )}
            <Button variant="outline" className="flex-1" asChild>
              <Link to="/painel/cliente">Meus pedidos</Link>
            </Button>
          </div>
        </div>
      </main>

      <LandingFooter />
    </>
  );
}
