import { Helmet } from "react-helmet-async";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Store, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const placeholderRestaurants = [
  { id: 1, name: "Cantina do Carlos", slug: "cantina-do-carlos", category: "Italiana", isOpen: true },
  { id: 2, name: "Sabor da Terra", slug: "sabor-da-terra", category: "Brasileira", isOpen: true },
  { id: 3, name: "Burger House", slug: "burger-house", category: "Hambúrgueres", isOpen: false },
  { id: 4, name: "Sushi Express", slug: "sushi-express", category: "Japonesa", isOpen: true },
  { id: 5, name: "Pizza Napoli", slug: "pizza-napoli", category: "Pizzaria", isOpen: true },
  { id: 6, name: "Taco Loco", slug: "taco-loco", category: "Mexicana", isOpen: false },
];

export default function RestaurantsList() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Restaurantes - Delivery2U</title>
        <meta name="description" content="Encontre restaurantes parceiros da Delivery2U e faça seu pedido online." />
      </Helmet>

      <LandingHeader />

      <main className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container-landing">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Restaurantes parceiros
            </h1>
            <p className="text-muted-foreground">Escolha onde você quer pedir</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {placeholderRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-card rounded-2xl border border-border overflow-hidden card-hover cursor-pointer"
                onClick={() => navigate(`/restaurante/${restaurant.slug}`)}
              >
                <div className="h-32 bg-gradient-teal" />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center -mt-10 border-4 border-card">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${restaurant.isOpen ? 'bg-d2u-green/10 text-d2u-green' : 'bg-destructive/10 text-destructive'}`}>
                      {restaurant.isOpen ? "Aberto" : "Fechado"}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-foreground text-lg mb-1">{restaurant.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{restaurant.category}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> 2.5 km</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 30-45 min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <LandingFooter />
    </>
  );
}
