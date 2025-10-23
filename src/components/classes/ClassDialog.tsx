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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingClass?: any | null;
}

const GRADE_OPTIONS = [
  "1º ano",
  "2º ano",
  "3º ano",
  "4º ano",
  "5º ano",
];

const ClassDialog = ({ open, onOpenChange, editingClass }: ClassDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    grade: "",
    total_alunos: "",
    possui_ane: false,
    detalhes_ane: "",
  });

  useEffect(() => {
    if (editingClass) {
      setFormData({
        subject: editingClass.subject,
        grade: editingClass.grade,
        total_alunos: editingClass.total_alunos?.toString() || "",
        possui_ane: editingClass.possui_ane || false,
        detalhes_ane: editingClass.detalhes_ane || "",
      });
    } else {
      setFormData({
        subject: "",
        grade: "",
        total_alunos: "",
        possui_ane: false,
        detalhes_ane: "",
      });
    }
  }, [editingClass, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      // Get user's school_id from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("id", session.user.id)
        .single();

      if (!profile?.school_id) {
        throw new Error("Escola não encontrada no perfil");
      }

      const classData = {
        subject: formData.subject,
        grade: formData.grade,
        total_alunos: formData.total_alunos ? parseInt(formData.total_alunos) : null,
        possui_ane: formData.possui_ane,
        detalhes_ane: formData.possui_ane ? formData.detalhes_ane : null,
        school_id: profile.school_id,
        teacher_id: session.user.id,
      };

      if (editingClass) {
        const { error } = await supabase
          .from("classes")
          .update(classData)
          .eq("id", editingClass.id);

        if (error) throw error;

        toast({
          title: "Turma atualizada",
          description: "As informações da turma foram atualizadas com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from("classes")
          .insert([classData]);

        if (error) throw error;

        toast({
          title: "Turma criada",
          description: "A turma foi criada com sucesso.",
        });
      }

      onOpenChange(true); // true = should refresh
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
    <Dialog open={open} onOpenChange={() => onOpenChange(false)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingClass ? "Editar Turma" : "Nova Turma"}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações da turma para personalizar o conteúdo gerado pela IA
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Nome da Turma / Disciplina *</Label>
            <Input
              id="subject"
              placeholder="Ex: Matemática, Português, 5º A..."
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Ano Escolar *</Label>
            <Select
              value={formData.grade}
              onValueChange={(value) => setFormData({ ...formData, grade: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {GRADE_OPTIONS.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_alunos">Número Total de Alunos</Label>
            <Input
              id="total_alunos"
              type="number"
              min="1"
              placeholder="Ex: 30"
              value={formData.total_alunos}
              onChange={(e) => setFormData({ ...formData, total_alunos: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Este número será usado pela IA para contextualizar as atividades
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="possui_ane"
                checked={formData.possui_ane}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, possui_ane: checked as boolean })
                }
              />
              <Label htmlFor="possui_ane" className="cursor-pointer">
                Esta turma possui Alunos com Necessidades Especiais (ANE)
              </Label>
            </div>

            {formData.possui_ane && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="detalhes_ane">Detalhes sobre as ANEs</Label>
                <Textarea
                  id="detalhes_ane"
                  placeholder="Descreva as necessidades especiais dos alunos para que a IA possa adaptar o conteúdo..."
                  value={formData.detalhes_ane}
                  onChange={(e) => setFormData({ ...formData, detalhes_ane: e.target.value })}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Quanto mais detalhes você fornecer, mais personalizado será o conteúdo gerado
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : editingClass ? "Atualizar" : "Criar Turma"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClassDialog;
