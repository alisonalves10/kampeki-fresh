import { 
  TrendingUp, 
  Settings, 
  Gift, 
  Ticket, 
  Truck, 
  CreditCard,
  BarChart3,
  Users
} from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "Venda direta",
    description: "Menos atrito, mais conversão. Cliente pede direto do seu cardápio digital.",
  },
  {
    icon: Settings,
    title: "Gestão simples",
    description: "Pedidos, status, produtos e relatórios. Tudo em um painel intuitivo.",
  },
  {
    icon: Gift,
    title: "Programa de fidelidade",
    description: "R$1 = 1 ponto. Clientes acumulam e trocam por descontos automaticamente.",
  },
  {
    icon: Ticket,
    title: "Cupons promocionais",
    description: "Crie campanhas e promoções com cupons de desconto por período.",
  },
  {
    icon: Truck,
    title: "Frete por distância",
    description: "Configure regras de frete automáticas por km ou faixa de CEP.",
  },
  {
    icon: CreditCard,
    title: "Pagamento flexível",
    description: "Cartão, vale-refeição, Pix ou dinheiro. Pagamento na entrega/retirada.",
  },
  {
    icon: BarChart3,
    title: "Relatórios completos",
    description: "Acompanhe vendas, produtos mais pedidos e desempenho do seu delivery.",
  },
  {
    icon: Users,
    title: "Base de clientes",
    description: "Construa sua base de clientes e fidelize com pontos e promoções.",
  },
];

export function BenefitsRestaurants() {
  return (
    <section id="beneficios-restaurantes" className="section-padding bg-muted/30">
      <div className="container-landing">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Para Restaurantes
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Tudo que você precisa para{" "}
            <span className="text-gradient-orange">vender mais</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Recursos pensados para aumentar suas vendas e fidelizar clientes
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl p-6 border border-border card-hover"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
