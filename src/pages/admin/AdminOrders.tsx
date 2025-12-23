import { useEffect, useState } from 'react';
import { Search, ChevronDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  total: number;
  created_at: string;
  delivery_address: string | null;
  notes: string | null;
  order_items?: OrderItem[];
}

const statusOptions = [
  { value: 'pending', label: 'Pendente', color: 'bg-yellow-500' },
  { value: 'accepted', label: 'Aceito', color: 'bg-blue-500' },
  { value: 'preparing', label: 'Preparando', color: 'bg-orange-500' },
  { value: 'sent', label: 'Enviado', color: 'bg-purple-500' },
  { value: 'delivered', label: 'Entregue', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-500' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`*, order_items(*)`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as Order[]);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Status atualizado',
        description: `Pedido alterado para ${statusOptions.find(s => s.value === newStatus)?.label}`,
      });
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return order.id.toLowerCase().includes(query);
    }
    return true;
  });

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
        <h1 className="font-serif text-2xl font-bold text-foreground">Pedidos</h1>
        <p className="text-muted-foreground">Gerencie todos os pedidos</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por ID do pedido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-4 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="all">Todos os status</option>
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                    Pedido
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                    Data
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                    Total
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum pedido encontrado
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const status = statusOptions.find((s) => s.value === order.status);
                    return (
                      <tr
                        key={order.id}
                        className={cn(
                          "hover:bg-secondary/30 transition-colors cursor-pointer",
                          selectedOrder?.id === order.id && "bg-secondary/50"
                        )}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">#{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.delivery_mode === 'delivery' ? 'Entrega' : 'Retirada'}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.id, e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className={cn(
                                "appearance-none px-3 py-1 pr-8 rounded-full text-xs font-medium text-white cursor-pointer focus:outline-none",
                                status?.color
                              )}
                            >
                              {statusOptions.map((s) => (
                                <option key={s.value} value={s.value} className="text-foreground bg-background">
                                  {s.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white pointer-events-none" />
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {formatPrice(Number(order.total))}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-card rounded-xl border border-border p-5">
          {selectedOrder ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-semibold">
                  Pedido #{selectedOrder.id.slice(0, 8)}
                </h3>
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium text-white",
                  statusOptions.find(s => s.value === selectedOrder.status)?.color
                )}>
                  {statusOptions.find(s => s.value === selectedOrder.status)?.label}
                </span>
              </div>

              <div className="text-sm space-y-2">
                <p className="text-muted-foreground">
                  Data: <span className="text-foreground">{formatDate(selectedOrder.created_at)}</span>
                </p>
                <p className="text-muted-foreground">
                  Tipo: <span className="text-foreground">
                    {selectedOrder.delivery_mode === 'delivery' ? 'Entrega' : 'Retirada'}
                  </span>
                </p>
                {selectedOrder.delivery_address && (
                  <p className="text-muted-foreground">
                    Endereço: <span className="text-foreground">{selectedOrder.delivery_address}</span>
                  </p>
                )}
                {selectedOrder.notes && (
                  <p className="text-muted-foreground">
                    Observações: <span className="text-foreground">{selectedOrder.notes}</span>
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-medium mb-3">Itens</h4>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.product_name}
                      </span>
                      <span className="text-foreground">
                        {formatPrice(item.product_price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(Number(selectedOrder.subtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de entrega</span>
                  <span>{formatPrice(Number(selectedOrder.delivery_fee))}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(Number(selectedOrder.total))}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Eye className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                Selecione um pedido para ver os detalhes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
