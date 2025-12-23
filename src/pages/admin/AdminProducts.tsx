import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, Puzzle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/ImageUpload';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface AddonGroup {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  category_id: string | null;
  badge: string | null;
  contains_shrimp: boolean;
  servings: number | null;
  is_available: boolean;
}

interface ProductAddonGroup {
  addon_group_id: string;
}

interface IncludedItem {
  id?: string;
  included_product_id: string;
  quantity: number;
  product_name?: string;
}

const emptyProduct = {
  name: '',
  description: '',
  price: 0,
  image_url: '',
  category: 'combinados',
  category_id: null as string | null,
  badge: '',
  contains_shrimp: false,
  servings: null as number | null,
  is_available: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [addonGroups, setAddonGroups] = useState<AddonGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [selectedAddonGroups, setSelectedAddonGroups] = useState<string[]>([]);
  const [includedItems, setIncludedItems] = useState<IncludedItem[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [productsRes, categoriesRes, addonGroupsRes] = await Promise.all([
      supabase.from('db_products').select('*').order('category').order('sort_order'),
      supabase.from('categories').select('id, name, icon').order('sort_order'),
      supabase.from('addon_groups').select('id, name').eq('is_active', true).order('sort_order'),
    ]);

    if (productsRes.data) setProducts(productsRes.data as Product[]);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (addonGroupsRes.data) setAddonGroups(addonGroupsRes.data);
    
    setLoading(false);
  };

  const fetchProductAddonGroups = async (productId: string) => {
    const { data } = await supabase
      .from('product_addon_groups')
      .select('addon_group_id')
      .eq('product_id', productId);
    
    return (data || []).map(d => d.addon_group_id);
  };

  const fetchIncludedItems = async (productId: string) => {
    const { data } = await supabase
      .from('product_included_items')
      .select(`
        id,
        included_product_id,
        quantity,
        db_products!product_included_items_included_product_id_fkey (name)
      `)
      .eq('product_id', productId)
      .order('sort_order');
    
    return (data || []).map((d: any) => ({
      id: d.id,
      included_product_id: d.included_product_id,
      quantity: d.quantity,
      product_name: d.db_products?.name || '',
    }));
  };

  const openModal = async (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        image_url: product.image_url || '',
        category: product.category,
        category_id: product.category_id,
        badge: product.badge || '',
        contains_shrimp: product.contains_shrimp,
        servings: product.servings,
        is_available: product.is_available,
      });
      const [linkedGroups, linked] = await Promise.all([
        fetchProductAddonGroups(product.id),
        fetchIncludedItems(product.id),
      ]);
      setSelectedAddonGroups(linkedGroups);
      setIncludedItems(linked);
    } else {
      setEditingProduct(null);
      setFormData(emptyProduct);
      setSelectedAddonGroups([]);
      setIncludedItems([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData(emptyProduct);
    setSelectedAddonGroups([]);
    setIncludedItems([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Find category by ID to get its text value for legacy support
      const selectedCategory = categories.find(c => c.id === formData.category_id);
      const categoryText = selectedCategory?.name?.toLowerCase().replace(/\s+/g, '-') || formData.category;

      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: formData.price,
        image_url: formData.image_url || null,
        category: categoryText,
        category_id: formData.category_id,
        badge: formData.badge || null,
        contains_shrimp: formData.contains_shrimp,
        servings: formData.servings,
        is_available: formData.is_available,
      };

      let productId: string;

      if (editingProduct) {
        const { error } = await supabase
          .from('db_products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        productId = editingProduct.id;

        // Update addon groups: delete all and re-insert
        await supabase
          .from('product_addon_groups')
          .delete()
          .eq('product_id', productId);

        toast({ title: 'Produto atualizado com sucesso!' });
      } else {
        const { data, error } = await supabase
          .from('db_products')
          .insert(productData)
          .select('id')
          .single();

        if (error) throw error;
        productId = data.id;
        toast({ title: 'Produto criado com sucesso!' });
      }

      // Insert addon group links
      if (selectedAddonGroups.length > 0) {
        const links = selectedAddonGroups.map(groupId => ({
          product_id: productId,
          addon_group_id: groupId,
        }));
        await supabase.from('product_addon_groups').insert(links);
      }

      // Handle included items
      if (editingProduct) {
        await supabase
          .from('product_included_items')
          .delete()
          .eq('product_id', productId);
      }

      if (includedItems.length > 0) {
        const includedLinks = includedItems.map((item, idx) => ({
          product_id: productId,
          included_product_id: item.included_product_id,
          quantity: item.quantity,
          sort_order: idx,
        }));
        await supabase.from('product_included_items').insert(includedLinks);
      }

      closeModal();
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o produto',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    const { error } = await supabase.from('db_products').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o produto',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Produto excluído com sucesso!' });
      fetchData();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const toggleAddonGroup = (groupId: string) => {
    setSelectedAddonGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const addIncludedItem = (productId: string) => {
    if (includedItems.length >= 10) return;
    if (includedItems.some(i => i.included_product_id === productId)) return;
    if (editingProduct && productId === editingProduct.id) return;
    
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    
    setIncludedItems(prev => [...prev, {
      included_product_id: productId,
      quantity: 1,
      product_name: prod.name,
    }]);
  };

  const removeIncludedItem = (productId: string) => {
    setIncludedItems(prev => prev.filter(i => i.included_product_id !== productId));
  };

  const updateIncludedItemQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setIncludedItems(prev => 
      prev.map(i => i.included_product_id === productId ? { ...i, quantity } : i)
    );
  };

  const availableProductsForInclusion = products.filter(p => 
    p.id !== editingProduct?.id && 
    !includedItems.some(i => i.included_product_id === p.id)
  );

  const filteredProducts = products.filter((product) => {
    if (categoryFilter !== 'all') {
      if (categoryFilter === product.category_id || product.category === categoryFilter) {
        // matches
      } else {
        return false;
      }
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return product.name.toLowerCase().includes(query);
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
          <h1 className="font-serif text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground">Gerencie os produtos do cardápio</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-4 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="all">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={cn(
                "bg-card rounded-xl border border-border p-4 transition-opacity",
                !product.is_available && "opacity-50"
              )}
            >
              <div className="flex gap-4">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center text-2xl">
                    🍣
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
                  <p className="text-primary font-semibold mt-1">{formatPrice(product.price)}</p>
                  {product.badge && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                      {product.badge}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => openModal(product)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteProduct(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={closeModal} />
          <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-card rounded-xl border border-border z-50 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-serif text-lg font-semibold">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
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
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <select
                    id="category"
                    value={formData.category_id || ''}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value || null })}
                    className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  >
                    <option value="">Selecione...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Imagem do Produto</Label>
                <ImageUpload
                  value={formData.image_url || undefined}
                  onChange={(url) => setFormData({ ...formData, image_url: url || '' })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="badge">Badge/Destaque</Label>
                  <Input
                    id="badge"
                    value={formData.badge || ''}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="ex: Mais pedido"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servings">Porções</Label>
                  <Input
                    id="servings"
                    type="number"
                    min="1"
                    value={formData.servings || ''}
                    onChange={(e) => setFormData({ ...formData, servings: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.contains_shrimp}
                    onChange={(e) => setFormData({ ...formData, contains_shrimp: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Contém camarão</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Disponível</span>
                </label>
              </div>

              {/* Addon Groups Section */}
              {addonGroups.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Puzzle className="h-4 w-4 text-primary" />
                    <Label>Grupos de Complementos</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selecione os grupos de complementos disponíveis para este produto
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {addonGroups.map((group) => (
                      <label
                        key={group.id}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                          selectedAddonGroups.includes(group.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAddonGroups.includes(group.id)}
                          onChange={() => toggleAddonGroup(group.id)}
                          className="rounded border-border"
                        />
                        <span className="text-sm">{group.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Included Products Section */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <Label>Produtos Incluídos (Combo)</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Adicione até 10 produtos que fazem parte deste combo/kit
                </p>
                
                {/* List of included items */}
                {includedItems.length > 0 && (
                  <div className="space-y-2">
                    {includedItems.map((item) => (
                      <div 
                        key={item.included_product_id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 border border-border"
                      >
                        <span className="flex-1 text-sm truncate">{item.product_name}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateIncludedItemQuantity(item.included_product_id, item.quantity - 1)}
                            className="p-1 rounded bg-background hover:bg-muted"
                          >
                            <span className="text-xs font-bold">−</span>
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateIncludedItemQuantity(item.included_product_id, item.quantity + 1)}
                            className="p-1 rounded bg-background hover:bg-muted"
                          >
                            <span className="text-xs font-bold">+</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeIncludedItem(item.included_product_id)}
                          className="p-1 text-destructive hover:bg-destructive/10 rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add product selector */}
                {includedItems.length < 10 && (
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) addIncludedItem(e.target.value);
                    }}
                    className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">+ Adicionar produto ao combo...</option>
                    {availableProductsForInclusion.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} - {formatPrice(prod.price)}
                      </option>
                    ))}
                  </select>
                )}

                {includedItems.length >= 10 && (
                  <p className="text-xs text-amber-500">Limite de 10 produtos atingido</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : editingProduct ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}