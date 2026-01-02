import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Download,
  Share2,
  Users,
  Target,
  Lightbulb,
  Settings,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { useWizard, METHODOLOGY_OPTIONS } from "./WizardContext";
import { useWizardNavigation } from "./hooks/useWizardNavigation";
import { SummaryCard } from "./components/SummaryCard";

interface StepReviewProps {
  onClose?: () => void;
}

export const StepReview = ({ onClose }: StepReviewProps) => {
  const { toast } = useToast();
  const { state, resetWizard } = useWizard();
  const { handleBack, goToStep } = useWizardNavigation();
  
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>("");

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        toast({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente.",
          variant: "destructive",
        });
        return;
      }

      const functionName =
        state.contentType === "lesson_plan"
          ? "generate-lesson-plan"
          : state.contentType === "activity"
          ? "generate-activity"
          : "generate-assessment";

      // Map methodology IDs to names
      const methodologyNames = state.methodologies
        .map((id) => METHODOLOGY_OPTIONS.find((m) => m.id === id)?.name)
        .filter(Boolean)
        .join(", ");

      // Map BNCC codes - use first code for bnccCode field, all codes for bnccSkills
      const bnccCodes = state.selectedBnccCodes.map((s) => s.code);
      
      const payload: any = {
        topic: state.topic,
        grade: state.grade,
        subject: state.subject,
        methodology: methodologyNames || "traditional",
        difficultyLevel: "intermediate",
        duration: state.durationPerLesson * state.numberOfLessons,
        durationMinutes: state.durationPerLesson * state.numberOfLessons,
        accessibilityOptions: state.accessibilityOptions,
        specificIdea: state.specificIdea,
        studentsPerClass: state.studentsPerClass,
        numberOfLessons: state.numberOfLessons,
        // Edge function expects bnccCode as string
        bnccCode: bnccCodes.length > 0 ? bnccCodes.join(", ") : undefined,
      };

      // Add class context if available
      if (state.classId) {
        payload.classId = state.classId;
      }
      if (state.classContext) {
        payload.classContext = state.classContext;
      }

      // Add template if selected
      if (state.templateId) {
        payload.templateId = state.templateId;
      }

      console.log("Generating content with payload:", payload);

      const { data: result, error } = await supabase.functions.invoke(
        functionName,
        {
          body: payload,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      // Handle edge function errors
      if (error) {
        console.error("Edge function error:", error);
        toast({
          title: "Erro ao gerar conteúdo",
          description: error.message || "Tente novamente mais tarde",
          variant: "destructive",
        });
        return;
      }

      // Handle response with error field (non-2xx responses like 402 limit exceeded)
      if (result?.error) {
        console.error("Generation error:", result);
        
        // Check if it's a usage limit error
        if (result.limit_type) {
          toast({
            title: "Limite de uso atingido",
            description: `Você atingiu o limite de ${result.limit} ${result.limit_type} para o plano ${result.tier}. Faça upgrade para continuar.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao gerar conteúdo",
            description: result.error,
            variant: "destructive",
          });
        }
        return;
      }

      if (!result?.content) {
        toast({
          title: "Erro ao gerar conteúdo",
          description: "Nenhum conteúdo foi retornado. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      setGeneratedContent(result.content);

      toast({
        title: "Conteúdo gerado!",
        description: "Seu plano de aula foi criado com sucesso",
      });
    } catch (error: any) {
      console.error("Error generating content:", error);
      toast({
        title: "Erro ao gerar conteúdo",
        description: error.message || "Erro de conexão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetWizard();
    onClose?.();
  };

  // Build summary content
  const audienceContent = [
    state.grade || "Ano não definido",
    state.subject || "Disciplina não definida",
    state.classId ? "(via turma)" : "",
  ]
    .filter(Boolean)
    .join(" • ");

  const objectivesContent = [
    state.topic || "Tema não definido",
    state.selectedBnccCodes.length > 0
      ? `${state.selectedBnccCodes.length} habilidades BNCC`
      : "",
  ].filter(Boolean);

  const strategyContent = [
    state.methodologies.length > 0
      ? state.methodologies
          .map((id) => METHODOLOGY_OPTIONS.find((m) => m.id === id)?.name)
          .filter(Boolean)
          .join(", ")
      : "Nenhuma metodologia selecionada",
    state.templateId ? "Template selecionado" : "",
    state.specificIdea ? "Instruções personalizadas" : "",
  ].filter(Boolean);

  const configContent = [
    `${state.numberOfLessons} aula${state.numberOfLessons > 1 ? "s" : ""} de ${state.durationPerLesson} min`,
    `${state.studentsPerClass} alunos`,
    state.noDigitalResources ? "Sem recursos digitais" : "",
    state.accessibilityOptions.length > 0
      ? `${state.accessibilityOptions.length} opções de acessibilidade`
      : "",
  ].filter(Boolean);

  // If content is generated, show the result
  if (generatedContent) {
    return (
      <div className="space-y-8">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Etapa 5 de 5 • Resultado
          </p>
          <h2 className="text-3xl font-bold">Seu Plano de Aula</h2>
        </div>

        <div className="prose prose-sm max-w-none bg-muted/30 p-6 rounded-lg">
          <ReactMarkdown>{generatedContent}</ReactMarkdown>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
          <Button variant="outline" className="flex-1">
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar
          </Button>
        </div>

        <div className="flex justify-end pt-6">
          <Button onClick={handleClose}>Concluir</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Etapa 5 de 5 • Revisão
        </p>
        <h2 className="text-3xl font-bold">Revise e Gere seu Conteúdo</h2>
        <p className="text-muted-foreground mt-2">
          Confira as informações antes de gerar. Clique em qualquer seção para
          editar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard
          title="Público-Alvo"
          content={audienceContent}
          editStep={1}
          onEdit={goToStep}
          icon={<Users className="h-4 w-4" />}
        />

        <SummaryCard
          title="Objetivos"
          content={objectivesContent}
          editStep={2}
          onEdit={goToStep}
          icon={<Target className="h-4 w-4" />}
        />

        <SummaryCard
          title="Estratégia"
          content={strategyContent}
          editStep={3}
          onEdit={goToStep}
          icon={<Lightbulb className="h-4 w-4" />}
        />

        <SummaryCard
          title="Configuração"
          content={configContent}
          editStep={4}
          onEdit={goToStep}
          icon={<Settings className="h-4 w-4" />}
        />
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={loading}
          size="lg"
          className="min-w-[200px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Gerar com IA
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StepReview;
