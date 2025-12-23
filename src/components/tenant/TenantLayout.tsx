import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TenantProvider, useTenant } from '@/context/TenantContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TenantHeader } from './TenantHeader';
import { TenantFooter } from './TenantFooter';

function TenantLayoutContent() {
  const { restaurant, branding, loading, error } = useTenant();

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Carregando... - Delivery2U</title>
        </Helmet>
        <main className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </>
    );
  }

  if (error || !restaurant) {
    return (
      <>
        <Helmet>
          <title>Restaurante não encontrado - Delivery2U</title>
        </Helmet>
        <main className="min-h-screen bg-background">
          <div className="container max-w-lg mx-auto px-4 py-16 text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              {error || 'Restaurante não encontrado'}
            </h1>
            <p className="text-muted-foreground mb-6">
              O restaurante que você está procurando não existe ou não está disponível.
            </p>
            <Button onClick={() => window.history.back()}>
              Voltar
            </Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{restaurant.name} - Delivery2U</title>
        <meta name="description" content={restaurant.description || `Peça no ${restaurant.name} pelo Delivery2U`} />
        {branding?.favicon_url && <link rel="icon" href={branding.favicon_url} />}
      </Helmet>

      <TenantHeader />
      
      <main className="min-h-screen bg-background pb-24">
        <Outlet />
      </main>

      <TenantFooter />
    </>
  );
}

export default function TenantLayout() {
  const { slug } = useParams();

  return (
    <TenantProvider initialSlug={slug}>
      <TenantLayoutContent />
    </TenantProvider>
  );
}
