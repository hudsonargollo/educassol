import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Share2 } from "lucide-react";
import { WizardData } from "../ContentWizard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface StepFiveProps {
  data: WizardData;
  onClose: () => void;
  contentType: string;
}

export const StepFive = ({ data, onClose, contentType }: StepFiveProps) => {
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const { toast } = useToast();

  const generateFinalContent = async () => {
    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Sessão inválida. Por favor, faça login novamente.");
      }

      const functionName = contentType === "lesson_plan" 
        ? "generate-lesson-plan" 
        : contentType === "activity"
        ? "generate-activity"
        : "generate-assessment";

      const payload: any = {
        topic: data.topics.join(", "),
        grade: data.grade,
        subject: data.subject,
        methodology: data.methodologies.join(", ") || "traditional",
        difficultyLevel: "intermediate",
        durationMinutes: data.durationPerLesson * data.numberOfLessons,
        accessibilityOptions: data.accessibilityOptions,
        specificIdea: data.specificIdea,
        studentsPerClass: data.studentsPerClass,
        numberOfLessons: data.numberOfLessons,
      };

      if (contentType === "activity") {
        payload.activityType = data.selectedActivity?.title || "Atividade Prática";
      }

      const { data: result, error } = await supabase.functions.invoke(functionName, {
        body: payload,
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || "Erro ao chamar função");
      }

      if (!result) {
        throw new Error("Nenhum dado retornado");
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
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    generateFinalContent();
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Criando seu plano de aula: Etapa 5 de 5</p>
        <h2 className="text-3xl font-bold">Plano de Aula</h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground text-center">
            Gerando seu plano de aula completo...
          </p>
        </div>
      ) : generatedContent ? (
        <div className="space-y-6">
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
        </div>
      ) : null}

      <div className="flex justify-end pt-6">
        <Button onClick={onClose}>
          Concluir
        </Button>
      </div>
    </div>
  );
};
