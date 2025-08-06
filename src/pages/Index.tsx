import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import BNCCSection from "@/components/BNCCSection";
import UserExperienceSection from "@/components/UserExperienceSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <BNCCSection />
      <UserExperienceSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
