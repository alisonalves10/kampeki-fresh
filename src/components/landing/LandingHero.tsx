import { ArrowRight, Play, Store, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function LandingHero() {
  const navigate = useNavigate();

  const scrollToLeadForm = () => {
    const element = document.querySelector("#lead-form");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 pattern-dots opacity-50" />
      
      {/* Floating shapes */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <div className="container-landing relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">
              Plataforma de delivery para restaurantes
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 animate-fade-in leading-tight" style={{ animationDelay: "0.1s" }}>
            Seu delivery direto{" "}
            <span className="text-gradient">para o cliente.</span>
            <br />
            Sem complicação.
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed" style={{ animationDelay: "0.2s" }}>
            A Delivery2U é uma plataforma completa para restaurantes venderem online com cardápio digital, cupons, fidelidade por pontos, frete por distância e gestão de pedidos em tempo real.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button
              size="xl"
              onClick={scrollToLeadForm}
              className="glow-primary group"
            >
              Criar minha loja
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              onClick={() => navigate("/restaurantes")}
              className="group"
            >
              <Store className="mr-2 h-5 w-5" />
              Ver restaurantes
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-teal border-2 border-background flex items-center justify-center text-primary-foreground text-sm font-medium"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">+50 restaurantes</p>
                <p className="text-sm text-muted-foreground">já estão vendendo</p>
              </div>
            </div>

            <div className="hidden sm:block w-px h-12 bg-border" />

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">+10.000 pedidos</p>
                <p className="text-sm text-muted-foreground">realizados na plataforma</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
