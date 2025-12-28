import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2,
  XCircle,
  User,
  FileText,
  MessageSquare,
  Award,
  PenTool,
  Download,
  FileSpreadsheet,
  Edit3,
  AlertCircle,
} from "lucide-react";
import type { GradingResult, QuestionResult, QuestionOverride } from "@/lib/assessment/grading-result";
import { calculateFinalScore, getOverride } from "@/lib/assessment/override";
import { EDUCASSOL_COLORS } from '@/lib/colors';
import { FADE_UP_ITEM, STAGGER_PARENT } from '@/lib/motion';
import { exportToPDF, exportToCSV } from './export-utils';

export interface ResultViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: {
    id: string;
    total_score: number | null;
    ai_output: GradingResult | null;
    graded_at: string;
  } | null;
  studentIdentifier?: string | null;
  examTitle?: string;
  onExport?: (format: 'pdf' | 'csv') => void;
}


/**
 * Maps handwriting quality to display text and color
 */
function getHandwritingQualityDisplay(quality: string): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  switch (quality) {
    case "excellent":
      return { text: "Excelente", variant: "default" };
    case "good":
      return { text: "Boa", variant: "secondary" };
    case "poor":
      return { text: "Ruim", variant: "outline" };
    case "illegible":
      return { text: "Ilegível", variant: "destructive" };
    default:
      return { text: quality, variant: "outline" };
  }
}

/**
 * Formats a date string for display
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Gets the effective score for a question (override if present, otherwise AI score)
 */
function getEffectiveQuestionScore(
  question: QuestionResult,
  gradingResult: GradingResult
): { score: number; isOverridden: boolean; override?: QuestionOverride } {
  const override = getOverride(gradingResult, question.number);
  if (override) {
    return {
      score: override.overrideScore,
      isOverridden: true,
      override,
    };
  }
  return {
    score: question.points_awarded,
    isOverridden: false,
  };
}


/**
 * Question result card component with override indicator
 * Responsive design for mobile devices.
 */
