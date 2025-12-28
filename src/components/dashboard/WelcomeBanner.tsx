import * as React from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  const displayName = userName || "Professor";
  const greeting = getGreeting();

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-examai-purple-500/20",
        "bg-gradient-to-br from-examai-purple-500/10 via-violet-500/5 to-transparent",
        "p-6 md:p-8",
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-examai-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Welcome Message */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-examai-purple-500" />
            <span className="text-sm font-medium text-examai-purple-500">
              {greeting}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Bem-vindo, {displayName}!
          </h1>
          <p className="text-muted-foreground max-w-md">
            Pronto para criar conteúdos educacionais incríveis com a ajuda da
            inteligência artificial?
          </p>
        </div>

        {/* AI Exam Generator Prompt Card */}
        <div
          className={cn(
            "flex-shrink-0 p-4 rounded-xl",
            "bg-card/50 backdrop-blur-sm border border-examai-purple-500/20",
            "hover:border-examai-purple-500/40 transition-all duration-200"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-examai-purple-500/10">
              <Wand2 className="h-5 w-5 text-examai-purple-500" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">
                Gerador de Provas com IA
              </h3>
              <p className="text-sm text-muted-foreground">
                Crie avaliações personalizadas em segundos
              </p>
              {onGenerateExam && (
                <Button
                  onClick={onGenerateExam}
                  size="sm"
                  className="mt-2 bg-examai-purple-500 hover:bg-examai-purple-600"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Prova
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
