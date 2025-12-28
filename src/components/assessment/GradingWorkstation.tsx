import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels';
import { 
  GripVertical,
  GripHorizontal,
  FileText, 
  Sparkles,
  Save,
  Download,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EDUCASSOL_COLORS } from '@/lib/colors';
import { FADE_UP_ITEM, STAGGER_PARENT, EDUCASSOL_SPRING } from '@/lib/motion';
import { PDFViewer } from './PDFViewer';
import { AIAssistantPanel } from './AIAssistantPanel';
import { AccessControlGuard } from './AccessControlGuard';
import { useIsMobile } from '@/hooks/use-mobile';
import type { GradingResult, QuestionOverride } from '@/lib/assessment/grading-result';
import type { Rubric } from '@/lib/assessment/rubric';
import type { Annotation } from '@/lib/assessment/annotation';
import type { ExamAccessContext } from '@/lib/assessment/access-control';

/**
 * LocalStorage key for panel proportions
 */
const PANEL_STORAGE_KEY = 'educassol-grading-panel-sizes';

/**
 * Default panel sizes (percentages)
 */
const DEFAULT_PANEL_SIZES = [50, 50];

/**
 * Props for GradingWorkstation component
 */
export interface GradingWorkstationProps {
  /** Submission ID being graded */
  submissionId: string;
  /** URL of the submission file */
  fileUrl: string;
  /** File type of the submission */
  fileType: 'pdf' | 'jpeg' | 'png';
  /** Rubric used for grading */
  rubric: Rubric;
  /** Student name */
  studentName?: string;
  /** Exam title */
  examTitle?: string;
  /** Current grading result (null if not yet graded) */
  gradingResult: GradingResult | null;
  /** Whether AI is currently grading */
  isGrading: boolean;
  /** Streamed text from AI during grading */
  streamedText?: string;
  /** Grading progress percentage */
  gradingProgress?: number;
  /** Annotations on the submission */
  annotations?: Annotation[];
  /** Callback when grading is complete */
  onGradingComplete: (result: GradingResult) => void;
  /** Callback to start grading */
  onStartGrading?: () => void;
  /** Callback when result is saved */
  onSave?: (result: GradingResult, overrides: QuestionOverride[]) => void;
  /** Callback when result is exported */
  onExport?: (format: 'pdf' | 'csv') => void;
  /** Exam context for access control (Requirements: 7.1, 7.2) */
  examContext?: ExamAccessContext;
  /** Callback when access is denied */
  onAccessDenied?: (reason: string) => void;
  /** Callback to navigate to login */
  onLoginRequired?: () => void;
  /** Optional class name */
  className?: string;
}

/**
 * Load panel sizes from localStorage
 */
