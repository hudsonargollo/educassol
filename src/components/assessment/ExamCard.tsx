import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileQuestion, Edit, Trash2, Upload, Eye, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Rubric } from "@/lib/assessment/rubric";

interface ExamCardProps {
  exam: {
    id: string;
    title: string;
    description: string | null;
    status: "draft" | "published" | "archived";
    rubric: Rubric;
    created_at: string;
    submission_count?: number;
  };
  onEdit: (exam: any) => void;
  onDelete: (id: string) => void;
  onUpload: (examId: string, examTitle: string) => void;
  onViewSubmissions: (examId: string, examTitle: string) => void;
}

const statusLabels = {
  draft: { label: "Rascunho", variant: "secondary" as const },
  published: { label: "Publicada", variant: "default" as const },
  archived: { label: "Arquivada", variant: "outline" as const },
};

const ExamCard = ({ exam, onEdit, onDelete, onUpload, onViewSubmissions }: ExamCardProps) => {
  const statusInfo = statusLabels[exam.status];
  const questionCount = exam.rubric?.questions?.length || 0;
  const totalPoints = exam.rubric?.total_points || 0;
  const canDelete = (exam.submission_count || 0) === 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 mb-2">
              <FileQuestion className="h-5 w-5 text-primary" />
              {exam.title}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              <Badge variant="outline">{questionCount} questões</Badge>
              <Badge variant="outline">{totalPoints} pts</Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {exam.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {exam.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{exam.submission_count || 0} submissões</span>
          </div>

          <p className="text-xs text-muted-foreground">
            Criada em: {new Date(exam.created_at).toLocaleDateString("pt-BR")}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {exam.status === "published" && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onUpload(exam.id, exam.title)}
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Button>
            )}
            
            {(exam.submission_count || 0) > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewSubmissions(exam.id, exam.title)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver Submissões
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(exam)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:text-destructive"
                  disabled={!canDelete}
                  title={!canDelete ? "Não é possível excluir provas com submissões" : ""}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir a prova "{exam.title}"?
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(exam.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamCard;
