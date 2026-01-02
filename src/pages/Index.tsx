import { PlanningHeroSection, FeaturePillars, SocialProofStrip, PricingSection, HowItWorksSection } from "@/components/landing";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header showAuthButtons={true} />
      <PlanningHeroSection />
      <SocialProofStrip />
      <FeaturePillars />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
