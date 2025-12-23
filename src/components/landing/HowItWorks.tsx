import { Store, Smartphone, ChefHat, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Store,
    step: "01",
    title: "Restaurante cria a loja",
    description: "Cadastre seu restaurante, cardápio completo e configure regras de frete e cupons.",
  },
  {
    icon: Smartphone,
    step: "02",
    title: "Cliente faz o pedido",
    description: "Pelo celular, o cliente escolhe os produtos, aplica cupons e seleciona entrega ou retirada.",
  },
  {
    icon: ChefHat,
    step: "03",
    title: "Restaurante gerencia",
    description: "Aceite pedidos, atualize o status em tempo real e acompanhe tudo pelo painel.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="section-padding bg-background">
      <div className="container-landing">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Como funciona
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Simples de usar,{" "}
            <span className="text-gradient">poderoso de verdade</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Em apenas 3 passos, seu restaurante está vendendo online
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connector line (desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-full h-px">
                  <div className="w-full h-full bg-gradient-to-r from-primary/50 to-transparent" />
                  <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                </div>
              )}

              <div className="relative bg-card rounded-2xl p-8 border border-border card-hover">
                {/* Step number */}
                <div className="absolute -top-4 left-8 px-3 py-1 bg-primary text-primary-foreground text-sm font-bold rounded-full">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-display font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
