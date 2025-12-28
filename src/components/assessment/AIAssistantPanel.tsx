import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Edit3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { EDUCASSOL_COLORS } from '@/lib/colors';
import { FADE_UP_ITEM, STAGGER_PARENT, EDUCASSOL_SPRING } from '@/lib/motion';
import type { GradingResult, QuestionResult } from '@/lib/assessment/grading-result';
import { ScoreOverride } from './ScoreOverride';

/**
 * Props for AIAssistantPanel component
 */
export interface AIAssistantPanelProps {
  /** The grading result from AI */
  gradingResult: GradingResult | null;
  /** Whether AI is currently streaming response */
  isStreaming: boolean;
  /** Streamed text during AI processing */
  streamedText: string;
  /** Grading progress percentage (0-100) */
  gradingProgress?: number;
  /** Callback when educator overrides a score */
  onScoreOverride: (questionNumber: string, score: number) => void;
  /** Callback when educator edits feedback */
  onFeedbackEdit?: (questionNumber: string, feedback: string) => void;
  /** Optional class name */
  className?: string;
}

/**
 * Question result card with expandable feedback
 */
interface QuestionResultCardProps {
  question: QuestionResult;
  overrideScore?: number;
  onScoreOverride: (score: number) => void;
  onFeedbackEdit?: (feedback: string) => void;
  index: number;
}

