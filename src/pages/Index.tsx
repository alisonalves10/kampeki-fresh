import { useState } from 'react';
import { CartProvider, useCart } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { CategoryNav } from '@/components/CategoryNav';
import { ProductGrid } from '@/components/ProductGrid';
import { Cart } from '@/components/Cart';
import { Footer } from '@/components/Footer';

const IndexContent = () => {
  const [activeCategory, setActiveCategory] = useState('destaques');
  const { isCartOpen, setIsCartOpen } = useCart();

  return (
    <div className="min-h-screen bg-background pattern-japanese">
      <Header onCartClick={() => setIsCartOpen(true)} />
      <main>
        <Hero />
        <CategoryNav
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        <ProductGrid activeCategory={activeCategory} />
      </main>
      <Footer />
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

const Index = () => {
  return (
    <CartProvider>
      <IndexContent />
    </CartProvider>
  );
};

export default Index;
