import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  whatsapp: string | null;
  is_open: boolean;
  is_active: boolean;
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  min_order_value: number;
  lat?: number | null;
  lng?: number | null;
}

interface TenantBranding {
  id: string;
  restaurant_id: string;
  primary_color: string;
  secondary_color: string;
  background_color: string | null;
  text_color: string | null;
  header_image_url: string | null;
  header_title: string | null;
  header_subtitle: string | null;
  favicon_url: string | null;
  logo_url: string | null;
}

interface TenantContextType {
  restaurant: Restaurant | null;
  branding: TenantBranding | null;
  loading: boolean;
  error: string | null;
  setSlug: (slug: string) => void;
}

const defaultBranding: Omit<TenantBranding, 'id' | 'restaurant_id'> = {
  primary_color: '#0891b2',
  secondary_color: '#f97316',
  background_color: null,
  text_color: null,
  header_image_url: null,
  header_title: null,
  header_subtitle: null,
  favicon_url: null,
  logo_url: null,
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children, initialSlug }: { children: ReactNode; initialSlug?: string }) => {
  const [slug, setSlug] = useState<string | null>(initialSlug || null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchTenant = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch restaurant - use select('*') and cast to avoid type issues with new columns
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('slug', slug)
          .single();

        if (restaurantError) {
          if (restaurantError.code === 'PGRST116') {
            setError('Restaurante não encontrado.');
          } else {
            throw restaurantError;
          }
          return;
        }

        const typedRestaurant = restaurantData as unknown as Restaurant;

        if (!typedRestaurant.is_active) {
          setError('Este restaurante não está ativo no momento.');
          return;
        }

        setRestaurant(typedRestaurant);

        // Fetch branding - cast to any since types may not be updated yet
        const { data: brandingData } = await supabase
          .from('tenant_branding' as any)
          .select('*')
          .eq('restaurant_id', typedRestaurant.id)
          .maybeSingle();

        if (brandingData) {
          setBranding(brandingData as unknown as TenantBranding);
        } else {
          // Use default branding
          setBranding({
            id: 'default',
            restaurant_id: typedRestaurant.id,
            ...defaultBranding,
          });
        }
      } catch (err) {
        console.error('Error fetching tenant:', err);
        setError('Erro ao carregar o restaurante. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [slug]);

  // Apply CSS variables when branding changes
  useEffect(() => {
    if (branding) {
      const root = document.documentElement;
      
      // Convert hex to HSL for CSS variables
      const hexToHsl = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return null;
        
        let r = parseInt(result[1], 16) / 255;
        let g = parseInt(result[2], 16) / 255;
        let b = parseInt(result[3], 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;
        
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
          }
        }
        
        return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
      };

      const primaryHsl = hexToHsl(branding.primary_color);
      const secondaryHsl = hexToHsl(branding.secondary_color);

      if (primaryHsl) {
        root.style.setProperty('--tenant-primary', primaryHsl);
      }
      if (secondaryHsl) {
        root.style.setProperty('--tenant-secondary', secondaryHsl);
      }

      // Update favicon
      if (branding.favicon_url) {
        const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = branding.favicon_url;
        document.head.appendChild(link);
      }
    }

    // Cleanup on unmount
    return () => {
      const root = document.documentElement;
      root.style.removeProperty('--tenant-primary');
      root.style.removeProperty('--tenant-secondary');
    };
  }, [branding]);

  return (
    <TenantContext.Provider value={{
      restaurant,
      branding,
      loading,
      error,
      setSlug,
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