function QuestionResultCard({
  question,
  overrideScore,
  onScoreOverride,
  index,
}: QuestionResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasOverride = overrideScore !== undefined && overrideScore !== question.points_awarded;
  const effectiveScore = overrideScore ?? question.points_awarded;
  const scorePercentage = (effectiveScore / question.max_points) * 100;

  const getScoreColor = () => {
    if (scorePercentage >= 80) return EDUCASSOL_COLORS.success;
    if (scorePercentage >= 50) return EDUCASSOL_COLORS.accent;
    return EDUCASSOL_COLORS.error;
  };

  return (
    <motion.div
      variants={FADE_UP_ITEM}
      initial="hidden"
      animate="show"
      transition={{ delay: index * 0.1 }}
    >
      <Card className={cn(
        'transition-shadow hover:shadow-md',
        hasOverride && 'ring-2 ring-accent/50'
      )}>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <CardHeader 
              className="cursor-pointer py-2 md:py-3 px-3 md:px-4"
              role="button"
              aria-expanded={isExpanded}
              aria-label={`Questão ${question.number}: ${question.topic}. Pontuação: ${effectiveScore} de ${question.max_points}. ${isExpanded ? 'Clique para recolher' : 'Clique para expandir'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div 
                    className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-semibold text-white flex-shrink-0"
                    style={{ backgroundColor: getScoreColor() }}
                    aria-hidden="true"
                  >
                    {question.number}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-xs md:text-sm font-medium truncate">
                      {question.topic}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1">
                      <span 
                        className="text-base md:text-lg font-bold"
                        style={{ color: getScoreColor() }}
                      >
                        {effectiveScore}
                      </span>
                      <span className="text-xs md:text-sm text-muted-foreground">
                        / {question.max_points}
                      </span>
                      {hasOverride && (
                        <Badge variant="outline" className="text-xs">
                          <Edit3 className="h-3 w-3 mr-1" aria-hidden="true" />
                          <span className="sr-only">Nota </span>Ajustado
                        </Badge>
                      )}
                      {question.is_correct && (
                        <CheckCircle2 
                          className="h-4 w-4" 
                          style={{ color: EDUCASSOL_COLORS.success }}
                          aria-label="Resposta correta"
                        />
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0"
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0 pb-3 md:pb-4 px-3 md:px-4 space-y-3 md:space-y-4">
              {/* Student Response */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Resposta do Aluno
                </p>
                <p className="text-xs md:text-sm bg-muted/50 rounded-md p-2 md:p-3">
                  {question.student_response_transcription || 'Sem resposta'}
                </p>
              </div>

              {/* AI Reasoning */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Análise da IA
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {question.reasoning}
                </p>
              </div>

              {/* Feedback for Student */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Feedback para o Aluno
                  </p>
                </div>
                <p className="text-xs md:text-sm bg-primary/5 rounded-md p-2 md:p-3 border-l-2 border-primary">
                  {question.feedback_for_student}
                </p>
              </div>

              {/* Score Override */}
              <div className="pt-2 border-t">
                <ScoreOverride
                  questionNumber={question.number}
                  aiScore={question.points_awarded}
                  maxPoints={question.max_points}
                  overrideScore={overrideScore ?? null}
                  onOverride={onScoreOverride}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </motion.div>
  );
}

/**
 * Typing animation for streamed text
 */
function TypingText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    if (text.length === 0) {
      setDisplayedText('');
      indexRef.current = 0;
      return;
    }

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayedText}
      {indexRef.current < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}

/**
 * AIAssistantPanel Component
 * 
 * Displays AI grading results with streaming text animation, progress indicator,
 * question results with scores and feedback, and confidence score.
 * Responsive design for mobile devices.
 * 
 * Requirements: 8.4, 8.6, 9.5, 10.1
 */
export function AIAssistantPanel({
  gradingResult,
  isStreaming,
  streamedText,
  gradingProgress = 0,
  onScoreOverride,
  onFeedbackEdit,
  className,
}: AIAssistantPanelProps) {
  const [overrides, setOverrides] = useState<Map<string, number>>(new Map());

  // Handle score override
  const handleScoreOverride = (questionNumber: string, score: number) => {
    setOverrides((prev) => {
      const newOverrides = new Map(prev);
      newOverrides.set(questionNumber, score);
      return newOverrides;
    });
    onScoreOverride(questionNumber, score);
  };

  // Calculate totals
  const totalMaxPoints = gradingResult?.questions.reduce(
    (sum, q) => sum + q.max_points, 0
  ) ?? 0;

  const totalScore = gradingResult?.questions.reduce((sum, q) => {
    const override = overrides.get(q.number);
    return sum + (override ?? q.points_awarded);
  }, 0) ?? 0;

  const confidenceScore = gradingResult?.confidenceScore ?? 0;

  const getConfidenceColor = () => {
    if (confidenceScore >= 80) return EDUCASSOL_COLORS.success;
    if (confidenceScore >= 50) return EDUCASSOL_COLORS.accent;
    return EDUCASSOL_COLORS.error;
  };

  return (
    <motion.div
      variants={STAGGER_PARENT}
      initial="hidden"
      animate="show"
      className={cn('flex flex-col h-full', className)}
      role="region"
      aria-label="Painel do assistente de correção"
    >
      {/* Header with Progress */}
      <motion.div variants={FADE_UP_ITEM} className="p-3 md:p-4 border-b">
        <div className="flex items-center gap-2 mb-2 md:mb-3">
          <motion.div
            animate={isStreaming ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 2, repeat: isStreaming ? Infinity : 0, ease: 'linear' }}
            aria-hidden="true"
          >
            <Sparkles 
              className="h-4 w-4 md:h-5 md:w-5" 
              style={{ color: isStreaming ? EDUCASSOL_COLORS.accent : EDUCASSOL_COLORS.primary }} 
            />
          </motion.div>
          <h2 className="text-sm md:text-base font-semibold">Assistente de Correção</h2>
          {isStreaming && (
            <Badge 
              variant="outline" 
              className="ml-auto animate-pulse text-xs"
              style={{ borderColor: EDUCASSOL_COLORS.accent, color: EDUCASSOL_COLORS.accent }}
              aria-live="polite"
            >
              Processando...
            </Badge>
          )}
        </div>

        {/* Grading Progress */}
        {isStreaming && (
          <div className="space-y-2" role="progressbar" aria-valuenow={Math.round(gradingProgress)} aria-valuemin={0} aria-valuemax={100}>
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-muted-foreground">Progresso da Correção</span>
              <span className="font-medium">{Math.round(gradingProgress)}%</span>
            </div>
            <Progress value={gradingProgress} className="h-2" />
          </div>
        )}

        {/* Confidence Score */}
        {gradingResult && !isStreaming && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-muted-foreground">Confiança da IA:</span>
              <div className="flex items-center gap-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={EDUCASSOL_SPRING}
                  aria-hidden="true"
                >
                  <Sparkles 
                    className="h-4 w-4" 
                    style={{ color: getConfidenceColor() }} 
                  />
                </motion.div>
                <span 
                  className="font-bold text-sm md:text-base"
                  style={{ color: getConfidenceColor() }}
                  aria-label={`Confiança da IA: ${confidenceScore}%`}
                >
                  {confidenceScore}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs md:text-sm text-muted-foreground">Total: </span>
              <span className="text-base md:text-lg font-bold" style={{ color: EDUCASSOL_COLORS.primary }}>
                {totalScore}
              </span>
              <span className="text-xs md:text-sm text-muted-foreground"> / {totalMaxPoints}</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-3 md:p-4 space-y-3 md:space-y-4">
          {/* Streaming Text */}
          <AnimatePresence>
            {isStreaming && streamedText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                role="status"
                aria-live="polite"
              >
                <Card className="bg-accent/5 border-accent/20">
                  <CardContent className="p-3 md:p-4">
                    <p className="text-xs md:text-sm">
                      <TypingText text={streamedText} />
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Skeleton */}
          {isStreaming && !gradingResult && (
            <motion.div variants={FADE_UP_ITEM} className="space-y-3 md:space-y-4" aria-busy="true" aria-label="Carregando resultados">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-3 md:p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-6 w-6 md:h-8 md:w-8 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-3 md:h-4 w-1/3" />
                        <Skeleton className="h-2 md:h-3 w-1/4" />
                      </div>
                    </div>
                    <Skeleton className="h-12 md:h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Question Results */}
          {gradingResult && (
            <motion.div
              variants={STAGGER_PARENT}
              initial="hidden"
              animate="show"
              className="space-y-2 md:space-y-3"
              role="list"
              aria-label="Resultados por questão"
            >
              {gradingResult.questions.map((question, index) => (
                <QuestionResultCard
                  key={question.number}
                  question={question}
                  overrideScore={overrides.get(question.number)}
                  onScoreOverride={(score) => handleScoreOverride(question.number, score)}
                  onFeedbackEdit={
                    onFeedbackEdit 
                      ? (feedback) => onFeedbackEdit(question.number, feedback)
                      : undefined
                  }
                  index={index}
                />
              ))}
            </motion.div>
          )}

          {/* Summary Comment */}
          {gradingResult && gradingResult.summary_comment && (
            <motion.div variants={FADE_UP_ITEM}>
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2 px-3 md:px-4 pt-3 md:pt-4">
                  <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                    Comentário Geral
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-3 md:px-4 pb-3 md:pb-4">
                  <p className="text-xs md:text-sm">{gradingResult.summary_comment}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Empty State */}
          {!isStreaming && !gradingResult && (
            <motion.div
              variants={FADE_UP_ITEM}
              className="flex flex-col items-center justify-center py-8 md:py-12 text-center px-4"
            >
              <Sparkles 
                className="h-10 w-10 md:h-12 md:w-12 mb-4" 
                style={{ color: EDUCASSOL_COLORS.textMuted }}
                aria-hidden="true"
              />
              <p className="text-xs md:text-sm text-muted-foreground">
                Selecione uma submissão e inicie a correção para ver os resultados da IA.
              </p>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Footer with Override Count */}
      {gradingResult && overrides.size > 0 && (
        <motion.div
          variants={FADE_UP_ITEM}
          className="p-3 md:p-4 border-t bg-muted/30"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <AlertCircle className="h-4 w-4" style={{ color: EDUCASSOL_COLORS.accent }} aria-hidden="true" />
            <span className="text-muted-foreground">
              {overrides.size} {overrides.size === 1 ? 'nota ajustada' : 'notas ajustadas'} manualmente
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default AIAssistantPanel;