function loadPanelSizes(): number[] {
  try {
    const stored = localStorage.getItem(PANEL_STORAGE_KEY);
    if (stored) {
      const sizes = JSON.parse(stored);
      if (Array.isArray(sizes) && sizes.length === 2) {
        // Validate sizes are within bounds
        const [left, right] = sizes;
        if (left >= 10 && left <= 90 && right >= 10 && right <= 90) {
          return sizes;
        }
      }
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_PANEL_SIZES;
}

/**
 * Save panel sizes to localStorage
 */
function savePanelSizes(sizes: number[]): void {
  try {
    localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(sizes));
  } catch {
    // Ignore storage errors
  }
}

/**
 * GradingWorkstation Component
 * 
 * Split-pane interface for viewing submissions and AI feedback side-by-side.
 * Uses react-resizable-panels for resizable layout with persisted proportions.
 * Stacks panels vertically on mobile devices (< 768px).
 * 
 * Requirements: 8.1, 8.2, 9.2, 10.1
 */
export function GradingWorkstation({
  submissionId,
  fileUrl,
  fileType,
  rubric,
  studentName,
  examTitle,
  gradingResult,
  isGrading,
  streamedText = '',
  gradingProgress = 0,
  annotations = [],
  onGradingComplete,
  onStartGrading,
  onSave,
  onExport,
  examContext,
  onAccessDenied,
  onLoginRequired,
  className,
}: GradingWorkstationProps) {
  const [panelSizes, setPanelSizes] = useState<number[]>(loadPanelSizes);
  const [overrides, setOverrides] = useState<QuestionOverride[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const isMobile = useIsMobile();

  // Load panel sizes on mount
  useEffect(() => {
    setPanelSizes(loadPanelSizes());
  }, []);

  // Handle panel resize
  const handlePanelResize = useCallback((sizes: number[]) => {
    setPanelSizes(sizes);
    savePanelSizes(sizes);
  }, []);

  // Handle score override
  const handleScoreOverride = useCallback((questionNumber: string, score: number) => {
    if (!gradingResult) return;

    const question = gradingResult.questions.find(q => q.number === questionNumber);
    if (!question) return;

    setOverrides((prev) => {
      // Remove existing override for this question
      const filtered = prev.filter(o => o.questionNumber !== questionNumber);
      
      // Only add override if different from AI score
      if (score !== question.points_awarded) {
        const newOverride: QuestionOverride = {
          questionNumber,
          originalScore: question.points_awarded,
          overrideScore: score,
          overriddenAt: new Date(),
        };
        return [...filtered, newOverride];
      }
      
      return filtered;
    });
  }, [gradingResult]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!gradingResult || !onSave) return;

    setIsSaving(true);
    try {
      // Create updated result with overrides
      const updatedResult: GradingResult = {
        ...gradingResult,
        overrides,
      };
      await onSave(updatedResult, overrides);
    } finally {
      setIsSaving(false);
    }
  }, [gradingResult, overrides, onSave]);

  // Get grading status
  const getStatusBadge = () => {
    if (isGrading) {
      return (
        <Badge 
          variant="outline" 
          className="animate-pulse"
          style={{ borderColor: EDUCASSOL_COLORS.accent, color: EDUCASSOL_COLORS.accent }}
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Corrigindo...
        </Badge>
      );
    }
    if (gradingResult) {
      return (
        <Badge 
          variant="outline"
          style={{ borderColor: EDUCASSOL_COLORS.success, color: EDUCASSOL_COLORS.success }}
        >
          Corrigido
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Pendente
      </Badge>
    );
  };

  // Wrap content with AccessControlGuard for educator role verification
  // Requirements: 7.1 - Verify educator role before showing grading features
  // Requirements: 7.2 - Verify exam ownership before grading
  const content = (
    <motion.div
      variants={STAGGER_PARENT}
      initial="hidden"
      animate="show"
      className={cn('flex flex-col h-full', className)}
    >
      {/* Header */}
      <motion.div 
        variants={FADE_UP_ITEM}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 border-b bg-background"
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div className="min-w-0 flex-1">
            <h1 
              className="text-base md:text-lg font-semibold truncate" 
              style={{ color: EDUCASSOL_COLORS.textMain }}
            >
              {examTitle || 'Correção de Prova'}
            </h1>
            {studentName && (
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                Aluno: {studentName}
              </p>
            )}
          </div>
          {getStatusBadge()}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!gradingResult && !isGrading && onStartGrading && (
            <Button 
              onClick={onStartGrading}
              size={isMobile ? "sm" : "default"}
              aria-label="Iniciar correção automática com IA"
            >
              <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Iniciar Correção</span>
              <span className="sm:hidden">Corrigir</span>
            </Button>
          )}
          
          {gradingResult && onSave && (
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={handleSave}
              disabled={isSaving}
              aria-label="Salvar resultado da correção"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4 sm:mr-2" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">Salvar</span>
            </Button>
          )}
          
          {gradingResult && onExport && (
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={() => onExport('pdf')}
              aria-label="Exportar resultado como PDF"
            >
              <Download className="h-4 w-4 sm:mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Split Pane Content */}
      <motion.div 
        variants={FADE_UP_ITEM}
        className="flex-1 overflow-hidden"
      >
        <PanelGroup
          direction={isMobile ? "vertical" : "horizontal"}
          onLayout={handlePanelResize}
          className="h-full"
        >
          {/* Left/Top Panel - PDF/Image Viewer */}
          <Panel
            defaultSize={panelSizes[0]}
            minSize={20}
            maxSize={80}
            className="h-full"
          >
            <Card className={cn(
              "h-full rounded-none border-0 shadow-none",
              isMobile ? "border-b" : "border-r"
            )}>
              <CardHeader className="py-2 px-3 md:px-4 border-b">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2">
                  <FileText className="h-3 w-3 md:h-4 md:w-4" aria-hidden="true" />
                  <span>Submissão</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-49px)]">
                <PDFViewer
                  fileUrl={fileUrl}
                  fileType={fileType}
                  annotations={annotations}
                  className="h-full rounded-none"
                />
              </CardContent>
            </Card>
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle 
            className={cn(
              "bg-muted hover:bg-muted-foreground/20 transition-colors flex items-center justify-center group",
              isMobile ? "h-2" : "w-2"
            )}
            aria-label="Redimensionar painéis"
          >
            <motion.div
              whileHover={{ scale: 1.2 }}
              transition={EDUCASSOL_SPRING}
            >
              {isMobile ? (
                <GripHorizontal className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" aria-hidden="true" />
              ) : (
                <GripVertical className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" aria-hidden="true" />
              )}
            </motion.div>
          </PanelResizeHandle>

          {/* Right/Bottom Panel - AI Assistant */}
          <Panel
            defaultSize={panelSizes[1]}
            minSize={20}
            maxSize={80}
            className="h-full"
          >
            <Card className="h-full rounded-none border-0 shadow-none">
              <AIAssistantPanel
                gradingResult={gradingResult}
                isStreaming={isGrading}
                streamedText={streamedText}
                gradingProgress={gradingProgress}
                onScoreOverride={handleScoreOverride}
                className="h-full"
              />
            </Card>
          </Panel>
        </PanelGroup>
      </motion.div>

      {/* Footer */}
      {gradingResult && (
        <motion.div
          variants={FADE_UP_ITEM}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 md:p-3 border-t bg-muted/30"
        >
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
            <span className="text-muted-foreground">
              Total:{' '}
              <span className="font-bold" style={{ color: EDUCASSOL_COLORS.primary }}>
                {gradingResult.total_score}
              </span>
              {' / '}
              {rubric.total_points}
            </span>
            
            {gradingResult.confidenceScore !== undefined && (
              <span className="text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" style={{ color: EDUCASSOL_COLORS.accent }} aria-hidden="true" />
                <span>Confiança: {gradingResult.confidenceScore}%</span>
              </span>
            )}
          </div>

          {overrides.length > 0 && (
            <span className="text-xs md:text-sm text-muted-foreground">
              {overrides.length} {overrides.length === 1 ? 'ajuste manual' : 'ajustes manuais'}
            </span>
          )}
        </motion.div>
      )}
    </motion.div>
  );

  // If examContext is provided, wrap with AccessControlGuard
  if (examContext) {
    return (
      <AccessControlGuard
        requireEducator={true}
        examContext={examContext}
        accessType="update"
        onAccessDenied={onAccessDenied}
        onLoginRequired={onLoginRequired}
      >
        {content}
      </AccessControlGuard>
    );
  }

  // Otherwise, just require educator role
  return (
    <AccessControlGuard
      requireEducator={true}
      onAccessDenied={onAccessDenied}
      onLoginRequired={onLoginRequired}
    >
      {content}
    </AccessControlGuard>
  );
}

export default GradingWorkstation;