function QuestionCard({ 
  question, 
  index,
  gradingResult,
}: { 
  question: QuestionResult; 
  index: number;
  gradingResult: GradingResult;
}) {
  const { score: effectiveScore, isOverridden, override } = getEffectiveQuestionScore(question, gradingResult);
  const percentage = question.max_points > 0 
    ? (effectiveScore / question.max_points) * 100 
    : 0;

  const getScoreColor = () => {
    if (percentage >= 80) return EDUCASSOL_COLORS.success;
    if (percentage >= 50) return EDUCASSOL_COLORS.accent;
    return EDUCASSOL_COLORS.error;
  };

  return (
    <motion.div
      variants={FADE_UP_ITEM}
      initial="hidden"
      animate="show"
      transition={{ delay: index * 0.05 }}
      role="listitem"
    >
      <Card className={`mb-3 md:mb-4 ${isOverridden ? 'ring-2 ring-amber-500/50' : ''}`}>
        <CardHeader className="pb-2 px-3 md:px-4 pt-3 md:pt-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {question.is_correct ? (
                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" aria-label="Resposta correta" />
              ) : (
                <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-500 flex-shrink-0" aria-label="Resposta incorreta" />
              )}
              <CardTitle className="text-sm md:text-base">
                Questão {question.number}: {question.topic}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isOverridden && (
                <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                  <Edit3 className="h-3 w-3 mr-1" aria-hidden="true" />
                  Ajustado
                </Badge>
              )}
              <Badge 
                variant={question.is_correct ? "default" : "secondary"}
                style={{ backgroundColor: isOverridden ? EDUCASSOL_COLORS.accent : undefined }}
              >
                {effectiveScore} / {question.max_points} pts
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 px-3 md:px-4 pb-3 md:pb-4">
          {/* Score Progress */}
          <div className="space-y-1">
            <Progress value={percentage} className="h-2" aria-label={`${percentage.toFixed(0)}% da pontuação`} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{percentage.toFixed(0)}% da pontuação</span>
              {isOverridden && override && (
                <span className="text-amber-600">
                  Original: {override.originalScore} pts
                </span>
              )}
            </div>
          </div>

          {/* Override Reason */}
          {isOverridden && override?.overrideReason && (
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-md p-2 md:p-3 text-xs md:text-sm border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium mb-1">
                <AlertCircle className="h-3 w-3 md:h-4 md:w-4" aria-hidden="true" />
                Motivo do Ajuste
              </div>
              <p className="text-amber-800 dark:text-amber-300">{override.overrideReason}</p>
            </div>
          )}

          {/* Student Response Transcription */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs md:text-sm font-medium text-muted-foreground">
              <PenTool className="h-3 w-3 md:h-4 md:w-4" aria-hidden="true" />
              Resposta do Aluno (Transcrição)
            </div>
            <div className="bg-muted/50 rounded-md p-2 md:p-3 text-xs md:text-sm">
              {question.student_response_transcription || (
                <span className="italic text-muted-foreground">
                  Resposta não identificada
                </span>
              )}
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs md:text-sm font-medium text-muted-foreground">
              <FileText className="h-3 w-3 md:h-4 md:w-4" aria-hidden="true" />
              Análise da IA
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-md p-2 md:p-3 text-xs md:text-sm border border-blue-100 dark:border-blue-900">
              {question.reasoning}
            </div>
          </div>

          {/* Feedback for Student */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs md:text-sm font-medium text-muted-foreground">
              <MessageSquare className="h-3 w-3 md:h-4 md:w-4" aria-hidden="true" />
              Feedback para o Aluno
            </div>
            <div className="bg-green-50 dark:bg-green-950/30 rounded-md p-2 md:p-3 text-xs md:text-sm border border-green-100 dark:border-green-900">
              {question.feedback_for_student}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


/**
 * ResultViewer component displays detailed AI grading results
 * with override indicators and final score calculation
 * Responsive design for mobile devices with proper accessibility.
 * 
 * Requirements: 6.2 - Display complete grading result with all scores and feedback
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */
const ResultViewer = ({
  open,
  onOpenChange,
  result,
  studentIdentifier,
  examTitle,
  onExport,
}: ResultViewerProps) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!result || !result.ai_output) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resultado não disponível</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Os dados do resultado não estão disponíveis.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  const { ai_output: gradingResult, graded_at } = result;
  const { student_metadata, questions, summary_comment } = gradingResult;

  // Calculate final score using overrides where present
  const finalScore = calculateFinalScore(gradingResult);
  const maxScore = questions.reduce((sum, q) => sum + q.max_points, 0);
  const scorePercentage = maxScore > 0 ? (finalScore / maxScore) * 100 : 0;
  const correctCount = questions.filter((q) => q.is_correct).length;
  const handwritingDisplay = getHandwritingQualityDisplay(student_metadata.handwriting_quality);
  
  // Count overrides
  const overrideCount = gradingResult.overrides?.length ?? 0;
  const hasOverrides = overrideCount > 0;

  // Handle export
  const handleExport = async (format: 'pdf' | 'csv') => {
    setIsExporting(true);
    try {
      if (onExport) {
        onExport(format);
      } else {
        // Use built-in export utilities
        if (format === 'pdf') {
          await exportToPDF(gradingResult, examTitle, studentIdentifier);
        } else {
          exportToCSV(gradingResult, examTitle, studentIdentifier);
        }
      }
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 w-[95vw] md:w-auto">
        <DialogHeader className="p-4 md:p-6 pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <DialogTitle className="text-lg md:text-xl">
              Resultado da Avaliação
              {examTitle && (
                <span className="text-muted-foreground font-normal ml-2 block sm:inline text-sm md:text-base">
                  - {examTitle}
                </span>
              )}
            </DialogTitle>
            
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isExporting} aria-label="Exportar resultado">
                  <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                  {isExporting ? 'Exportando...' : 'Exportar'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                  Exportar como PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" aria-hidden="true" />
                  Exportar como CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <motion.div 
            variants={STAGGER_PARENT}
            initial="hidden"
            animate="show"
            className="p-4 md:p-6 pt-3 md:pt-4 space-y-4 md:space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {/* Student Info */}
              <motion.div variants={FADE_UP_ITEM}>
                <Card>
                  <CardContent className="pt-3 md:pt-4 px-3 md:px-4 pb-3 md:pb-4">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="rounded-full bg-primary/10 p-1.5 md:p-2 flex-shrink-0">
                        <User className="h-4 w-4 md:h-5 md:w-5 text-primary" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm text-muted-foreground">Aluno</p>
                        <p className="font-medium truncate text-sm md:text-base">
                          {student_metadata.name || studentIdentifier || "Não identificado"}
                        </p>
                        {student_metadata.student_id && (
                          <p className="text-xs text-muted-foreground">
                            ID: {student_metadata.student_id}
                          </p>
                        )}
                        <div className="mt-1">
                          <Badge variant={handwritingDisplay.variant} className="text-xs">
                            Escrita: {handwritingDisplay.text}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>


              {/* Score - with override indicator */}
              <motion.div variants={FADE_UP_ITEM}>
                <Card className={hasOverrides ? 'ring-2 ring-amber-500/30' : ''}>
                  <CardContent className="pt-3 md:pt-4 px-3 md:px-4 pb-3 md:pb-4">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-1.5 md:p-2 flex-shrink-0">
                        <Award className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-1 md:gap-2">
                          <p className="text-xs md:text-sm text-muted-foreground">Pontuação Final</p>
                          {hasOverrides && (
                            <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                              <Edit3 className="h-3 w-3 mr-1" aria-hidden="true" />
                              {overrideCount} ajuste{overrideCount > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xl md:text-2xl font-bold" style={{ color: EDUCASSOL_COLORS.primary }}>
                          {finalScore.toFixed(1)}{" "}
                          <span className="text-xs md:text-sm font-normal text-muted-foreground">
                            / {maxScore}
                          </span>
                        </p>
                        <Progress value={scorePercentage} className="h-2 mt-2" aria-label={`${scorePercentage.toFixed(0)}% de aproveitamento`} />
                        <p className="text-xs text-muted-foreground mt-1">
                          {scorePercentage.toFixed(0)}% de aproveitamento
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Questions Summary */}
              <motion.div variants={FADE_UP_ITEM} className="sm:col-span-2 md:col-span-1">
                <Card>
                  <CardContent className="pt-3 md:pt-4 px-3 md:px-4 pb-3 md:pb-4">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-1.5 md:p-2 flex-shrink-0">
                        <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs md:text-sm text-muted-foreground">Questões</p>
                        <p className="text-xl md:text-2xl font-bold">
                          {correctCount}{" "}
                          <span className="text-xs md:text-sm font-normal text-muted-foreground">
                            / {questions.length} corretas
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Corrigido em {formatDate(graded_at)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>


            {/* Override Summary Banner */}
            {hasOverrides && (
              <motion.div variants={FADE_UP_ITEM}>
                <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                  <CardContent className="py-2 md:py-3 px-3 md:px-4">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs md:text-sm">
                      <AlertCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" aria-hidden="true" />
                      <span className="font-medium">
                        {overrideCount} {overrideCount === 1 ? 'nota foi ajustada' : 'notas foram ajustadas'} manualmente pelo professor
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Summary Comment */}
            <motion.div variants={FADE_UP_ITEM}>
              <Card>
                <CardHeader className="pb-2 px-3 md:px-4 pt-3 md:pt-4">
                  <CardTitle className="text-sm md:text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
                    Comentário Geral
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 md:px-4 pb-3 md:pb-4">
                  <p className="text-xs md:text-sm">{summary_comment}</p>
                </CardContent>
              </Card>
            </motion.div>

            <Separator />

            {/* Questions Detail */}
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
                Detalhamento por Questão
              </h3>
              <div role="list" aria-label="Lista de questões">
                {questions.map((question, index) => (
                  <QuestionCard 
                    key={question.number} 
                    question={question} 
                    index={index}
                    gradingResult={gradingResult}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ResultViewer;
