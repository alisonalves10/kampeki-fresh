import { Gift, Star, ArrowRight, CheckCircle } from "lucide-react";

export function LoyaltySection() {
  return (
    <section className="section-padding bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container-landing">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-3xl border border-border overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Content */}
              <div className="p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                  <Gift className="h-4 w-4" />
                  Programa de Fidelidade
                </div>
                
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                  R$1 = 1 ponto
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  Seus clientes acumulam pontos a cada pedido e trocam por descontos automaticamente. 
                  Mais pedidos, mais fidelização.
                </p>

                <ul className="space-y-3 mb-8">
                  {[
                    "Pontos creditados após entrega confirmada",
                    "Resgate automático no checkout",
                    "100 pontos = R$1 de desconto",
                    "Histórico completo de pontos",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-foreground">
                      <CheckCircle className="h-5 w-5 text-d2u-green flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    const element = document.querySelector("#lead-form");
                    element?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  Quero ativar na minha loja
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Visual */}
              <div className="bg-gradient-teal p-8 md:p-12 flex items-center justify-center">
                <div className="relative">
                  {/* Points card */}
                  <div className="bg-background/95 backdrop-blur rounded-2xl p-6 shadow-2xl max-w-xs">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-orange flex items-center justify-center">
                        <Star className="h-6 w-6 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Meus pontos</p>
                        <p className="text-2xl font-display font-bold text-foreground">1.250</p>
                      </div>
                    </div>
                    
                    <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                      <div className="h-full w-3/4 bg-gradient-orange rounded-full" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Faltam 250 pts para ganhar R$15 de desconto
                    </p>

                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Último pedido</span>
                        <span className="text-d2u-green font-medium">+89 pts</span>
                      </div>
                    </div>
                  </div>

                  {/* Floating badge */}
                  <div className="absolute -top-4 -right-4 bg-accent text-accent-foreground px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-bounce-subtle">
                    +89 pontos! 🎉
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
