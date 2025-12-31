/**
 * VersionHistory Component
 * 
 * Displays version history for lesson plans with restore capability.
 * 
 * Requirements:
 * - 13.2: Maintain version history for lesson plans to support rollback
 */

import React, { useState, useEffect, useCallback } from 'react';
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
import { Separator } from '@/components/ui/separator';
import {
  History,
  RotateCcw,
  Clock,
  FileText,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LessonPlan } from '@/lib/instructional/lesson-plan';

/**
 * Version history item from database
 */
export interface LessonPlanVersion {
  id: string;
  lessonPlanId: string;
  version: number;
  content: {
    topic: string;
    grade_level: string;
    subject: string;
    duration: number;
    standards: string[];
    learning_objective: string;
    key_vocabulary: Array<{ term: string; definition: string }>;
    materials_needed: string[];
    phases: unknown[];
    formative_assessment: unknown;
    status: string;
    date: string;
  };
  createdAt: Date;
  createdBy: string | null;
}

/**
 * Database row type
 */
interface VersionRow {
  id: string;
  lesson_plan_id: string;
  version: number;
  content: LessonPlanVersion['content'];
  created_at: string;
  created_by: string | null;
}

/**
 * Props for VersionHistory component
 */
export interface VersionHistoryProps {
  /** The lesson plan ID to show history for */
  lessonPlanId: string;
  /** Current version number */
  currentVersion: number;
  /** Callback when a version is restored */
  onRestore?: (version: LessonPlanVersion) => void;
  /** Custom trigger element */
  trigger?: React.ReactNode;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Convert database row to version type
 */
function rowToVersion(row: VersionRow): LessonPlanVersion {
  return {
    id: row.id,
    lessonPlanId: row.lesson_plan_id,
    version: row.version,
    content: row.content,
    createdAt: new Date(row.created_at),
    createdBy: row.created_by,
  };
}

/**
 * Format relative time
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora mesmo';
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: diffDays > 365 ? 'numeric' : undefined,
  });
}

/**
 * VersionHistory component
 * Requirement 13.2: Display version list with timestamps, support restore
 */
export function VersionHistory({
  lessonPlanId,
  currentVersion,
  onRestore,
  trigger,
  disabled = false,
  className,
}: VersionHistoryProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState<LessonPlanVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<LessonPlanVersion | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { toast } = useToast();

  /**
   * Load version history
   */
  const loadVersions = useCallback(async () => {
    if (!lessonPlanId) return;

    setIsLoading(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: queryError } = await (supabase as any)
        .from('lesson_plan_versions')
        .select('*')
        .eq('lesson_plan_id', lessonPlanId)
        .order('version', { ascending: false });

      if (queryError) throw queryError;

      const versionList = ((data as VersionRow[]) || []).map(rowToVersion);
      setVersions(versionList);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar histórico';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [lessonPlanId]);

  /**
   * Load versions when sheet opens
   */
  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen, loadVersions]);

  /**
   * Handle version selection for preview
   */
  const handleSelectVersion = (version: LessonPlanVersion) => {
    setSelectedVersion(version);
  };

  /**
   * Handle restore confirmation
   */
  const handleRestoreClick = () => {
    if (selectedVersion) {
      setConfirmDialogOpen(true);
    }
  };

  /**
   * Restore a version
   * Requirement 13.2: Support restore from version
   */
  const handleConfirmRestore = async () => {
    if (!selectedVersion) return;

    setIsRestoring(true);

    try {
      const content = selectedVersion.content;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('lesson_plans')
        .update({
          topic: content.topic,
          grade_level: content.grade_level,
          subject: content.subject,
          duration: content.duration,
          standards: content.standards,
          learning_objective: content.learning_objective,
          key_vocabulary: content.key_vocabulary,
          materials_needed: content.materials_needed,
          phases: content.phases,
          formative_assessment: content.formative_assessment,
          status: content.status,
          date: content.date,
        })
        .eq('id', lessonPlanId);

      if (updateError) throw updateError;

      toast({
        title: 'Versão restaurada',
        description: `Restaurado para versão ${selectedVersion.version}`,
      });

      onRestore?.(selectedVersion);
      setConfirmDialogOpen(false);
      setIsOpen(false);
      
      // Reload versions
      await loadVersions();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao restaurar versão';
      toast({
        title: 'Erro ao restaurar',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      className={cn('gap-2', className)}
    >
      <History className="h-4 w-4" />
      Histórico
      {currentVersion > 1 && (
        <Badge variant="secondary" className="ml-1 text-xs">
          v{currentVersion}
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
              <History className="h-5 w-5" />
              Histórico de Versões
            </SheetTitle>
            <SheetDescription>
              Visualize e restaure versões anteriores do plano de aula.
              Versão atual: {currentVersion}
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
                  onClick={loadVersions}
                  className="mt-4"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : versions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma versão anterior encontrada.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Versões são criadas automaticamente ao editar.
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-[calc(100vh-200px)]">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-2">
                    {versions.map((version, index) => (
                      <button
                        key={version.id}
                        onClick={() => handleSelectVersion(version)}
                        className={cn(
                          'w-full text-left p-3 rounded-lg border transition-colors',
                          'hover:bg-accent hover:border-accent-foreground/20',
                          selectedVersion?.id === version.id
                            ? 'bg-accent border-primary'
                            : 'bg-card border-border'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={index === 0 ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              v{version.version}
                            </Badge>
                            <span className="text-sm font-medium truncate max-w-[200px]">
                              {version.content.topic}
                            </span>
                          </div>
                          <ChevronRight
                            className={cn(
                              'h-4 w-4 text-muted-foreground transition-transform',
                              selectedVersion?.id === version.id && 'rotate-90'
                            )}
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatRelativeTime(version.createdAt)}</span>
                          <span>•</span>
                          <span>{version.content.status}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>

                {selectedVersion && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Prévia da Versão {selectedVersion.version}
                        </h4>
                        <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-lg">
                          <p><strong>Tópico:</strong> {selectedVersion.content.topic}</p>
                          <p><strong>Objetivo:</strong> {selectedVersion.content.learning_objective}</p>
                          <p><strong>Duração:</strong> {selectedVersion.content.duration} min</p>
                          <p><strong>Fases:</strong> {selectedVersion.content.phases.length}</p>
                          <p><strong>Vocabulário:</strong> {selectedVersion.content.key_vocabulary.length} termos</p>
                        </div>
                      </div>
                      <Button
                        onClick={handleRestoreClick}
                        disabled={isRestoring}
                        className="w-full"
                      >
                        {isRestoring ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <RotateCcw className="h-4 w-4 mr-2" />
                        )}
                        Restaurar esta versão
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar versão?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso substituirá o conteúdo atual pela versão {selectedVersion?.version}.
              A versão atual será salva no histórico antes da restauração.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRestore}
              disabled={isRestoring}
            >
              {isRestoring ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Hook for fetching version history
 */
export interface UseVersionHistoryOptions {
  lessonPlanId: string;
  enabled?: boolean;
}

export interface UseVersionHistoryReturn {
  versions: LessonPlanVersion[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useVersionHistory({
  lessonPlanId,
  enabled = true,
}: UseVersionHistoryOptions): UseVersionHistoryReturn {
  const [versions, setVersions] = useState<LessonPlanVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!lessonPlanId || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: queryError } = await (supabase as any)
        .from('lesson_plan_versions')
        .select('*')
        .eq('lesson_plan_id', lessonPlanId)
        .order('version', { ascending: false });

      if (queryError) throw queryError;

      const versionList = ((data as VersionRow[]) || []).map(rowToVersion);
      setVersions(versionList);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load versions';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [lessonPlanId, enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    versions,
    isLoading,
    error,
    refresh,
  };
}

export default VersionHistory;
