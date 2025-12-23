import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product } from '@/data/products';
import { supabase } from '@/integrations/supabase/client';
import { SelectedAddon } from '@/components/AddonSelectionModal';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedAddons?: SelectedAddon[];
  addonsTotalPrice?: number;
  cartItemId: string; // Unique identifier for each cart item (allows same product with different addons)
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
}

interface DeliverySettings {
  fee: number;
  free_above: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, selectedAddons?: SelectedAddon[], addonsTotalPrice?: number) => void;
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
  // Coupon & Points
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  pointsToRedeem: number;
  pointsDiscount: number;
  setPointsToRedeem: (points: number) => void;
  earnedPoints: number;
  deliverySettings: DeliverySettings;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// 100 points = R$10 discount (1 point = R$0.10)
const POINTS_VALUE = 0.10;

const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  fee: 11.99,
  free_above: 150
};

// Generate unique ID for cart items
const generateCartItemId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(DEFAULT_DELIVERY_SETTINGS);

  // Fetch delivery settings on mount
  useEffect(() => {
    const fetchDeliverySettings = async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'delivery_settings')
        .maybeSingle();

      if (!error && data) {
        setDeliverySettings(data.value as unknown as DeliverySettings);
      }
    };

    fetchDeliverySettings();
  }, []);

  const addItem = useCallback((product: Product, selectedAddons?: SelectedAddon[], addonsTotalPrice?: number) => {
    setItems(current => {
      // If no addons, check if product already exists without addons
      if (!selectedAddons || selectedAddons.length === 0) {
        const existingItem = current.find(
          item => item.product.id === product.id && (!item.selectedAddons || item.selectedAddons.length === 0)
        );
        if (existingItem) {
          return current.map(item =>
            item.cartItemId === existingItem.cartItemId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
      }
      
      // Add as new item with unique cartItemId
      return [...current, {
        product,
        quantity: 1,
        selectedAddons,
        addonsTotalPrice: addonsTotalPrice || 0,
        cartItemId: generateCartItemId(),
      }];
    });
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setItems(current => current.filter(item => item.cartItemId !== cartItemId));
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
    setAppliedCoupon(null);
    setPointsToRedeem(0);
  }, []);

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        return { success: false, message: 'Erro ao verificar cupom' };
      }

      if (!data) {
        return { success: false, message: 'Cupom inválido ou expirado' };
      }

      // Check expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { success: false, message: 'Cupom expirado' };
      }

      // Check max uses
      if (data.max_uses && data.current_uses >= data.max_uses) {
        return { success: false, message: 'Cupom esgotado' };
      }

      // Check min order value
      if (data.min_order_value && subtotal < Number(data.min_order_value)) {
        return { 
          success: false, 
          message: `Pedido mínimo de R$ ${Number(data.min_order_value).toFixed(2)} para este cupom` 
        };
      }

      setAppliedCoupon({
        id: data.id,
        code: data.code,
        discount_type: data.discount_type as 'percentage' | 'fixed',
        discount_value: Number(data.discount_value),
        min_order_value: Number(data.min_order_value) || 0
      });

      return { success: true, message: 'Cupom aplicado com sucesso!' };
    } catch {
      return { success: false, message: 'Erro ao aplicar cupom' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Subtotal includes product price + addons price
  const subtotal = items.reduce(
    (sum, item) => {
      const itemPrice = item.product.price + (item.addonsTotalPrice || 0);
      return sum + itemPrice * item.quantity;
    },
    0
  );
  
  const deliveryFee = deliveryMode === 'pickup' ? 0 : subtotal >= deliverySettings.free_above ? 0 : deliverySettings.fee;

  // Calculate coupon discount
  const couponDiscount = appliedCoupon
    ? appliedCoupon.discount_type === 'percentage'
      ? subtotal * (appliedCoupon.discount_value / 100)
      : appliedCoupon.discount_value
    : 0;

  // Calculate points discount
  const pointsDiscount = pointsToRedeem * POINTS_VALUE;

  // Total with all discounts
  const total = Math.max(0, subtotal + deliveryFee - couponDiscount - pointsDiscount);

  // Points to be earned from this order (R$1 = 1 point, calculated on final value before points discount)
  const earnedPoints = Math.floor(subtotal - couponDiscount);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryFee,
        total,
        isCartOpen,
        setIsCartOpen,
        deliveryMode,
        setDeliveryMode,
        appliedCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        pointsToRedeem,
        pointsDiscount,
        setPointsToRedeem,
        earnedPoints,
        deliverySettings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};