import heroImage from '@/assets/hero-sushi.jpg';
import { Gift, ChevronRight } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative">
      {/* Hero Image */}
      <div className="relative h-[300px] sm:h-[400px] overflow-hidden">
        <img
          src={heroImage}
          alt="Sushi premium do Kampeki"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        
        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="container">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2 animate-slide-up">
              Sabor e Tradição
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Sushi artesanal preparado com os melhores ingredientes
            </p>
          </div>
        </div>
      </div>

      {/* Points Program Banner */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-accent/10 border-y border-primary/20">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Programa de Pontos
                </p>
                <p className="text-xs text-muted-foreground">
                  Ganhe <span className="text-primary font-semibold">1 ponto</span> a cada <span className="text-primary font-semibold">R$ 1,00</span> e troque por recompensas
                </p>
              </div>
            </div>
            <button className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
              <span className="hidden sm:inline">Ver detalhes</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
