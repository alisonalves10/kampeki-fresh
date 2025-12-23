import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    description: "Para quem está começando",
    price: "99",
    period: "/mês",
    features: [
      "Até 100 pedidos/mês",
      "Cardápio digital completo",
      "Cupons de desconto",
      "Frete por distância",
      "Suporte por e-mail",
    ],
    cta: "Começar grátis",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "O mais escolhido",
    price: "199",
    period: "/mês",
    features: [
      "Pedidos ilimitados",
      "Tudo do Starter",
      "Programa de fidelidade",
      "Relatórios avançados",
      "Suporte prioritário",
      "Múltiplos usuários",
    ],
    cta: "Quero esse plano",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "Para redes e franquias",
    price: "Sob consulta",
    period: "",
    features: [
      "Multi-unidade",
      "Tudo do Pro",
      "API de integração",
      "Relatórios consolidados",
      "Gerente de conta dedicado",
      "SLA garantido",
    ],
    cta: "Falar com vendas",
    highlighted: false,
  },
];

export function PricingPlans() {
  const scrollToLeadForm = () => {
    const element = document.querySelector("#lead-form");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="precos" className="section-padding bg-muted/30">
      <div className="container-landing">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Preços
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Planos que cabem no seu{" "}
            <span className="text-gradient">bolso</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Escolha o plano ideal para o tamanho do seu negócio
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-card rounded-2xl p-8 border ${
                plan.highlighted
                  ? "border-primary shadow-lg scale-105"
                  : "border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                    <Star className="h-4 w-4" />
                    Mais popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="font-display font-bold text-xl text-foreground mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <span className="text-4xl font-display font-bold text-foreground">
                  {plan.price.startsWith("Sob") ? "" : "R$ "}
                  {plan.price}
                </span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-d2u-green/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-d2u-green" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${plan.highlighted ? "glow-primary" : ""}`}
                variant={plan.highlighted ? "default" : "outline"}
                onClick={scrollToLeadForm}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Valores sujeitos a alteração. Todos os planos incluem 14 dias grátis para teste.
        </p>
      </div>
    </section>
  );
}
