import { Helmet } from "react-helmet-async";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { FeatureBullets } from "@/components/landing/FeatureBullets";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { BenefitsRestaurants } from "@/components/landing/BenefitsRestaurants";
import { BenefitsCustomers } from "@/components/landing/BenefitsCustomers";
import { LoyaltySection } from "@/components/landing/LoyaltySection";
import { PaymentMethods } from "@/components/landing/PaymentMethods";
import { PlatformFeatures } from "@/components/landing/PlatformFeatures";
import { PricingPlans } from "@/components/landing/PricingPlans";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { LeadForm } from "@/components/landing/LeadForm";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title>Delivery2U - Plataforma de Delivery para Restaurantes</title>
        <meta
          name="description"
          content="A Delivery2U é uma plataforma completa para restaurantes venderem online com cardápio digital, cupons, fidelidade por pontos, frete por distância e gestão de pedidos em tempo real."
        />
        <meta
          name="keywords"
          content="plataforma de delivery, cardápio digital, pedidos online, para restaurantes, delivery para restaurantes"
        />
      </Helmet>

      <LandingHeader />
      
      <main>
        <LandingHero />
        <FeatureBullets />
        <HowItWorks />
        <BenefitsRestaurants />
        <BenefitsCustomers />
        <LoyaltySection />
        <PaymentMethods />
        <PlatformFeatures />
        <PricingPlans />
        <Testimonials />
        <FAQ />
        <LeadForm />
      </main>

      <LandingFooter />
    </>
  );
}
