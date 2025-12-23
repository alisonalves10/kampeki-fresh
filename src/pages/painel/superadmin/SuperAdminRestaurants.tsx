import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, Store, ExternalLink, Phone, MapPin } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  phone: string | null;
  whatsapp: string | null;
  is_active: boolean;
  is_open: boolean;
  created_at: string;
  owner_id: string;
}

export default function SuperAdminRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Erro ao carregar restaurantes');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (restaurant: Restaurant) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({ is_active: !restaurant.is_active })
        .eq('id', restaurant.id);

      if (error) throw error;

      setRestaurants(prev =>
        prev.map(r =>
          r.id === restaurant.id ? { ...r, is_active: !r.is_active } : r
        )
      );

      toast.success(
        restaurant.is_active 
          ? 'Restaurante desativado' 
          : 'Restaurante ativado'
      );
    } catch (error) {
      console.error('Error toggling restaurant:', error);
      toast.error('Erro ao atualizar restaurante');
    }
  };

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.slug.toLowerCase().includes(search.toLowerCase()) ||
    r.city?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Restaurantes</h1>
          <p className="text-muted-foreground">Gerencie todos os restaurantes da plataforma</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar restaurante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurante</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRestaurants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Store className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhum restaurante encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRestaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{restaurant.name}</p>
                        <p className="text-sm text-muted-foreground">/{restaurant.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm">
                          {restaurant.city ? `${restaurant.city}, ${restaurant.state}` : 'Não informado'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={restaurant.is_open ? 'default' : 'secondary'}>
                        {restaurant.is_open ? 'Aberto' : 'Fechado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={restaurant.is_active}
                        onCheckedChange={() => toggleActive(restaurant)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRestaurant(restaurant)}
                        >
                          Detalhes
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <a href={`/r/${restaurant.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!selectedRestaurant} onOpenChange={() => setSelectedRestaurant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRestaurant?.name}</DialogTitle>
            <DialogDescription>Detalhes do restaurante</DialogDescription>
          </DialogHeader>
          {selectedRestaurant && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Slug</p>
                  <p className="font-medium">{selectedRestaurant.slug}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedRestaurant.is_active ? 'default' : 'secondary'}>
                    {selectedRestaurant.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cidade</p>
                  <p className="font-medium">{selectedRestaurant.city || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="font-medium">{selectedRestaurant.state || 'SP'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{selectedRestaurant.phone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{selectedRestaurant.whatsapp || 'Não informado'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Criado em</p>
                <p className="font-medium">
                  {new Date(selectedRestaurant.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" asChild>
                  <a href={`/r/${selectedRestaurant.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver loja
                  </a>
                </Button>
                <Button
                  variant={selectedRestaurant.is_active ? 'destructive' : 'default'}
                  className="flex-1"
                  onClick={() => {
                    toggleActive(selectedRestaurant);
                    setSelectedRestaurant(null);
                  }}
                >
                  {selectedRestaurant.is_active ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
