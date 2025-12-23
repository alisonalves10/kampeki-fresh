import { Helmet } from "react-helmet-async";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useParams } from "react-router-dom";
import { Store, MapPin, Clock, Star } from "lucide-react";

export default function RestaurantPage() {
  const { slug } = useParams();

  return (
    <>
      <Helmet>
        <title>Restaurante - Delivery2U</title>
      </Helmet>

      <LandingHeader />

      <main className="pt-20 min-h-screen bg-background">
        {/* Header */}
        <div className="h-48 bg-gradient-teal" />
        
        <div className="container-landing -mt-16 pb-16">
          <div className="bg-card rounded-2xl border border-border p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                  {slug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 text-accent fill-accent" /> 4.8</span>
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> 2.5 km</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 30-45 min</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-d2u-green/10 text-d2u-green text-sm font-medium rounded-full">Aberto</span>
            </div>
          </div>

          <div className="text-center py-16 text-muted-foreground">
            <p>Cardápio do restaurante será implementado na próxima fase.</p>
          </div>
        </div>
      </main>

      <LandingFooter />
    </>
  );
}
