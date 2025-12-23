import { ProductCard } from './ProductCard';
import { categories, getProductsByCategory, Product } from '@/data/products';

interface ProductGridProps {
  activeCategory: string;
  searchResults?: Product[] | null;
  isSearching?: boolean;
}

export const ProductGrid = ({ activeCategory, searchResults, isSearching }: ProductGridProps) => {
  // If searching, show search results
  if (isSearching && searchResults !== null && searchResults !== undefined) {
    return (
      <section className="py-8">
        <div className="container">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🔍</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Resultados da busca
            </h2>
            <span className="text-sm text-muted-foreground">
              ({searchResults.length} {searchResults.length === 1 ? 'item' : 'itens'})
            </span>
          </div>

          {/* Products Grid */}
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((product, index) => (
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
              <p className="text-muted-foreground text-lg mb-2">Nenhum produto encontrado</p>
              <p className="text-sm text-muted-foreground">
                Tente buscar por outro termo ou ajuste os filtros
              </p>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Default category view
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
