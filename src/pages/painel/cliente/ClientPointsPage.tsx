import { useState, useEffect } from 'react';
import { Star, Gift, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface PointsTransaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
}

export default function ClientPointsPage() {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('points_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setTransactions(data || []);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const points = profile?.points || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Meus Pontos</h1>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Saldo de pontos</p>
              <p className="text-4xl font-bold">{points.toLocaleString('pt-BR')}</p>
              <p className="text-sm opacity-80 mt-1">
                Equivale a {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(points)}
              </p>
            </div>
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Star className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Como funciona
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• A cada R$ 1 em pedidos, você ganha 1 ponto</p>
          <p>• Pontos são creditados quando o pedido é entregue</p>
          <p>• Use seus pontos como desconto em pedidos futuros</p>
          <p>• 1 ponto = R$ 1 de desconto</p>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma movimentação de pontos ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      tx.type === 'earned' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                    }`}>
                      {tx.type === 'earned' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {tx.description || (tx.type === 'earned' ? 'Pontos ganhos' : 'Pontos utilizados')}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                    </div>
                  </div>
                  <Badge variant={tx.type === 'earned' ? 'default' : 'secondary'} className={
                    tx.type === 'earned' ? 'bg-green-500' : 'bg-red-500'
                  }>
                    {tx.type === 'earned' ? '+' : '-'}{tx.amount}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
