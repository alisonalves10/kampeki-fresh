import { Link } from 'react-router-dom';
import { useTenant } from '@/context/TenantContext';

export function TenantFooter() {
  const { restaurant } = useTenant();

  return (
    <footer className="bg-muted/50 border-t border-border py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              {restaurant?.name} © {new Date().getFullYear()}
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Powered by</span>
            <Link 
              to="/" 
              className="font-semibold text-primary hover:underline"
            >
              Delivery2U
            </Link>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <Link to="/termos" className="text-muted-foreground hover:text-foreground transition-colors">
              Termos
            </Link>
            <Link to="/privacidade" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
