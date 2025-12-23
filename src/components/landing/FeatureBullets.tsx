import { 
  ShoppingCart, 
  Ticket, 
  MapPin, 
  Clock, 
  LayoutDashboard,
  Gift
} from "lucide-react";

const features = [
  { icon: ShoppingCart, label: "Cardápio digital + carrinho" },
  { icon: Ticket, label: "Cupons e fidelidade por pontos" },
  { icon: MapPin, label: "Frete automático por distância" },
  { icon: Clock, label: "Status do pedido em tempo real" },
  { icon: LayoutDashboard, label: "Painel do lojista + controle total" },
  { icon: Gift, label: "Programa de pontos integrado" },
];

export function FeatureBullets() {
  return (
    <section className="py-8 bg-muted/50 border-y border-border">
      <div className="container-landing">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border"
            >
              <feature.icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground whitespace-nowrap">
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
