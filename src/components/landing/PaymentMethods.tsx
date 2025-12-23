import { CreditCard, Wallet, QrCode, Banknote, Info } from "lucide-react";

const paymentMethods = [
  {
    icon: CreditCard,
    title: "Cartão de crédito/débito",
    brands: ["Visa", "Mastercard", "Elo", "Amex", "Hipercard"],
  },
  {
    icon: Wallet,
    title: "Vale-refeição",
    brands: ["Alelo", "VR", "Sodexo", "Ticket", "Ben"],
  },
  {
    icon: QrCode,
    title: "Pix",
    brands: ["Pagamento instantâneo"],
  },
  {
    icon: Banknote,
    title: "Dinheiro",
    brands: ["Informe o troco necessário"],
  },
];

export function PaymentMethods() {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container-landing">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Pagamentos
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Pagamento na entrega ou retirada
          </h2>
          <p className="text-muted-foreground">
            O cliente escolhe como pagar. O restaurante recebe diretamente.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {paymentMethods.map((method, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 border border-border text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <method.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-3">
                {method.title}
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {method.brands.map((brand, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info note */}
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start gap-3 bg-primary/5 rounded-xl p-4 border border-primary/20">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Importante:</strong> O site registra o meio de pagamento escolhido. 
              O pagamento acontece diretamente na entrega ou retirada do pedido.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
