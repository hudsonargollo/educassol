import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { validateRubric, type Rubric, type RubricQuestion } from "@/lib/assessment/rubric";

interface ExamCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingExam?: ExamData | null;
  onSuccess?: () => void;
}

interface ExamData {
  id: string;
  title: string;
  description: string | null;
  class_id: string | null;
  rubric: Rubric;
  status: "draft" | "published" | "archived";
}

interface ClassOption {
  id: string;
  subject: string;
  grade: string;
}

const emptyQuestion: RubricQuestion = {
  number: "",
  topic: "",
  max_points: 10,
  expected_answer: "",
  partial_credit_criteria: [],
  keywords: [],
};

const ExamCreator = ({ open, onOpenChange, editingExam, onSuccess }: ExamCreatorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    class_id: "",
    status: "draft" as "draft" | "published" | "archived",
  });

  const [rubric, setRubric] = useState<Rubric>({
    title: "",
    total_points: 100,
    questions: [{ ...emptyQuestion, number: "1" }],
    grading_instructions: "",
  });

  // Load classes for the selector
  useEffect(() => {
    const loadClasses = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("id", session.user.id)
        .single();

      if (profile?.school_id) {
        const { data: classesData } = await supabase
          .from("classes")
          .select("id, subject, grade")
          .eq("school_id", profile.school_id)
          .order("subject");

        setClasses(classesData || []);
      }
    };

    if (open) {
      loadClasses();
    }
  }, [open]);

  // Populate form when editing
  useEffect(() => {
    if (editingExam) {
      setFormData({
        title: editingExam.title,
        description: editingExam.description || "",
        class_id: editingExam.class_id || "",
        status: editingExam.status,
      });
      setRubric(editingExam.rubric);
    } else {
      // Reset form for new exam
      setFormData({
        title: "",
        description: "",
        class_id: "",
        status: "draft",
      });
      setRubric({
        title: "",
        total_points: 100,
        questions: [{ ...emptyQuestion, number: "1" }],
        grading_instructions: "",
      });
    }
  }, [editingExam, open]);

  const addQuestion = () => {
    const newNumber = (rubric.questions.length + 1).toString();
    setRubric({
      ...rubric,
      questions: [...rubric.questions, { ...emptyQuestion, number: newNumber }],
    });
  };

  const removeQuestion = (index: number) => {
    if (rubric.questions.length <= 1) {
      toast({
        title: "Erro",
        description: "A prova deve ter pelo menos uma questão.",
        variant: "destructive",
      });
      return;
    }
    const newQuestions = rubric.questions.filter((_, i) => i !== index);
    // Renumber questions
    const renumbered = newQuestions.map((q, i) => ({ ...q, number: (i + 1).toString() }));
    setRubric({ ...rubric, questions: renumbered });
  };

  const updateQuestion = (index: number, field: keyof RubricQuestion, value: any) => {
    const newQuestions = [...rubric.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setRubric({ ...rubric, questions: newQuestions });
  };

  const calculateTotalPoints = () => {
    return rubric.questions.reduce((sum, q) => sum + (q.max_points || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("id", session.user.id)
        .single();

      if (!profile?.school_id) {
        throw new Error("Perfil não encontrado ou escola não associada.");
      }

      // Update rubric title and total_points
      const finalRubric: Rubric = {
        ...rubric,
        title: formData.title,
        total_points: calculateTotalPoints(),
      };

      // Validate rubric
      const validation = validateRubric(finalRubric);
      if (!validation.success) {
        const errorMessages = validation.errors?.map(e => e.message).join(", ");
        throw new Error(`Rubrica inválida: ${errorMessages}`);
      }

      const examData = {
        title: formData.title,
        description: formData.description || null,
        class_id: formData.class_id || null,
        rubric: finalRubric,
        status: formData.status,
        educator_id: session.user.id,
        school_id: profile.school_id,
      };

      if (editingExam) {
        const { error } = await supabase
          .from("exams")
          .update({
            title: examData.title,
            description: examData.description,
            class_id: examData.class_id,
            rubric: examData.rubric,
            status: examData.status,
          })
          .eq("id", editingExam.id);

        if (error) throw error;

        toast({
          title: "Prova atualizada",
          description: "As informações da prova foram atualizadas com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from("exams")
          .insert([examData]);

        if (error) throw error;

        toast({
          title: "Prova criada",
          description: "A prova foi criada com sucesso.",
        });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingExam ? "Editar Prova" : "Nova Prova"}
          </DialogTitle>
          <DialogDescription>
            Configure a prova e defina os critérios de avaliação (rubrica) para correção automática
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Prova *</Label>
              <Input
                id="title"
                placeholder="Ex: Prova de Matemática - Frações"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição opcional da prova..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class">Turma</Label>
                <Select
                  value={formData.class_id}
                  onValueChange={(value) => setFormData({ ...formData, class_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a turma (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma turma</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.subject} - {cls.grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "draft" | "published" | "archived") => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="published">Publicada</SelectItem>
                    <SelectItem value="archived">Arquivada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Rubric Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Rubrica de Avaliação</h3>
                <p className="text-sm text-muted-foreground">
                  Total de pontos: {calculateTotalPoints()}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Questão
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grading_instructions">Instruções Gerais de Correção</Label>
              <Textarea
                id="grading_instructions"
                placeholder="Instruções gerais para a IA sobre como corrigir esta prova..."
                value={rubric.grading_instructions || ""}
                onChange={(e) => setRubric({ ...rubric, grading_instructions: e.target.value })}
                rows={2}
              />
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {rubric.questions.map((question, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Questão {question.number}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Tópico *</Label>
                      <Input
                        placeholder="Ex: Soma de frações"
                        value={question.topic}
                        onChange={(e) => updateQuestion(index, "topic", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Pontuação Máxima *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={question.max_points}
                        onChange={(e) => updateQuestion(index, "max_points", parseInt(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Resposta Esperada</Label>
                    <Textarea
                      placeholder="Descreva a resposta esperada ou critérios de acerto..."
                      value={question.expected_answer || ""}
                      onChange={(e) => updateQuestion(index, "expected_answer", e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Palavras-chave (separadas por vírgula)</Label>
                    <Input
                      placeholder="Ex: fração, denominador, numerador"
                      value={question.keywords?.join(", ") || ""}
                      onChange={(e) => updateQuestion(index, "keywords", 
                        e.target.value.split(",").map(k => k.trim()).filter(k => k)
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : editingExam ? "Atualizar" : "Criar Prova"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExamCreator;
