import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MarketplaceProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
}

export interface MarketplaceCartItem {
  product: MarketplaceProduct;
  quantity: number;
  cartItemId: string;
}

interface DeliveryRule {
  km_start: number;
  km_end: number;
  fee: number;
}

interface MarketplaceCartContextType {
  restaurantId: string | null;
  restaurantName: string | null;
  restaurantSlug: string | null;
  items: MarketplaceCartItem[];
  addItem: (product: MarketplaceProduct, restaurantId: string, restaurantName: string, restaurantSlug: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  deliveryMode: 'delivery' | 'pickup';
  setDeliveryMode: (mode: 'delivery' | 'pickup') => void;
  minOrderValue: number;
}

const MarketplaceCartContext = createContext<MarketplaceCartContextType | undefined>(undefined);

const generateCartItemId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const DEFAULT_DELIVERY_FEE = 8.99;

export const MarketplaceCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [restaurantSlug, setRestaurantSlug] = useState<string | null>(null);
  const [items, setItems] = useState<MarketplaceCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryFee, setDeliveryFee] = useState(DEFAULT_DELIVERY_FEE);
  const [minOrderValue, setMinOrderValue] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('marketplace_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setRestaurantId(parsed.restaurantId);
        setRestaurantName(parsed.restaurantName);
        setRestaurantSlug(parsed.restaurantSlug);
        setItems(parsed.items || []);
      } catch (e) {
        console.error('Failed to parse cart from localStorage');
      }
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem('marketplace_cart', JSON.stringify({
      restaurantId,
      restaurantName,
      restaurantSlug,
      items,
    }));
  }, [restaurantId, restaurantName, restaurantSlug, items]);

  // Fetch delivery rules when restaurant changes
  useEffect(() => {
    const fetchRestaurantSettings = async () => {
      if (!restaurantId) return;

      // Fetch restaurant min order value
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('min_order_value')
        .eq('id', restaurantId)
        .single();

      if (restaurant) {
        setMinOrderValue(Number(restaurant.min_order_value) || 0);
      }

      // Fetch delivery rules (using first rule for now - can be enhanced with distance calculation)
      const { data: rules } = await supabase
        .from('delivery_rules')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('km_start', { ascending: true })
        .limit(1);

      if (rules && rules.length > 0) {
        setDeliveryFee(Number(rules[0].fee));
      } else {
        setDeliveryFee(DEFAULT_DELIVERY_FEE);
      }
    };

    fetchRestaurantSettings();
  }, [restaurantId]);

  const addItem = useCallback((
    product: MarketplaceProduct, 
    newRestaurantId: string, 
    newRestaurantName: string,
    newRestaurantSlug: string
  ) => {
    // If adding from a different restaurant, clear cart first
    if (restaurantId && restaurantId !== newRestaurantId) {
      setItems([]);
    }

    setRestaurantId(newRestaurantId);
    setRestaurantName(newRestaurantName);
    setRestaurantSlug(newRestaurantSlug);

    setItems(current => {
      const existingItem = current.find(item => item.product.id === product.id);
      if (existingItem) {
        return current.map(item =>
          item.cartItemId === existingItem.cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...current, {
        product,
        quantity: 1,
        cartItemId: generateCartItemId(),
      }];
    });
    setIsCartOpen(true);
  }, [restaurantId]);

  const removeItem = useCallback((cartItemId: string) => {
    setItems(current => {
      const newItems = current.filter(item => item.cartItemId !== cartItemId);
      if (newItems.length === 0) {
        setRestaurantId(null);
        setRestaurantName(null);
        setRestaurantSlug(null);
      }
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    setItems(current =>
      current.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    setRestaurantSlug(null);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const actualDeliveryFee = deliveryMode === 'pickup' ? 0 : deliveryFee;
  const total = subtotal + actualDeliveryFee;

  return (
    <MarketplaceCartContext.Provider
      value={{
        restaurantId,
        restaurantName,
        restaurantSlug,
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryFee: actualDeliveryFee,
        total,
        isCartOpen,
        setIsCartOpen,
        deliveryMode,
        setDeliveryMode,
        minOrderValue,
      }}
    >
      {children}
    </MarketplaceCartContext.Provider>
  );
};

export const useMarketplaceCart = () => {
  const context = useContext(MarketplaceCartContext);
  if (!context) {
    throw new Error('useMarketplaceCart must be used within a MarketplaceCartProvider');
  }
  return context;
};
