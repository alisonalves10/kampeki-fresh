import { useState } from "react";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function LeadForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    restaurant_name: "",
    whatsapp: "",
    city: "",
    orders_per_day: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.restaurant_name || !formData.whatsapp || !formData.city) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          name: formData.name,
          restaurant_name: formData.restaurant_name,
          whatsapp: formData.whatsapp,
          city: formData.city,
          orders_per_day: formData.orders_per_day || null,
        });

      if (error) throw error;
      
      setIsSubmitted(true);
      toast({
        title: "Cadastro realizado!",
        description: "Entraremos em contato em breve.",
      });
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="lead-form" className="section-padding bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container-landing">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-d2u-green/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-d2u-green" />
            </div>
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Cadastro realizado!
            </h2>
            <p className="text-muted-foreground mb-8">
              Obrigado pelo interesse! Nossa equipe entrará em contato pelo WhatsApp informado em até 24 horas.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: "",
                  restaurant_name: "",
                  whatsapp: "",
                  city: "",
                  orders_per_day: "",
                });
              }}
            >
              Fazer outro cadastro
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="lead-form" className="section-padding bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="container-landing">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Comece agora
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
              Quero vender com a{" "}
              <span className="text-gradient">Delivery2U</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Preencha o formulário e nossa equipe entrará em contato para ajudar você a começar a vender online.
            </p>

            <ul className="space-y-4">
              {[
                "Cadastro gratuito e sem compromisso",
                "Suporte para configurar seu cardápio",
                "14 dias grátis para testar",
                "Sem taxa de adesão",
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-d2u-green/20 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-d2u-green" />
                  </div>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Form */}
          <div className="bg-card rounded-2xl p-8 border border-border shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name">Nome do responsável *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="restaurant_name">Nome do restaurante *</Label>
                <Input
                  id="restaurant_name"
                  name="restaurant_name"
                  value={formData.restaurant_name}
                  onChange={handleChange}
                  placeholder="Nome do seu estabelecimento"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Sua cidade"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="orders_per_day">
                  Quantidade de pedidos/dia (opcional)
                </Label>
                <Input
                  id="orders_per_day"
                  name="orders_per_day"
                  value={formData.orders_per_day}
                  onChange={handleChange}
                  placeholder="Ex: 20-50 pedidos"
                  className="mt-1.5"
                />
              </div>

              <Button
                type="submit"
                className="w-full glow-primary"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Quero começar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Ao enviar, você concorda com nossos{" "}
                <a href="/termos" className="text-primary hover:underline">
                  Termos de Uso
                </a>{" "}
                e{" "}
                <a href="/privacidade" className="text-primary hover:underline">
                  Política de Privacidade
                </a>
                .
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
