import { PlanningHeroSection, FeaturePillars, SocialProofStrip, PricingSection, HowItWorksSection, ExamGradingShowcase } from "@/components/landing";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useEffect } from "react";

const Index = () => {
  // Force dark mode on landing page
  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.classList.contains('light') ? 'light' : 'dark';
    
    // Force dark mode
    root.classList.remove('light');
    root.classList.add('dark');
    
    // Restore previous theme when leaving landing page
    return () => {
      root.classList.remove('dark');
      root.classList.add(previousTheme);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header showAuthButtons={true} />
      <PlanningHeroSection />
      <SocialProofStrip />
      <FeaturePillars />
      <HowItWorksSection />
      <ExamGradingShowcase />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
