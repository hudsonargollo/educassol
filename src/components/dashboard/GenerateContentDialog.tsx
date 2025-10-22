import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface GenerateContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: string;
}

const GenerateContentDialog = ({ open, onOpenChange, contentType }: GenerateContentDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    grade: "",
    subject: "",
    bnccCode: "",
    methodology: "traditional",
    durationMinutes: "",
    difficultyLevel: "intermediate",
    accessibilityOptions: [] as string[],
  });

  const contentTypeLabels: Record<string, string> = {
    lesson_plan: "Plano de Aula",
    activity: "Atividade",
    assessment: "Avaliação",
  };

  const handleGenerate = async () => {
    if (!formData.topic || !formData.grade || !formData.subject) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const functionName = contentType === "lesson_plan" 
        ? "generate-lesson-plan" 
        : contentType === "activity"
        ? "generate-activity"
        : "generate-assessment";

      const payload: any = {
        topic: formData.topic,
        grade: formData.grade,
        subject: formData.subject,
        methodology: formData.methodology,
        difficultyLevel: formData.difficultyLevel,
      };

      if (formData.bnccCode) {
        payload.bnccCode = formData.bnccCode;
      }

      if (formData.durationMinutes) {
        payload.durationMinutes = parseInt(formData.durationMinutes);
      }

      if (formData.accessibilityOptions.length > 0) {
        payload.accessibilityOptions = formData.accessibilityOptions;
      }

      if (contentType === "activity") {
        payload.activityType = "Atividade Prática";
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
      });

      if (error) throw error;

      toast({
        title: "Conteúdo gerado!",
        description: `${contentTypeLabels[contentType]} criado com sucesso`,
      });

      onOpenChange(false);
      // Reset form
      setFormData({
        topic: "",
        grade: "",
        subject: "",
        bnccCode: "",
        methodology: "traditional",
        durationMinutes: "",
        difficultyLevel: "intermediate",
        accessibilityOptions: [],
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerar {contentTypeLabels[contentType]}</DialogTitle>
          <DialogDescription>
            Preencha os dados para gerar seu conteúdo educacional
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Tema *</Label>
            <Input
              id="topic"
              placeholder="Ex: Ciclo da Água"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Série *</Label>
              <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1º ano">1º ano</SelectItem>
                  <SelectItem value="2º ano">2º ano</SelectItem>
                  <SelectItem value="3º ano">3º ano</SelectItem>
                  <SelectItem value="4º ano">4º ano</SelectItem>
                  <SelectItem value="5º ano">5º ano</SelectItem>
                  <SelectItem value="6º ano">6º ano</SelectItem>
                  <SelectItem value="7º ano">7º ano</SelectItem>
                  <SelectItem value="8º ano">8º ano</SelectItem>
                  <SelectItem value="9º ano">9º ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Disciplina *</Label>
              <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Português">Português</SelectItem>
                  <SelectItem value="Matemática">Matemática</SelectItem>
                  <SelectItem value="Ciências">Ciências</SelectItem>
                  <SelectItem value="História">História</SelectItem>
                  <SelectItem value="Geografia">Geografia</SelectItem>
                  <SelectItem value="Inglês">Inglês</SelectItem>
                  <SelectItem value="Artes">Artes</SelectItem>
                  <SelectItem value="Educação Física">Educação Física</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bnccCode">Código BNCC (opcional)</Label>
            <Input
              id="bnccCode"
              placeholder="Ex: EF05CI02"
              value={formData.bnccCode}
              onChange={(e) => setFormData({ ...formData, bnccCode: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="methodology">Metodologia</Label>
              <Select value={formData.methodology} onValueChange={(value) => setFormData({ ...formData, methodology: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traditional">Tradicional</SelectItem>
                  <SelectItem value="active_learning">Metodologias Ativas</SelectItem>
                  <SelectItem value="project_based">Baseada em Projetos</SelectItem>
                  <SelectItem value="gamification">Gamificação</SelectItem>
                  <SelectItem value="flipped_classroom">Sala de Aula Invertida</SelectItem>
                  <SelectItem value="collaborative">Colaborativa</SelectItem>
                  <SelectItem value="inquiry_based">Por Investigação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficultyLevel">Nível de Dificuldade</Label>
              <Select value={formData.difficultyLevel} onValueChange={(value) => setFormData({ ...formData, difficultyLevel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="intermediate">Intermediário</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duração (minutos)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="Ex: 50"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gerar Conteúdo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateContentDialog;
