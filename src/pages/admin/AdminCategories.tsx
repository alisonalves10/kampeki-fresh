import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

const emptyCategory = {
  name: '',
  icon: '🍣',
  sort_order: 0,
  is_active: true,
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState(emptyCategory);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order');

    if (!error && data) {
      setCategories(data);
    }
    setLoading(false);
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        icon: category.icon,
        sort_order: category.sort_order,
        is_active: category.is_active,
      });
    } else {
      setEditingCategory(null);
      setFormData({ ...emptyCategory, sort_order: categories.length });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData(emptyCategory);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast({ title: 'Categoria atualizada com sucesso!' });
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(formData);

        if (error) throw error;
        toast({ title: 'Categoria criada com sucesso!' });
      }

      closeModal();
      fetchCategories();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar a categoria',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Os produtos desta categoria ficarão sem categoria.')) return;

    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a categoria',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Categoria excluída com sucesso!' });
      fetchCategories();
    }
  };

  const toggleActive = async (category: Category) => {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !category.is_active })
      .eq('id', category.id);

    if (!error) {
      fetchCategories();
    }
  };

  const moveCategory = async (category: Category, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === category.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const targetCategory = categories[targetIndex];
    
    await Promise.all([
      supabase.from('categories').update({ sort_order: targetCategory.sort_order }).eq('id', category.id),
      supabase.from('categories').update({ sort_order: category.sort_order }).eq('id', targetCategory.id),
    ]);

    fetchCategories();
  };

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
          <h1 className="font-serif text-2xl font-bold text-foreground">Categorias</h1>
          <p className="text-muted-foreground">Gerencie as categorias do cardápio</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">Nenhuma categoria cadastrada</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className={cn(
                  "flex items-center justify-between p-4 transition-opacity",
                  !category.is_active && "opacity-50"
                )}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="font-medium text-foreground">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">Ordem: {category.sort_order}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveCategory(category, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveCategory(category, 'down')}
                    disabled={index === categories.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(category)}
                  >
                    {category.is_active ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openModal(category)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={closeModal} />
          <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-card rounded-xl border border-border z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-serif text-lg font-semibold">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Ícone (emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🍣"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-border"
                />
                <Label htmlFor="is_active">Categoria ativa</Label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : editingCategory ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}