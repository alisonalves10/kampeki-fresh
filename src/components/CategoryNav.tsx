import { useRef } from 'react';
import { categories } from '@/data/products';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export const CategoryNav = ({ activeCategory, onCategoryChange }: CategoryNavProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav className="sticky top-[120px] z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container py-3">
        <div className="relative flex items-center">
          {/* Scroll Left Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 z-10 h-8 w-8 flex items-center justify-center bg-gradient-to-r from-background via-background to-transparent pr-4 lg:hidden"
          >
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Categories */}
          <div
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-8 lg:px-0 lg:justify-center"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground glow-primary"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 z-10 h-8 w-8 flex items-center justify-center bg-gradient-to-l from-background via-background to-transparent pl-4 lg:hidden"
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </nav>
  );
};
