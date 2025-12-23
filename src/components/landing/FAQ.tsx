import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "A Delivery2U é marketplace ou loja própria?",
    answer: "A Delivery2U é uma plataforma multi-restaurante (marketplace). Cada restaurante tem sua página própria com cardápio, mas todos fazem parte da mesma plataforma. Clientes podem descobrir novos restaurantes e os restaurantes ganham mais visibilidade.",
  },
  {
    question: "Como funciona o frete por distância?",
    answer: "Você configura faixas de distância (por exemplo: 0-3km, 3-6km, 6-10km) e define o valor do frete para cada faixa. O sistema calcula automaticamente o frete com base no endereço do cliente.",
  },
  {
    question: "Como funciona a fidelidade por pontos?",
    answer: "A cada R$1 gasto, o cliente ganha 1 ponto. Os pontos são creditados automaticamente após a confirmação da entrega. Quando acumula 100 pontos, o cliente pode trocar por R$1 de desconto no próximo pedido.",
  },
  {
    question: "O pagamento é online?",
    answer: "Não. O site registra o meio de pagamento escolhido pelo cliente (cartão, vale, Pix ou dinheiro), mas o pagamento acontece diretamente na entrega ou retirada. Isso elimina taxas de gateway e simplifica a operação.",
  },
  {
    question: "O cliente precisa criar conta?",
    answer: "Para fazer um pedido, sim. O cadastro é simples e rápido, e permite que o cliente salve endereços, acompanhe pedidos e acumule pontos de fidelidade.",
  },
  {
    question: "Consigo cadastrar meu cardápio completo?",
    answer: "Sim! Você pode cadastrar produtos ilimitados, organizados por categorias. Cada produto pode ter foto, descrição, preço e opções de adicionais/personalizações.",
  },
  {
    question: "Consigo ativar cupons por período?",
    answer: "Sim! Você pode criar cupons com data de início e fim, valor mínimo do pedido, desconto em porcentagem ou valor fixo, e limite de usos.",
  },
  {
    question: "Tenho painel para acompanhar pedidos e valores?",
    answer: "Sim! O painel do lojista mostra todos os pedidos em tempo real, com status, valores e relatórios. Você pode aceitar pedidos, atualizar status e acompanhar o desempenho do seu delivery.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="section-padding bg-muted/30">
      <div className="container-landing">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Perguntas frequentes
            </h2>
            <p className="text-muted-foreground">
              Tire suas dúvidas sobre a plataforma
            </p>
          </div>

          {/* Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl border border-border px-6"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
