import { 
  Zap, 
  MapPin, 
  Bell, 
  Sparkles 
} from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Pedir em 1 minuto",
    description: "Interface rápida e intuitiva. Escolha, pague e pronto!",
  },
  {
    icon: MapPin,
    title: "Salvar endereços",
    description: "Cadastre endereços e repita pedidos com apenas um clique.",
  },
  {
    icon: Bell,
    title: "Acompanhar status",
    description: "Saiba em tempo real quando seu pedido está sendo preparado.",
  },
  {
    icon: Sparkles,
    title: "Cupons e pontos",
    description: "Acumule pontos a cada pedido e troque por descontos.",
  },
];

export function BenefitsCustomers() {
  return (
    <section className="section-padding bg-background">
      <div className="container-landing">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-d2u-green/10 text-d2u-green text-sm font-medium mb-4">
              Para Clientes
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
              A melhor experiência de{" "}
              <span className="text-gradient">delivery</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Pensamos em cada detalhe para que pedir seja tão bom quanto comer.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative bg-gradient-teal rounded-3xl p-1">
              <div className="bg-card rounded-[22px] p-8">
                {/* Mock phone screen */}
                <div className="bg-muted rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/20" />
                      <div>
                        <div className="h-4 w-24 bg-foreground/20 rounded" />
                        <div className="h-3 w-16 bg-foreground/10 rounded mt-1" />
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-d2u-green/20 text-d2u-green text-xs font-medium rounded-full">
                      Em preparo
                    </div>
                  </div>
                  
                  <div className="h-px bg-border" />
                  
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/20" />
                        <div className="flex-1">
                          <div className="h-3 w-20 bg-foreground/15 rounded" />
                          <div className="h-2 w-12 bg-foreground/10 rounded mt-1" />
                        </div>
                        <div className="h-3 w-10 bg-foreground/15 rounded" />
                      </div>
                    ))}
                  </div>
                  
                  <div className="h-px bg-border" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-bold text-foreground">R$ 89,90</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 bg-card rounded-xl p-4 shadow-lg border border-border animate-float">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-d2u-green/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-d2u-green" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pontos ganhos</p>
                  <p className="font-bold text-foreground">+89 pts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
