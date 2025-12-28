import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AddonOption {
  id: string;
  group_id: string;
  name: string;
  additional_price: number;
  is_available: boolean;
  sort_order: number;
}

interface AddonGroup {
  id: string;
  name: string;
  description: string | null;
  min_selections: number;
  max_selections: number;
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
  restaurant_id: string | null;
  options?: AddonOption[];
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

const emptyGroup = {
  name: '',
  description: '',
  min_selections: 0,
  max_selections: 1,
  is_required: false,
  is_active: true,
  sort_order: 0,
};

const emptyOption = {
  name: '',
  additional_price: 0,
  is_available: true,
  sort_order: 0,
};

export default function RestaurantAddons() {
  const { restaurant } = useOutletContext<{ restaurant: Restaurant | null }>();
  const [groups, setGroups] = useState<AddonGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AddonGroup | null>(null);
  const [editingOption, setEditingOption] = useState<AddonOption | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupFormData, setGroupFormData] = useState(emptyGroup);
  const [optionFormData, setOptionFormData] = useState(emptyOption);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (restaurant?.id) {
      fetchGroups();
    }
  }, [restaurant?.id]);

  const fetchGroups = async () => {
    if (!restaurant?.id) return;

    const { data: groupsData, error: groupsError } = await supabase
      .from('addon_groups')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('sort_order');

    if (groupsError) {
      setLoading(false);
      return;
    }

    const groupIds = (groupsData || []).map(g => g.id);
    
    let optionsData: AddonOption[] = [];
    if (groupIds.length > 0) {
      const { data } = await supabase
        .from('addon_options')
        .select('*')
        .in('group_id', groupIds)
        .order('sort_order');
      optionsData = data || [];
    }

    const groupsWithOptions = (groupsData || []).map(group => ({
      ...group,
      options: optionsData.filter(opt => opt.group_id === group.id),
    }));

    setGroups(groupsWithOptions);
    setLoading(false);
  };

  const toggleExpanded = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const openGroupModal = (group?: AddonGroup) => {
    if (group) {
      setEditingGroup(group);
      setGroupFormData({
        name: group.name,
        description: group.description || '',
        min_selections: group.min_selections,
        max_selections: group.max_selections,
        is_required: group.is_required,
        is_active: group.is_active,
        sort_order: group.sort_order,
      });
    } else {
      setEditingGroup(null);
      setGroupFormData({ ...emptyGroup, sort_order: groups.length });
    }
    setIsGroupModalOpen(true);
  };

  const closeGroupModal = () => {
    setIsGroupModalOpen(false);
    setEditingGroup(null);
    setGroupFormData(emptyGroup);
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant?.id) return;
    setSaving(true);

    try {
      if (editingGroup) {
        const { error } = await supabase
          .from('addon_groups')
          .update(groupFormData)
          .eq('id', editingGroup.id);

        if (error) throw error;
        toast({ title: 'Grupo atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('addon_groups')
          .insert({ ...groupFormData, restaurant_id: restaurant.id });

        if (error) throw error;
        toast({ title: 'Grupo criado com sucesso!' });
      }

      closeGroupModal();
      fetchGroups();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o grupo',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteGroup = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este grupo? Todas as opções serão excluídas também.')) return;

    const { error } = await supabase.from('addon_groups').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o grupo',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Grupo excluído com sucesso!' });
      fetchGroups();
    }
  };

  const openOptionModal = (groupId: string, option?: AddonOption) => {
    setSelectedGroupId(groupId);
    if (option) {
      setEditingOption(option);
      setOptionFormData({
        name: option.name,
        additional_price: option.additional_price,
        is_available: option.is_available,
        sort_order: option.sort_order,
      });
    } else {
      const group = groups.find(g => g.id === groupId);
      setEditingOption(null);
      setOptionFormData({ ...emptyOption, sort_order: group?.options?.length || 0 });
    }
    setIsOptionModalOpen(true);
  };

  const closeOptionModal = () => {
    setIsOptionModalOpen(false);
    setEditingOption(null);
    setSelectedGroupId(null);
    setOptionFormData(emptyOption);
  };

  const handleOptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingOption) {
        const { error } = await supabase
          .from('addon_options')
          .update(optionFormData)
          .eq('id', editingOption.id);

        if (error) throw error;
        toast({ title: 'Opção atualizada com sucesso!' });
      } else {
        const { error } = await supabase
          .from('addon_options')
          .insert({ ...optionFormData, group_id: selectedGroupId });

        if (error) throw error;
        toast({ title: 'Opção criada com sucesso!' });
      }

      closeOptionModal();
      fetchGroups();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar a opção',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteOption = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta opção?')) return;

    const { error } = await supabase.from('addon_options').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a opção',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Opção excluída com sucesso!' });
      fetchGroups();
    }
  };

  const toggleOptionAvailable = async (option: AddonOption) => {
    await supabase
      .from('addon_options')
      .update({ is_available: !option.is_available })
      .eq('id', option.id);
    fetchGroups();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Nenhum restaurante encontrado</p>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-foreground">Complementos</h1>
          <p className="text-muted-foreground">Gerencie grupos e opções de complementos</p>
        </div>
        <Button onClick={() => openGroupModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Grupo
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">Nenhum grupo de complementos cadastrado</p>
          <Button onClick={() => openGroupModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Criar primeiro grupo
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className={cn(
                "bg-card rounded-xl border border-border overflow-hidden transition-opacity",
                !group.is_active && "opacity-50"
              )}
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50"
                onClick={() => toggleExpanded(group.id)}
              >
                <div className="flex items-center gap-3">
                  {expandedGroups.has(group.id) ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <h3 className="font-medium text-foreground">{group.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {group.is_required ? 'Obrigatório' : 'Opcional'} · 
                      Mín: {group.min_selections} · Máx: {group.max_selections} ·
                      {group.options?.length || 0} opções
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => openGroupModal(group)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteGroup(group.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {expandedGroups.has(group.id) && (
                <div className="border-t border-border">
                  <div className="p-4 space-y-2">
                    {group.options?.map((option) => (
                      <div
                        key={option.id}
                        className={cn(
                          "flex items-center justify-between p-3 bg-secondary/30 rounded-lg",
                          !option.is_available && "opacity-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-foreground">{option.name}</span>
                          {option.additional_price > 0 && (
                            <span className="text-sm text-primary font-medium">
                              +{formatPrice(option.additional_price)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleOptionAvailable(option)}
                          >
                            {option.is_available ? (
                              <Eye className="h-4 w-4 text-green-500" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openOptionModal(group.id, option)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteOption(option.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => openOptionModal(group.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Opção
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Group Modal */}
      {isGroupModalOpen && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={closeGroupModal} />
          <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-card rounded-xl border border-border z-50 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">
                {editingGroup ? 'Editar Grupo' : 'Novo Grupo'}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeGroupModal}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleGroupSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Nome *</Label>
                <Input
                  id="group-name"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  placeholder="Ex: Escolha o molho"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-description">Descrição</Label>
                <Input
                  id="group-description"
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  placeholder="Ex: Escolha até 2 molhos"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-selections">Mínimo de seleções</Label>
                  <Input
                    id="min-selections"
                    type="number"
                    min="0"
                    value={groupFormData.min_selections}
                    onChange={(e) => setGroupFormData({ ...groupFormData, min_selections: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-selections">Máximo de seleções</Label>
                  <Input
                    id="max-selections"
                    type="number"
                    min="1"
                    value={groupFormData.max_selections}
                    onChange={(e) => setGroupFormData({ ...groupFormData, max_selections: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={groupFormData.is_required}
                    onChange={(e) => setGroupFormData({ ...groupFormData, is_required: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Obrigatório</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={groupFormData.is_active}
                    onChange={(e) => setGroupFormData({ ...groupFormData, is_active: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Ativo</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="secondary" onClick={closeGroupModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : editingGroup ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Option Modal */}
      {isOptionModalOpen && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={closeOptionModal} />
          <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-card rounded-xl border border-border z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">
                {editingOption ? 'Editar Opção' : 'Nova Opção'}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeOptionModal}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleOptionSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="option-name">Nome *</Label>
                <Input
                  id="option-name"
                  value={optionFormData.name}
                  onChange={(e) => setOptionFormData({ ...optionFormData, name: e.target.value })}
                  placeholder="Ex: Molho shoyu"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="option-price">Preço Adicional (R$)</Label>
                <Input
                  id="option-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={optionFormData.additional_price}
                  onChange={(e) => setOptionFormData({ ...optionFormData, additional_price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={optionFormData.is_available}
                  onChange={(e) => setOptionFormData({ ...optionFormData, is_available: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm">Disponível</span>
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="secondary" onClick={closeOptionModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : editingOption ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
