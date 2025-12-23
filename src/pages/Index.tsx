import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { CategoryNav } from '@/components/CategoryNav';
import { ProductGrid } from '@/components/ProductGrid';
import { SearchFilters, useProductSearch } from '@/components/SearchFilters';
import { Cart } from '@/components/Cart';
import { Footer } from '@/components/Footer';

const IndexContent = () => {
  const [activeCategory, setActiveCategory] = useState('destaques');
  const { isCartOpen, setIsCartOpen } = useCart();
  
  const {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories,
    priceRange,
    setPriceRange,
    filteredProducts,
    clearFilters,
    hasActiveFilters,
  } = useProductSearch();

  const handleCategoryChange = (category: string) => {
    // When clicking a category, clear search and show that category
    clearFilters();
    setActiveCategory(category);
  };

  return (
    <div className="min-h-screen bg-background pattern-japanese">
      <Header onCartClick={() => setIsCartOpen(true)} />
      <main>
        <Hero />
        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategories={selectedCategories}
          onCategoriesChange={setSelectedCategories}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          onClearFilters={clearFilters}
          resultCount={filteredProducts.length}
        />
        <CategoryNav
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <ProductGrid 
          activeCategory={activeCategory} 
          searchResults={hasActiveFilters ? filteredProducts : null}
          isSearching={!!hasActiveFilters}
        />
      </main>
      <Footer />
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default IndexContent;
