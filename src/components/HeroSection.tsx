import { Button } from "@/components/ui/button";
import { Sun, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  const cities = ["Jequié", "Itagi", "Ipiaú", "Jitaúna", "Ilhéus", "Ibirataia"];
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentCity = cities[currentCityIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = 1500;

    const timeout = setTimeout(() => {
      if (!isDeleting && displayedText === currentCity) {
        // Pause before deleting
        setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (isDeleting && displayedText === "") {
        // Move to next city
        setIsDeleting(false);
        setCurrentCityIndex((prevIndex) => (prevIndex + 1) % cities.length);
      } else if (isDeleting) {
        // Delete character
        setDisplayedText(currentCity.substring(0, displayedText.length - 1));
      } else {
        // Type character
        setDisplayedText(currentCity.substring(0, displayedText.length + 1));
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentCityIndex, cities]);
  return (
    <section className="relative min-h-[100dvh] bg-gradient-hero flex items-center overflow-hidden py-8 sm:py-12">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-sun rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-gradient-warm rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-accent rounded-full blur-lg"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content Side */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-gradient-sun rounded-xl shadow-warm">
                <Sun className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-sun bg-clip-text text-transparent">
                EDUCA SOL
              </h1>
            </div>

            {/* Main Headlines */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="font-bold text-foreground leading-tight break-words" style={{ fontSize: 'clamp(1.875rem, 5vw, 3.75rem)' }}>
                Ilumine o Futuro da{" "}
                <span className="bg-gradient-sun bg-clip-text text-transparent">
                  Educação Primária
                </span>{" "}
                em <span className="inline-block min-w-[120px]">{displayedText}<span className="animate-pulse">|</span></span>.
              </h1>
              
              <h2 className="text-muted-foreground font-medium leading-relaxed" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
                Transforme sua Rotina de Planejamento com IA, 
                Alinhada à BNCC.
              </h2>
            </div>

            {/* Intro Paragraph */}
            <p className="text-base sm:text-lg text-foreground/80 leading-relaxed max-w-xl">
              Economize horas preciosas na preparação de aulas e atividades. 
              EducaSol cria conteúdo educacional personalizado, sempre seguindo 
              as diretrizes da BNCC, para que você possa focar no que realmente 
              importa: ensinar e inspirar seus alunos.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
              <Button 
                variant="hero" 
                size="xl" 
                className="group w-full sm:w-auto min-h-[48px] text-sm sm:text-base px-6 py-3"
                onClick={() => navigate('/auth')}
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-spin" />
                <span className="truncate">Comece a Brilhar!</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="xl"
                className="w-full sm:w-auto min-h-[48px] px-6 py-3"
                onClick={() => navigate('/auth')}
              >
                Já tem conta? Faça Login
              </Button>
            </div>

          </div>

          {/* Visual Side */}
          <div className="relative">
            {/* Placeholder for product visual - Dashboard screenshot or AI education illustration */}
            <div className="relative bg-card rounded-2xl p-6 sm:p-8 shadow-warm hover:shadow-glow transition-all duration-500 transform hover:scale-105">
              <div className="bg-gradient-hero rounded-xl p-4 sm:p-6 min-h-[250px] sm:min-h-[300px] lg:min-h-[400px] flex items-center justify-center border border-border/20">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-sun rounded-full flex items-center justify-center mx-auto animate-glow-pulse">
                    <Sparkles className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">
                    Dashboard Preview
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    {/* Compelling product visual placeholder - screenshot of dashboard or AI education illustration */}
                    Interface intuitiva da plataforma EDUCA SOL
                  </p>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;