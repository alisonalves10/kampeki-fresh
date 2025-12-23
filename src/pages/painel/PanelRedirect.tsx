import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'lojista' | 'user';

export default function PanelRedirect() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login?next=/painel');
      return;
    }

    const checkRole = async () => {
      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        const role: UserRole = data?.role || 'user';

        switch (role) {
          case 'admin':
            navigate('/painel/superadmin', { replace: true });
            break;
          case 'lojista':
            navigate('/painel/restaurante', { replace: true });
            break;
          default:
            navigate('/painel/cliente', { replace: true });
        }
      } catch (err) {
        console.error('Error checking role:', err);
        navigate('/painel/cliente', { replace: true });
      } finally {
        setChecking(false);
      }
    };

    checkRole();
  }, [user, authLoading, navigate]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return null;
}
