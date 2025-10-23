import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, AlertCircle, Edit, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface ClassCardProps {
  classItem: {
    id: string;
    subject: string;
    grade: string;
    total_alunos: number | null;
    possui_ane: boolean;
    detalhes_ane: string | null;
  };
  onEdit: (classItem: any) => void;
  onDelete: (id: string) => void;
}

const ClassCard = ({ classItem, onEdit, onDelete }: ClassCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              {classItem.subject}
            </CardTitle>
            <Badge variant="secondary">{classItem.grade}</Badge>
          </div>
          {classItem.possui_ane && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="h-5 w-5 text-amber-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Turma com Alunos com Necessidades Especiais</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {classItem.total_alunos !== null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{classItem.total_alunos} alunos</span>
            </div>
          )}

          {classItem.possui_ane && classItem.detalhes_ane && (
            <div className="text-sm bg-amber-50 dark:bg-amber-950 p-2 rounded">
              <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                Necessidades Especiais:
              </p>
              <p className="text-amber-800 dark:text-amber-200 text-xs">
                {classItem.detalhes_ane}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(classItem)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir a turma "{classItem.subject} - {classItem.grade}"?
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(classItem.id)}
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

export default ClassCard;
