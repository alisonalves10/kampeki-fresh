import { ProductCard } from './ProductCard';
import { categories, getProductsByCategory } from '@/data/products';

interface ProductGridProps {
  activeCategory: string;
}

export const ProductGrid = ({ activeCategory }: ProductGridProps) => {
  const products = getProductsByCategory(activeCategory);
  const category = categories.find(c => c.id === activeCategory);

  return (
    <section className="py-8">
      <div className="container">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">{category?.icon}</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            {category?.name}
          </h2>
          <span className="text-sm text-muted-foreground">
            ({products.length} {products.length === 1 ? 'item' : 'itens'})
          </span>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}
      </div>
    </section>
  );
};
