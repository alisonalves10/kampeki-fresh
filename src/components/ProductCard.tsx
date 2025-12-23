import { useState, useEffect } from 'react';
import { Plus, AlertTriangle, Users, Puzzle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { AddonSelectionModal, SelectedAddon } from './AddonSelectionModal';
import { supabase } from '@/integrations/supabase/client';
import comboSalmao from '@/assets/combo-salmao.jpg';
import comboExclusivo from '@/assets/combo-exclusivo.jpg';
import temaki from '@/assets/temaki.jpg';
import sashimi from '@/assets/sashimi.jpg';
import uramaki from '@/assets/uramaki.jpg';
import hossomaki from '@/assets/hossomaki.jpg';
import gunkan from '@/assets/gunkan.jpg';

const imageMap: Record<string, string> = {
  'combo-salmao': comboSalmao,
  'combo-exclusivo': comboExclusivo,
  'temaki': temaki,
  'sashimi': sashimi,
  'uramaki': uramaki,
  'hossomaki': hossomaki,
  'gunkan': gunkan,
};

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const imageSrc = imageMap[product.image] || comboSalmao;
  const [hasAddons, setHasAddons] = useState(false);
  const [hasIncludedItems, setHasIncludedItems] = useState(false);
  const [includedCount, setIncludedCount] = useState(0);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);

  useEffect(() => {
    checkForAddons();
    checkForIncludedItems();
  }, [product.id]);

  const checkForAddons = async () => {
    const { count } = await supabase
      .from('product_addon_groups')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', product.id);
    
    setHasAddons((count || 0) > 0);
  };

  const checkForIncludedItems = async () => {
    const { data } = await supabase
      .from('product_included_items')
      .select('quantity')
      .eq('product_id', product.id);
    
    if (data && data.length > 0) {
      setHasIncludedItems(true);
      const total = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setIncludedCount(total);
    } else {
      setHasIncludedItems(false);
      setIncludedCount(0);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handleAddClick = () => {
    if (hasAddons || hasIncludedItems) {
      setIsAddonModalOpen(true);
    } else {
      addItem(product);
    }
  };

  const handleAddonConfirm = (selectedAddons: SelectedAddon[], totalAddonPrice: number) => {
    addItem(product, selectedAddons, totalAddonPrice);
    setIsAddonModalOpen(false);
  };

  return (
    <>
      <div className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Badge */}
          {product.badge && (
            <div className={cn(
              "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold",
              product.badge === 'Mais pedido' 
                ? "bg-primary text-primary-foreground" 
                : "bg-accent text-accent-foreground"
            )}>
              {product.badge}
            </div>
          )}

          {/* Addons indicator */}
          {hasAddons && !hasIncludedItems && (
            <div className="absolute top-3 right-3 bg-secondary/90 backdrop-blur-sm rounded-full p-1.5">
              <Puzzle className="h-3.5 w-3.5 text-primary" />
            </div>
          )}

          {/* Combo indicator */}
          {hasIncludedItems && (
            <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <span className="text-xs font-medium text-primary-foreground">Combo {includedCount} itens</span>
            </div>
          )}

          {/* Quick Add Button - Desktop */}
          <Button
            onClick={handleAddClick}
            size="icon"
            className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title & Servings */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-2 leading-tight">
              {product.name}
            </h3>
            {product.servings && (
              <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                <Users className="h-3.5 w-3.5" />
                <span className="text-xs">{product.servings}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[40px]">
            {product.description}
          </p>

          {/* Shrimp Warning */}
          {product.containsShrimp && (
            <div className="flex items-center gap-1 text-amber-500 text-xs mb-3">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Contém camarão</span>
            </div>
          )}

          {/* Price & Add Button */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">A partir de</span>
              <p className="text-xl font-bold text-primary">{formatPrice(product.price)}</p>
            </div>
            <Button
              onClick={handleAddClick}
              variant="secondary"
              size="sm"
              className="lg:hidden flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Addon Selection Modal */}
      <AddonSelectionModal
        isOpen={isAddonModalOpen}
        onClose={() => setIsAddonModalOpen(false)}
        productId={product.id}
        productName={product.name}
        productPrice={product.price}
        productImage={imageSrc}
        onConfirm={handleAddonConfirm}
      />
    </>
  );
};