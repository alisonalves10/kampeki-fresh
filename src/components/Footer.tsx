import { MapPin, Phone, Clock, Instagram, Facebook } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-lg">K</span>
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-foreground">Kampeki Sushi</h3>
                <p className="text-xs text-muted-foreground">Culinária Japonesa Premium</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Há mais de 10 anos servindo o melhor da culinária japonesa em Porto Alegre. 
              Ingredientes frescos e selecionados para uma experiência gastronômica única.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Av. Dom Pedro II, 1203 - São João, Porto Alegre - RS</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>(51) 99747-4567</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <div>
                  <p>Ter - Dom: 18:00 - 23:00</p>
                  <p>Segunda: Fechado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Redes Sociais</h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-6">
              <h5 className="text-sm font-medium mb-2">Formas de Pagamento</h5>
              <p className="text-xs text-muted-foreground">
                Cartões de crédito/débito, Pix, Vale-refeição e Dinheiro
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kampeki Sushi. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
