import { 
  Check,
  Store,
  ShoppingCart,
  Ticket,
  Gift,
  Truck,
  MapPin,
  Clock,
  LayoutDashboard,
  Shield,
  Users,
  BarChart3
} from "lucide-react";

const features = [
  { icon: Store, label: "Multi-restaurante (marketplace)" },
  { icon: ShoppingCart, label: "Página do restaurante com menu" },
  { icon: ShoppingCart, label: "Carrinho e checkout rápido" },
  { icon: Ticket, label: "Cupons de desconto" },
  { icon: Gift, label: "Fidelidade por pontos" },
  { icon: Truck, label: "Frete por distância" },
  { icon: MapPin, label: "Retirada ou entrega" },
  { icon: Clock, label: "Status: realizado → aceito → enviado → entregue" },
  { icon: LayoutDashboard, label: "Painel lojista: produtos, pedidos, status, relatórios" },
  { icon: Shield, label: "Painel admin: lojistas, cupons, regras, auditoria" },
  { icon: Users, label: "Gestão de clientes e endereços" },
  { icon: BarChart3, label: "Relatórios de vendas e desempenho" },
];

export function PlatformFeatures() {
  return (
    <section className="section-padding bg-background">
      <div className="container-landing">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Features List */}
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Recursos da Plataforma
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
              Tudo que uma plataforma de delivery{" "}
              <span className="text-gradient">precisa ter</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Desenvolvemos cada funcionalidade pensando nas necessidades reais de restaurantes e clientes.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-d2u-green/10 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-d2u-green" />
                  </div>
                  <span className="text-sm text-foreground">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Dashboard Mock */}
          <div className="relative">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Hoje</p>
                  <p className="text-2xl font-display font-bold text-foreground">R$ 2.450,00</p>
                </div>
                <div className="px-3 py-1 bg-d2u-green/10 text-d2u-green text-sm font-medium rounded-full">
                  +15% vs ontem
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Pedidos", value: "28" },
                  { label: "Ticket médio", value: "R$ 87" },
                  { label: "Novos clientes", value: "5" },
                ].map((stat, i) => (
                  <div key={i} className="bg-muted rounded-xl p-3 text-center">
                    <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Pedidos recentes</p>
                {[
                  { id: "#1234", status: "Em preparo", value: "R$ 89,90", color: "bg-accent" },
                  { id: "#1233", status: "Enviado", value: "R$ 54,00", color: "bg-primary" },
                  { id: "#1232", status: "Entregue", value: "R$ 120,00", color: "bg-d2u-green" },
                ].map((order, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">{order.id}</span>
                      <span className={`px-2 py-0.5 ${order.color}/20 text-${order.color.replace('bg-', '')} text-xs rounded-full`}>
                        {order.status}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{order.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating notification */}
            <div className="absolute -bottom-4 -left-4 bg-card rounded-xl p-4 shadow-lg border border-border animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Novo pedido!</p>
                  <p className="font-bold text-foreground">#1235</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
