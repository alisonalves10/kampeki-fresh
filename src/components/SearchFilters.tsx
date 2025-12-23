import { useState, useMemo } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, products, categories } from '@/data/products';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
  resultCount: number;
}

const priceRanges = [
  { label: 'Todos', min: 0, max: 999 },
  { label: 'Até R$ 30', min: 0, max: 30 },
  { label: 'R$ 30 - R$ 50', min: 30, max: 50 },
  { label: 'R$ 50 - R$ 100', min: 50, max: 100 },
  { label: 'Acima de R$ 100', min: 100, max: 999 },
];

export const SearchFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoriesChange,
  priceRange,
  onPriceRangeChange,
  onClearFilters,
  resultCount,
}: SearchFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || (priceRange[0] !== 0 || priceRange[1] !== 999);

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter(c => c !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  const currentPriceLabel = priceRanges.find(
    r => r.min === priceRange[0] && r.max === priceRange[1]
  )?.label || 'Todos';

  return (
    <div className="bg-card border-b border-border sticky top-[104px] z-40">
      <div className="container py-4 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar sushi, temaki, sashimi..."
              className="w-full h-11 pl-10 pr-10 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            variant={showFilters ? "default" : "secondary"}
            size="lg"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="space-y-4 animate-fade-in">
            {/* Categories */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Categorias</p>
              <div className="flex flex-wrap gap-2">
                {categories.filter(c => c.id !== 'destaques').map((category) => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                      selectedCategories.includes(category.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    )}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <p className="text-sm font-medium text-muted-foreground mb-2">Faixa de preço</p>
                <button
                  onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border text-sm font-medium hover:bg-secondary/80"
                >
                  <span>{currentPriceLabel}</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", showPriceDropdown && "rotate-180")} />
                </button>
                {showPriceDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[160px] py-1">
                    {priceRanges.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => {
                          onPriceRangeChange([range.min, range.max]);
                          setShowPriceDropdown(false);
                        }}
                        className={cn(
                          "w-full px-4 py-2 text-sm text-left hover:bg-secondary transition-colors",
                          priceRange[0] === range.min && priceRange[1] === range.max
                            ? "text-primary font-medium"
                            : "text-foreground"
                        )}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="text-destructive hover:text-destructive/80 mt-6"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        {hasActiveFilters && (
          <p className="text-sm text-muted-foreground">
            {resultCount} {resultCount === 1 ? 'resultado encontrado' : 'resultados encontrados'}
          </p>
        )}
      </div>
    </div>
  );
};

// Hook to filter products
export const useProductSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(product.category)) return false;
      }

      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategories, priceRange]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceRange([0, 999]);
  };

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || (priceRange[0] !== 0 || priceRange[1] !== 999);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories,
    priceRange,
    setPriceRange,
    filteredProducts,
    clearFilters,
    hasActiveFilters,
  };
};
