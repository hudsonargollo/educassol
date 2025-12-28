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
import {
  CheckCircle2,
  XCircle,
  User,
  FileText,
  MessageSquare,
  Award,
  PenTool,
} from "lucide-react";
import type { GradingResult, QuestionResult } from "@/lib/assessment/grading-result";

interface ResultViewerProps {
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
 * Question result card component
 */
function QuestionCard({ question, index }: { question: QuestionResult; index: number }) {
  const percentage = question.max_points > 0 
    ? (question.points_awarded / question.max_points) * 100 
    : 0;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {question.is_correct ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <CardTitle className="text-base">
              Questão {question.number}: {question.topic}
            </CardTitle>
          </div>
          <Badge variant={question.is_correct ? "default" : "secondary"}>
            {question.points_awarded} / {question.max_points} pts
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Progress */}
        <div className="space-y-1">
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {percentage.toFixed(0)}% da pontuação
          </p>
        </div>

        {/* Student Response Transcription */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <PenTool className="h-4 w-4" />
            Resposta do Aluno (Transcrição)
          </div>
          <div className="bg-muted/50 rounded-md p-3 text-sm">
            {question.student_response_transcription || (
              <span className="italic text-muted-foreground">
                Resposta não identificada
              </span>
            )}
          </div>
        </div>

        {/* AI Reasoning */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <FileText className="h-4 w-4" />
            Análise da IA
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-md p-3 text-sm border border-blue-100 dark:border-blue-900">
            {question.reasoning}
          </div>
        </div>

        {/* Feedback for Student */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            Feedback para o Aluno
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 rounded-md p-3 text-sm border border-green-100 dark:border-green-900">
            {question.feedback_for_student}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ResultViewer component displays detailed AI grading results
 * Requirements: 8.4
 */
const ResultViewer = ({
  open,
  onOpenChange,
  result,
  studentIdentifier,
  examTitle,
}: ResultViewerProps) => {
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

  const { ai_output: gradingResult, graded_at, total_score } = result;
  const { student_metadata, questions, summary_comment } = gradingResult;

  const maxScore = questions.reduce((sum, q) => sum + q.max_points, 0);
  const scorePercentage = maxScore > 0 ? ((total_score ?? 0) / maxScore) * 100 : 0;
  const correctCount = questions.filter((q) => q.is_correct).length;
  const handwritingDisplay = getHandwritingQualityDisplay(student_metadata.handwriting_quality);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">
            Resultado da Avaliação
            {examTitle && (
              <span className="text-muted-foreground font-normal ml-2">
                - {examTitle}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-6 pt-4 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Student Info */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">Aluno</p>
                      <p className="font-medium truncate">
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

              {/* Score */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2">
                      <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Pontuação</p>
                      <p className="text-2xl font-bold">
                        {total_score?.toFixed(1) ?? "-"}{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          / {maxScore}
                        </span>
                      </p>
                      <Progress value={scorePercentage} className="h-2 mt-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {scorePercentage.toFixed(0)}% de aproveitamento
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Questions Summary */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Questões</p>
                      <p className="text-2xl font-bold">
                        {correctCount}{" "}
                        <span className="text-sm font-normal text-muted-foreground">
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
            </div>

            {/* Summary Comment */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comentário Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{summary_comment}</p>
              </CardContent>
            </Card>

            <Separator />

            {/* Questions Detail */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Detalhamento por Questão
              </h3>
              {questions.map((question, index) => (
                <QuestionCard key={index} question={question} index={index} />
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ResultViewer;
