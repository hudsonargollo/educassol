import * as React from "react";
import { Sparkles, Wand2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Helper function to capitalize first letter of each word
function capitalizeFirstLetter(name: string): string {
  if (!name) return name;
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export interface WelcomeBannerProps {
  userName?: string;
  onGenerateExam?: () => void;
  className?: string;
}

export function WelcomeBanner({
  userName,
  onGenerateExam,
  className,
}: WelcomeBannerProps) {
  const displayName = capitalizeFirstLetter(userName || "Professor");
  const greeting = getGreeting();

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "border border-examai-purple-500/20 dark:border-examai-purple-500/30",
        "bg-gradient-to-br from-examai-purple-500/5 via-violet-500/5 to-blue-500/5",
        "dark:from-examai-purple-500/20 dark:via-violet-500/10 dark:to-transparent",
        "p-6 md:p-8 shadow-lg dark:shadow-examai-purple-500/5",
        className
      )}
    >
      {/* Animated decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-examai-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-violet-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Welcome Message */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-examai-purple-500/20 animate-bounce-subtle">
              <Sparkles className="h-4 w-4 text-examai-purple-500" />
            </div>
            <span className="text-sm font-semibold text-examai-purple-600 dark:text-examai-purple-400 tracking-wide uppercase">
              {greeting}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
            Bem-vindo, <span className="text-examai-purple-600 dark:text-examai-purple-400">{displayName}</span>!
          </h1>
          <p className="text-muted-foreground max-w-md text-base leading-relaxed">
            Pronto para criar conteúdos educacionais incríveis com a ajuda da
            inteligência artificial?
          </p>
        </div>

        {/* AI Exam Generator Prompt Card */}
        <div
          className={cn(
            "flex-shrink-0 p-5 rounded-xl",
            "bg-white/80 dark:bg-card/60 backdrop-blur-sm",
            "border border-examai-purple-500/20 dark:border-examai-purple-500/30",
            "hover:border-examai-purple-500/40 dark:hover:border-examai-purple-500/50",
            "hover:shadow-lg dark:hover:shadow-examai-purple-500/10",
            "hover:-translate-y-1 transition-all duration-300",
            "group"
          )}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-examai-purple-500 to-violet-600 text-white shadow-examai-purple group-hover:scale-110 transition-transform duration-300">
              <Wand2 className="h-6 w-6" />
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-foreground text-lg">
                  Gerador de Provas com IA
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Crie avaliações personalizadas em segundos
                </p>
              </div>
              {onGenerateExam && (
                <Button
                  onClick={onGenerateExam}
                  variant="cta"
                  size="default"
                  className="group/btn"
                >
                  <Sparkles className="h-4 w-4 mr-2 group-hover/btn:animate-spin" />
                  Gerar Prova
                  <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default WelcomeBanner;
