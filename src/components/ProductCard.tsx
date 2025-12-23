import { Plus, AlertTriangle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
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

        {/* Quick Add Button - Desktop */}
        <Button
          onClick={() => addItem(product)}
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
            onClick={() => addItem(product)}
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
  );
};
