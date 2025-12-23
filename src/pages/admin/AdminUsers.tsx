import { useEffect, useState } from 'react';
import { Search, Shield, User, UserCog, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  phone: string | null;
  points: number;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'lojista' | 'user';
}

interface UserWithRole extends Profile {
  role: 'admin' | 'lojista' | 'user' | null;
  role_id: string | null;
}

const roleLabels: Record<string, { label: string; color: string; icon: typeof Shield }> = {
  admin: { label: 'Admin', color: 'bg-destructive/10 text-destructive', icon: Shield },
  lojista: { label: 'Lojista', color: 'bg-primary/10 text-primary', icon: UserCog },
  user: { label: 'Usuário', color: 'bg-secondary text-muted-foreground', icon: User },
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<UserWithRole | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          ...profile,
          role: userRole?.role as 'admin' | 'lojista' | 'user' | null,
          role_id: userRole?.id || null,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const openRoleModal = (user: UserWithRole) => {
    setSelectedUser(user);
    setNewRole(user.role || '');
    setIsModalOpen(true);
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      if (newRole === '' || newRole === 'none') {
        // Remove role if exists
        if (selectedUser.role_id) {
          const { error } = await supabase
            .from('user_roles')
            .delete()
            .eq('id', selectedUser.role_id);

          if (error) throw error;
        }
      } else if (selectedUser.role_id) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole as 'admin' | 'lojista' | 'user' })
          .eq('id', selectedUser.role_id);

        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert([{
            user_id: selectedUser.user_id,
            role: newRole as 'admin' | 'lojista' | 'user',
          }]);

        if (error) throw error;
      }

      toast.success('Role atualizada com sucesso');
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Erro ao atualizar role');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteConfirm?.role_id) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', deleteConfirm.role_id);

      if (error) throw error;

      toast.success('Role removida com sucesso');
      setDeleteConfirm(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Erro ao remover role');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery) ||
      user.user_id.includes(searchQuery);

    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'none' && !user.role) ||
      user.role === roleFilter;

    return matchesSearch && matchesRole;
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
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">Usuários</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie usuários e suas permissões no sistema
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou ID..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="lojista">Lojista</SelectItem>
            <SelectItem value="user">Usuário</SelectItem>
            <SelectItem value="none">Sem role</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Usuário
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Telefone
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Pontos
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Role
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Cadastro
                </th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => {
                const roleInfo = user.role ? roleLabels[user.role] : null;
                const RoleIcon = roleInfo?.icon || User;

                return (
                  <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {user.name || 'Sem nome'}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {user.user_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {user.phone || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground font-medium">
                      {user.points}
                    </td>
                    <td className="px-4 py-3">
                      {roleInfo ? (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {roleInfo.label}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openRoleModal(user)}
                        >
                          {user.role ? (
                            <>
                              <UserCog className="h-4 w-4 mr-1" />
                              Editar
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              Atribuir
                            </>
                          )}
                        </Button>
                        {user.role && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirm(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.role ? 'Editar Role' : 'Atribuir Role'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.name || 'Usuário sem nome'} ({selectedUser?.user_id.slice(0, 8)}...)
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Role do usuário
            </label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem role</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="lojista">Lojista</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Admin:</strong> Acesso total, incluindo gerenciamento de usuários<br />
              <strong>Lojista:</strong> Gerencia produtos, pedidos e cupons<br />
              <strong>Usuário:</strong> Role padrão sem acesso ao painel
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRoleUpdate} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover role do usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              A role "{deleteConfirm?.role}" será removida de {deleteConfirm?.name || 'este usuário'}.
              O usuário perderá acesso às funcionalidades associadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}