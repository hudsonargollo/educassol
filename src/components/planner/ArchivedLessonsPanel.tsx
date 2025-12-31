/**
 * ArchivedLessonsPanel Component
 * 
 * Displays archived lesson plans with restore capability.
 * 
 * Requirements:
 * - 13.5: Archive instead of delete, add "Show Archived" toggle
 */

import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Archive,
  RotateCcw,
  Trash2,
  Loader2,
  FileText,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { LessonStatus } from '@/lib/instructional/lesson-plan';

/**
 * Archived lesson plan item
 */
export interface ArchivedLesson {
  id: string;
  topic: string;
  date: Date;
  subject: string;
  gradeLevel: string;
  status: LessonStatus;
  archivedAt: Date;
}

/**
 * Database row type
 */
interface LessonPlanRow {
  id: string;
  topic: string;
  date: string;
  subject: string;
  grade_level: string;
  status: LessonStatus;
  archived_at: string;
}

/**
 * Props for ArchivedLessonsPanel component
 */
export interface ArchivedLessonsPanelProps {
  /** Callback when a lesson is restored */
  onRestore?: (lessonId: string) => void;
  /** Callback when a lesson is permanently deleted */
  onDelete?: (lessonId: string) => void;
  /** Custom trigger element */
  trigger?: React.ReactNode;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Convert database row to archived lesson
 */
function rowToArchivedLesson(row: LessonPlanRow): ArchivedLesson {
  return {
    id: row.id,
    topic: row.topic,
    date: new Date(row.date),
    subject: row.subject,
    gradeLevel: row.grade_level,
    status: row.status,
    archivedAt: new Date(row.archived_at),
  };
}

/**
 * Format relative time for archived date
 */
function formatArchivedTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays < 1) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
  
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
}

/**
 * ArchivedLessonsPanel component
 * Requirement 13.5: Show archived lessons with restore option
 */
export function ArchivedLessonsPanel({
  onRestore,
  onDelete,
  trigger,
  disabled = false,
  className,
}: ArchivedLessonsPanelProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [archivedLessons, setArchivedLessons] = useState<ArchivedLesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<ArchivedLesson | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  /**
   * Load archived lessons
   */
  const loadArchivedLessons = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: queryError } = await (supabase as any)
        .from('lesson_plans')
        .select('id, topic, date, subject, grade_level, status, archived_at')
        .eq('user_id', user.id)
        .not('archived_at', 'is', null)
        .order('archived_at', { ascending: false });

      if (queryError) throw queryError;

      const lessons = ((data as LessonPlanRow[]) || []).map(rowToArchivedLesson);
      setArchivedLessons(lessons);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar arquivados';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load archived lessons when sheet opens
   */
  useEffect(() => {
    if (isOpen) {
      loadArchivedLessons();
    }
  }, [isOpen, loadArchivedLessons]);

  /**
   * Restore a lesson
   * Requirement 13.5: Support restore from archive
   */
  const handleRestore = async (lesson: ArchivedLesson) => {
    setIsRestoring(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('lesson_plans')
        .update({ archived_at: null })
        .eq('id', lesson.id);

      if (updateError) throw updateError;

      toast({
        title: 'Aula restaurada',
        description: `"${lesson.topic}" foi restaurada com sucesso.`,
      });

      // Remove from local list
      setArchivedLessons(prev => prev.filter(l => l.id !== lesson.id));
      onRestore?.(lesson.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao restaurar';
      toast({
        title: 'Erro ao restaurar',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  /**
   * Permanently delete a lesson
   */
  const handlePermanentDelete = async () => {
    if (!selectedLesson) return;

    setIsDeleting(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: deleteError } = await (supabase as any)
        .from('lesson_plans')
        .delete()
        .eq('id', selectedLesson.id);

      if (deleteError) throw deleteError;

      toast({
        title: 'Aula excluída',
        description: `"${selectedLesson.topic}" foi excluída permanentemente.`,
      });

      // Remove from local list
      setArchivedLessons(prev => prev.filter(l => l.id !== selectedLesson.id));
      onDelete?.(selectedLesson.id);
      setDeleteDialogOpen(false);
      setSelectedLesson(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao excluir';
      toast({
        title: 'Erro ao excluir',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      className={cn('gap-2', className)}
    >
      <Archive className="h-4 w-4" />
      Arquivados
      {archivedLessons.length > 0 && (
        <Badge variant="secondary" className="ml-1 text-xs">
          {archivedLessons.length}
        </Badge>
      )}
    </Button>
  );

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {trigger || defaultTrigger}
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Aulas Arquivadas
            </SheetTitle>
            <SheetDescription>
              Aulas arquivadas podem ser restauradas ou excluídas permanentemente.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadArchivedLessons}
                  className="mt-4"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : archivedLessons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma aula arquivada
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aulas excluídas aparecem aqui para recuperação.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                <div className="space-y-2">
                  {archivedLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{lesson.topic}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{format(lesson.date, 'dd/MM/yyyy', { locale: ptBR })}</span>
                            <span>•</span>
                            <span>{lesson.subject}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Arquivado: {formatArchivedTime(lesson.archivedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRestore(lesson)}
                            disabled={isRestoring}
                            className="h-8 px-2"
                          >
                            {isRestoring ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLesson(lesson);
                              setDeleteDialogOpen(true);
                            }}
                            className="h-8 px-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Permanent Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A aula "{selectedLesson?.topic}" será
              excluída permanentemente junto com todo seu histórico de versões.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Simple toggle component for showing/hiding archived items
 */
export interface ShowArchivedToggleProps {
  /** Whether archived items are shown */
  showArchived: boolean;
  /** Callback when toggle changes */
  onToggle: (show: boolean) => void;
  /** Number of archived items */
  archivedCount?: number;
  /** Additional class names */
  className?: string;
}

export function ShowArchivedToggle({
  showArchived,
  onToggle,
  archivedCount,
  className,
}: ShowArchivedToggleProps): React.ReactElement {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Switch
        id="show-archived"
        checked={showArchived}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="show-archived" className="text-sm text-muted-foreground cursor-pointer">
        Mostrar arquivados
        {archivedCount !== undefined && archivedCount > 0 && (
          <Badge variant="secondary" className="ml-2 text-xs">
            {archivedCount}
          </Badge>
        )}
      </Label>
    </div>
  );
}

export default ArchivedLessonsPanel;
