import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, Users, Shield, Store, User } from 'lucide-react';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  phone: string | null;
  points: number;
  created_at: string;
  roles: string[];
}

type AppRole = 'admin' | 'lojista' | 'user';

export default function SuperAdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<AppRole | ''>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Merge profiles with roles
      const usersWithRoles = (profiles || []).map(profile => ({
        ...profile,
        roles: roles?.filter(r => r.user_id === profile.user_id).map(r => r.role) || [],
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const addRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: selectedUser.user_id,
          role: newRole,
        });

      if (error) throw error;

      setUsers(prev =>
        prev.map(u =>
          u.id === selectedUser.id
            ? { ...u, roles: [...u.roles, newRole] }
            : u
        )
      );

      toast.success('Papel adicionado com sucesso');
      setNewRole('');
      setSelectedUser(prev => prev ? { ...prev, roles: [...prev.roles, newRole] } : null);
    } catch (error: any) {
      console.error('Error adding role:', error);
      if (error.code === '23505') {
        toast.error('Usuário já possui este papel');
      } else {
        toast.error('Erro ao adicionar papel');
      }
    }
  };

  const removeRole = async (role: string) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.user_id)
        .eq('role', role as 'admin' | 'lojista' | 'user');

      if (error) throw error;

      const updatedRoles = selectedUser.roles.filter(r => r !== role);
      
      setUsers(prev =>
        prev.map(u =>
          u.id === selectedUser.id
            ? { ...u, roles: updatedRoles }
            : u
        )
      );

      setSelectedUser(prev => prev ? { ...prev, roles: updatedRoles } : null);
      toast.success('Papel removido com sucesso');
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Erro ao remover papel');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'lojista':
        return <Store className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'lojista':
        return 'Lojista';
      default:
        return 'Usuário';
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
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
          <h1 className="text-2xl font-serif font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground">Gerencie usuários e seus papéis</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuário..."
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
                <TableHead>Usuário</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Pontos</TableHead>
                <TableHead>Papéis</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">
                        {user.name || 'Sem nome'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {user.phone || 'Não informado'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{user.points}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length === 0 ? (
                          <Badge variant="outline">
                            <User className="h-3 w-3 mr-1" />
                            Cliente
                          </Badge>
                        ) : (
                          user.roles.map((role) => (
                            <Badge
                              key={role}
                              variant={role === 'admin' ? 'default' : 'secondary'}
                            >
                              {getRoleIcon(role)}
                              <span className="ml-1">{getRoleLabel(role)}</span>
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        Gerenciar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Manage Roles Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Papéis</DialogTitle>
            <DialogDescription>
              {selectedUser?.name || 'Usuário sem nome'}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Papéis atuais</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.roles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum papel especial atribuído
                    </p>
                  ) : (
                    selectedUser.roles.map((role) => (
                      <Badge
                        key={role}
                        variant={role === 'admin' ? 'default' : 'secondary'}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => removeRole(role)}
                      >
                        {getRoleIcon(role)}
                        <span className="ml-1">{getRoleLabel(role)}</span>
                        <span className="ml-1">×</span>
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Select value={newRole} onValueChange={(v: string) => setNewRole(v as AppRole)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione um papel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="lojista">Lojista</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addRole} disabled={!newRole}>
                  Adicionar
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
