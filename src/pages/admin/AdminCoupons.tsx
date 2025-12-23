import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number | null;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const emptyCoupon = {
  code: '',
  discount_type: 'percentage' as 'percentage' | 'fixed',
  discount_value: 10,
  min_order_value: 0,
  max_uses: null as number | null,
  expires_at: '',
  is_active: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState(emptyCoupon);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCoupons(data as Coupon[]);
    }
    setLoading(false);
  };

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_order_value: coupon.min_order_value || 0,
        max_uses: coupon.max_uses,
        expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
        is_active: coupon.is_active,
      });
    } else {
      setEditingCoupon(null);
      setFormData(emptyCoupon);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
    setFormData(emptyCoupon);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const couponData = {
        code: formData.code.toUpperCase().trim(),
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        min_order_value: formData.min_order_value || 0,
        max_uses: formData.max_uses || null,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        is_active: formData.is_active,
      };

      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingCoupon.id);

        if (error) throw error;
        toast({ title: 'Cupom atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert(couponData);

        if (error) throw error;
        toast({ title: 'Cupom criado com sucesso!' });
      }

      closeModal();
      fetchCoupons();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o cupom',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cupom?')) return;

    const { error } = await supabase.from('coupons').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o cupom',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Cupom excluído com sucesso!' });
      fetchCoupons();
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !coupon.is_active })
      .eq('id', coupon.id);

    if (!error) {
      fetchCoupons();
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Código copiado!' });
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
    }).format(new Date(date));
  };

  const filteredCoupons = coupons.filter((coupon) => {
    if (searchQuery) {
      return coupon.code.toLowerCase().includes(searchQuery.toLowerCase());
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Cupons</h1>
          <p className="text-muted-foreground">Gerencie os cupons de desconto</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cupom
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por código..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Coupons Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Código
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Desconto
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Mín. Pedido
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Usos
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Validade
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum cupom encontrado
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-foreground">{coupon.code}</span>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}%`
                        : formatPrice(coupon.discount_value)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {coupon.min_order_value ? formatPrice(coupon.min_order_value) : '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {coupon.current_uses}
                      {coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {coupon.expires_at ? formatDate(coupon.expires_at) : 'Sem validade'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(coupon)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                          coupon.is_active
                            ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                            : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        )}
                      >
                        {coupon.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openModal(coupon)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteCoupon(coupon.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={closeModal} />
          <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-card rounded-xl border border-border z-50 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-serif text-lg font-semibold">
                {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="PROMOCAO10"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount_type">Tipo de Desconto *</Label>
                  <select
                    id="discount_type"
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    Valor {formData.discount_type === 'percentage' ? '(%)' : '(R$)'} *
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_order_value">Pedido Mínimo (R$)</Label>
                  <Input
                    id="min_order_value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.min_order_value || ''}
                    onChange={(e) => setFormData({ ...formData, min_order_value: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_uses">Máximo de Usos</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    min="1"
                    value={formData.max_uses || ''}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Ilimitado"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires_at">Data de Validade</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm">Cupom ativo</span>
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : editingCoupon ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
