import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import GradingSection from "@/components/GradingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header showAuthButtons={true} />
      <HeroSection />
      <FeaturesSection />
      <GradingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
