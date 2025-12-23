import { useState, useEffect } from 'react';
import { X, Minus, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AddonOption {
  id: string;
  name: string;
  additional_price: number;
  is_available: boolean;
}

interface AddonGroup {
  id: string;
  name: string;
  description: string | null;
  min_selections: number;
  max_selections: number;
  is_required: boolean;
  options: AddonOption[];
}

export interface SelectedAddon {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
  quantity: number;
}

interface IncludedProduct {
  id: string;
  name: string;
  quantity: number;
  image_url: string | null;
}

interface AddonSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  onConfirm: (selectedAddons: SelectedAddon[], totalAddonPrice: number) => void;
}

export const AddonSelectionModal = ({
  isOpen,
  onClose,
  productId,
  productName,
  productPrice,
  productImage,
  onConfirm,
}: AddonSelectionModalProps) => {
  const [addonGroups, setAddonGroups] = useState<AddonGroup[]>([]);
  const [includedProducts, setIncludedProducts] = useState<IncludedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    if (isOpen && productId) {
      fetchAddons();
    }
  }, [isOpen, productId]);

  const fetchAddons = async () => {
    setLoading(true);
    
    // Fetch included products
    const { data: includedItems } = await supabase
      .from('product_included_items')
      .select(`
        id,
        quantity,
        included_product_id,
        db_products!product_included_items_included_product_id_fkey (
          id,
          name,
          image_url
        )
      `)
      .eq('product_id', productId)
      .order('sort_order');

    if (includedItems) {
      setIncludedProducts(
        includedItems.map((item: any) => ({
          id: item.db_products?.id || item.included_product_id,
          name: item.db_products?.name || '',
          quantity: item.quantity,
          image_url: item.db_products?.image_url || null,
        }))
      );
    } else {
      setIncludedProducts([]);
    }
    
    // Get addon groups linked to this product
    const { data: links } = await supabase
      .from('product_addon_groups')
      .select('addon_group_id')
      .eq('product_id', productId);

    if (!links || links.length === 0) {
      setAddonGroups([]);
      setLoading(false);
      return;
    }

    const groupIds = links.map(l => l.addon_group_id);

    const { data: groups } = await supabase
      .from('addon_groups')
      .select('*')
      .in('id', groupIds)
      .eq('is_active', true)
      .order('sort_order');

    if (!groups) {
      setAddonGroups([]);
      setLoading(false);
      return;
    }

    const { data: options } = await supabase
      .from('addon_options')
      .select('*')
      .in('group_id', groupIds)
      .eq('is_available', true)
      .order('sort_order');

    const groupsWithOptions = groups.map(group => ({
      ...group,
      options: (options || []).filter(opt => opt.group_id === group.id),
    }));

    setAddonGroups(groupsWithOptions);
    
    // Initialize selections
    const initialSelections: Record<string, Record<string, number>> = {};
    groupsWithOptions.forEach(group => {
      initialSelections[group.id] = {};
    });
    setSelections(initialSelections);
    
    setLoading(false);
  };

  const getGroupSelectionCount = (groupId: string) => {
    return Object.values(selections[groupId] || {}).reduce((sum, qty) => sum + qty, 0);
  };

  const handleOptionToggle = (groupId: string, optionId: string, maxSelections: number) => {
    setSelections(prev => {
      const groupSelections = { ...prev[groupId] };
      const currentCount = getGroupSelectionCount(groupId);
      
      if (maxSelections === 1) {
        // Radio behavior: only one selection allowed
        if (groupSelections[optionId]) {
          delete groupSelections[optionId];
        } else {
          // Clear previous selections and set new one
          Object.keys(groupSelections).forEach(key => delete groupSelections[key]);
          groupSelections[optionId] = 1;
        }
      } else {
        // Checkbox behavior with quantity
        if (groupSelections[optionId]) {
          delete groupSelections[optionId];
        } else if (currentCount < maxSelections) {
          groupSelections[optionId] = 1;
        }
      }
      
      return { ...prev, [groupId]: groupSelections };
    });
  };

  const handleQuantityChange = (groupId: string, optionId: string, delta: number, maxSelections: number) => {
    setSelections(prev => {
      const groupSelections = { ...prev[groupId] };
      const currentQty = groupSelections[optionId] || 0;
      const currentCount = getGroupSelectionCount(groupId);
      const newQty = currentQty + delta;
      
      if (newQty <= 0) {
        delete groupSelections[optionId];
      } else if (delta > 0 && currentCount >= maxSelections) {
        // Can't add more
        return prev;
      } else {
        groupSelections[optionId] = newQty;
      }
      
      return { ...prev, [groupId]: groupSelections };
    });
  };

  const isValid = () => {
    return addonGroups.every(group => {
      const count = getGroupSelectionCount(group.id);
      if (group.is_required && count < group.min_selections) return false;
      return true;
    });
  };

  const getTotalAddonPrice = () => {
    let total = 0;
    addonGroups.forEach(group => {
      group.options.forEach(option => {
        const qty = selections[group.id]?.[option.id] || 0;
        total += option.additional_price * qty;
      });
    });
    return total;
  };

  const handleConfirm = () => {
    const selectedAddons: SelectedAddon[] = [];
    
    addonGroups.forEach(group => {
      group.options.forEach(option => {
        const qty = selections[group.id]?.[option.id] || 0;
        if (qty > 0) {
          selectedAddons.push({
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            optionName: option.name,
            price: option.additional_price,
            quantity: qty,
          });
        }
      });
    });
    
    onConfirm(selectedAddons, getTotalAddonPrice());
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-card rounded-xl border border-border z-50 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <img
              src={productImage}
              alt={productName}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h2 className="font-serif text-lg font-semibold line-clamp-1">{productName}</h2>
              <p className="text-primary font-medium">{formatPrice(productPrice)}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Included Products Section */}
              {includedProducts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <span className="text-primary">📦</span>
                    Este combo inclui:
                  </h3>
                  <div className="space-y-2">
                    {includedProducts.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/20"
                      >
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center text-lg">
                            🍣
                          </div>
                        )}
                        <span className="flex-1 text-sm">{item.name}</span>
                        <span className="text-sm font-medium text-primary">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Addons Section */}
              {addonGroups.length === 0 && includedProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Este produto não possui complementos disponíveis.
                </p>
              ) : addonGroups.length > 0 && (
                <div className="space-y-6">
                  {addonGroups.map((group) => {
                    const selectionCount = getGroupSelectionCount(group.id);
                    const isGroupValid = !group.is_required || selectionCount >= group.min_selections;
                    
                    return (
                      <div key={group.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-foreground">{group.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {group.is_required ? 'Obrigatório' : 'Opcional'}
                              {group.max_selections > 1 && ` · Escolha até ${group.max_selections}`}
                            </p>
                          </div>
                          {group.is_required && !isGroupValid && (
                            <span className="text-xs text-destructive">
                              Escolha {group.min_selections}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {group.options.map((option) => {
                            const qty = selections[group.id]?.[option.id] || 0;
                            const isSelected = qty > 0;
                            
                            return (
                              <div
                                key={option.id}
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer",
                                  isSelected 
                                    ? "border-primary bg-primary/5" 
                                    : "border-border hover:border-primary/50"
                                )}
                                onClick={() => handleOptionToggle(group.id, option.id, group.max_selections)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                    isSelected 
                                      ? "border-primary bg-primary" 
                                      : "border-muted-foreground"
                                  )}>
                                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                  </div>
                                  <span className="text-foreground">{option.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  {option.additional_price > 0 && (
                                    <span className="text-sm text-primary font-medium">
                                      +{formatPrice(option.additional_price)}
                                    </span>
                                  )}
                                  {isSelected && group.max_selections > 1 && (
                                    <div 
                                      className="flex items-center gap-1" 
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button
                                        onClick={() => handleQuantityChange(group.id, option.id, -1, group.max_selections)}
                                        className="p-1 rounded bg-secondary hover:bg-secondary/80"
                                      >
                                        <Minus className="h-3 w-3" />
                                      </button>
                                      <span className="w-6 text-center text-sm">{qty}</span>
                                      <button
                                        onClick={() => handleQuantityChange(group.id, option.id, 1, group.max_selections)}
                                        className="p-1 rounded bg-secondary hover:bg-secondary/80"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Complementos:</span>
            <span className="font-medium">{formatPrice(getTotalAddonPrice())}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-foreground font-medium">Total:</span>
            <span className="text-xl font-bold text-primary">
              {formatPrice(productPrice + getTotalAddonPrice())}
            </span>
          </div>
          <Button
            onClick={handleConfirm}
            disabled={!isValid()}
            className="w-full"
          >
            Adicionar ao carrinho
          </Button>
        </div>
      </div>
    </>
  );
};