import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DayHours {
  open: string;
  close: string;
  enabled: boolean;
}

interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

const DEFAULT_HOURS: BusinessHours = {
  monday: { open: '11:00', close: '23:00', enabled: true },
  tuesday: { open: '11:00', close: '23:00', enabled: true },
  wednesday: { open: '11:00', close: '23:00', enabled: true },
  thursday: { open: '11:00', close: '23:00', enabled: true },
  friday: { open: '11:00', close: '23:00', enabled: true },
  saturday: { open: '11:00', close: '23:00', enabled: true },
  sunday: { open: '11:00', close: '22:00', enabled: true },
};

const DAY_NAMES: Record<number, keyof BusinessHours> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

export const useStoreStatus = () => {
  const [businessHours, setBusinessHours] = useState<BusinessHours>(DEFAULT_HOURS);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchBusinessHours = async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('value')
        .eq('key', 'business_hours')
        .maybeSingle();

      if (!error && data) {
        setBusinessHours(data.value as unknown as BusinessHours);
      }
      setIsLoading(false);
    };

    fetchBusinessHours();
  }, []);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const storeStatus = useMemo(() => {
    const dayOfWeek = currentTime.getDay();
    const dayKey = DAY_NAMES[dayOfWeek];
    const todayHours = businessHours[dayKey];

    if (!todayHours.enabled) {
      // Find next open day
      for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (dayOfWeek + i) % 7;
        const nextDayKey = DAY_NAMES[nextDayIndex];
        const nextDayHours = businessHours[nextDayKey];
        if (nextDayHours.enabled) {
          return {
            isOpen: false,
            message: `Abre ${getDayName(nextDayKey)} às ${nextDayHours.open}`,
            nextOpen: nextDayHours.open,
          };
        }
      }
      return { isOpen: false, message: 'Fechado', nextOpen: null };
    }

    const currentTimeStr = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    
    if (currentTimeStr >= todayHours.open && currentTimeStr < todayHours.close) {
      return {
        isOpen: true,
        message: `Fecha às ${todayHours.close}`,
        nextOpen: null,
      };
    } else if (currentTimeStr < todayHours.open) {
      return {
        isOpen: false,
        message: `Abre às ${todayHours.open}`,
        nextOpen: todayHours.open,
      };
    } else {
      // After closing, find next open
      for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (dayOfWeek + i) % 7;
        const nextDayKey = DAY_NAMES[nextDayIndex];
        const nextDayHours = businessHours[nextDayKey];
        if (nextDayHours.enabled) {
          return {
            isOpen: false,
            message: i === 1 
              ? `Abre amanhã às ${nextDayHours.open}`
              : `Abre ${getDayName(nextDayKey)} às ${nextDayHours.open}`,
            nextOpen: nextDayHours.open,
          };
        }
      }
      return { isOpen: false, message: 'Fechado', nextOpen: null };
    }
  }, [businessHours, currentTime]);

  return {
    businessHours,
    setBusinessHours,
    isOpen: storeStatus.isOpen,
    statusMessage: storeStatus.message,
    isLoading,
  };
};

const getDayName = (day: keyof BusinessHours): string => {
  const names: Record<keyof BusinessHours, string> = {
    monday: 'Segunda',
    tuesday: 'Terça',
    wednesday: 'Quarta',
    thursday: 'Quinta',
    friday: 'Sexta',
    saturday: 'Sábado',
    sunday: 'Domingo',
  };
  return names[day];
};

export type { BusinessHours, DayHours };
export { DEFAULT_HOURS, getDayName };
