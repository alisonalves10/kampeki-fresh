import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Silva",
    role: "Proprietário",
    restaurant: "Cantina do Carlos",
    avatar: "C",
    content: "Desde que comecei a usar a Delivery2U, minhas vendas aumentaram 40%. O sistema de pontos fidelizou muito meus clientes.",
    rating: 5,
  },
  {
    name: "Ana Paula",
    role: "Gerente",
    restaurant: "Sabor da Terra",
    avatar: "A",
    content: "A gestão de pedidos ficou muito mais simples. Consigo acompanhar tudo em tempo real pelo celular.",
    rating: 5,
  },
  {
    name: "Roberto Mendes",
    role: "Proprietário",
    restaurant: "Burger House",
    avatar: "R",
    content: "O suporte é excelente e a plataforma é muito intuitiva. Meus clientes adoram a facilidade de fazer pedidos.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="section-padding bg-background">
      <div className="container-landing">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Depoimentos
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            O que nossos parceiros{" "}
            <span className="text-gradient-orange">dizem</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Restaurantes de todo o Brasil já estão vendendo mais com a Delivery2U
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 border border-border relative"
            >
              {/* Quote icon */}
              <div className="absolute -top-4 right-8">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Quote className="h-4 w-4 text-primary" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-teal flex items-center justify-center text-primary-foreground font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-medium text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} · {testimonial.restaurant}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
