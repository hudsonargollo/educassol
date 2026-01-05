import { PlanningHeroSection, FeaturePillars, SocialProofStrip, PricingSection, HowItWorksSection, ExamGradingShowcase } from "@/components/landing";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useEffect, useLayoutEffect } from "react";

const Index = () => {
  // Force dark mode on landing page - use useLayoutEffect to prevent flash
  useLayoutEffect(() => {
    const root = document.documentElement;
    const storedTheme = localStorage.getItem('examai-theme');
    
    // Force dark mode immediately
    root.classList.remove('light');
    root.classList.add('dark');
    
    // Restore user's theme preference when leaving
    return () => {
      if (storedTheme === 'light') {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background dark">
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
