import { useState, useEffect } from 'react';
import { Plus, MapPin, Trash2, Star, Edit2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
}

export default function ClientAddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: 'Casa',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    zip_code: '',
  });

  useEffect(() => {
    if (!user) return;
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (address: Address) => {
    setEditingId(address.id);
    setForm({
      label: address.label,
      street: address.street,
      number: address.number,
      complement: address.complement || '',
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingId(null);
    setForm({
      label: 'Casa',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: 'SP',
      zip_code: '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    if (!form.street || !form.number || !form.neighborhood || !form.city) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('addresses')
          .update(form)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Endereço atualizado');
      } else {
        const { error } = await supabase
          .from('addresses')
          .insert({
            ...form,
            user_id: user.id,
            is_default: addresses.length === 0,
          });

        if (error) throw error;
        toast.success('Endereço adicionado');
      }

      setDialogOpen(false);
      fetchAddresses();
    } catch (err) {
      console.error('Error saving address:', err);
      toast.error('Erro ao salvar endereço');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja remover este endereço?')) return;

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Endereço removido');
      fetchAddresses();
    } catch (err) {
      console.error('Error deleting address:', err);
      toast.error('Erro ao remover endereço');
    }
  };

  const setDefault = async (id: string) => {
    if (!user) return;

    try {
      // Remove default from all
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set new default
      await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id);

      toast.success('Endereço padrão atualizado');
      fetchAddresses();
    } catch (err) {
      console.error('Error setting default:', err);
      toast.error('Erro ao definir endereço padrão');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-display font-bold">Meus Endereços</h1>
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Meus Endereços</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Endereço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Endereço' : 'Novo Endereço'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="label">Apelido</Label>
                <Input
                  id="label"
                  value={form.label}
                  onChange={(e) => setForm(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Casa, Trabalho..."
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="street">Rua *</Label>
                  <Input
                    id="street"
                    value={form.street}
                    onChange={(e) => setForm(prev => ({ ...prev, street: e.target.value }))}
                    placeholder="Nome da rua"
                  />
                </div>
                <div>
                  <Label htmlFor="number">Número *</Label>
                  <Input
                    id="number"
                    value={form.number}
                    onChange={(e) => setForm(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="123"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={form.complement}
                  onChange={(e) => setForm(prev => ({ ...prev, complement: e.target.value }))}
                  placeholder="Apto, bloco..."
                />
              </div>
              <div>
                <Label htmlFor="neighborhood">Bairro *</Label>
                <Input
                  id="neighborhood"
                  value={form.neighborhood}
                  onChange={(e) => setForm(prev => ({ ...prev, neighborhood: e.target.value }))}
                  placeholder="Bairro"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => setForm(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="UF"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="zip_code">CEP</Label>
                <Input
                  id="zip_code"
                  value={form.zip_code}
                  onChange={(e) => setForm(prev => ({ ...prev, zip_code: e.target.value }))}
                  placeholder="00000-000"
                />
              </div>
              <Button onClick={handleSubmit} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum endereço cadastrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <Card key={address.id} className={address.is_default ? 'border-primary' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{address.label}</p>
                        {address.is_default && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            Padrão
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {address.street}, {address.number}
                        {address.complement && ` - ${address.complement}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.neighborhood}, {address.city} - {address.state}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!address.is_default && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDefault(address.id)}
                        title="Definir como padrão"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(address)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(address.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
