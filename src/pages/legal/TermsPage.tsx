import { Helmet } from "react-helmet-async";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function TermsPage() {
  return (
    <>
      <Helmet>
        <title>Termos de Uso - Delivery2U</title>
      </Helmet>
      <LandingHeader />
      <main className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container-landing max-w-3xl">
          <h1 className="text-3xl font-display font-bold text-foreground mb-8">Termos de Uso</h1>
          <div className="prose prose-neutral dark:prose-invert">
            <p className="text-muted-foreground">Os termos de uso da plataforma Delivery2U serão disponibilizados em breve.</p>
          </div>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
