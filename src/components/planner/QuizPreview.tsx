/**
 * QuizPreview Component
 * 
 * Displays a generated quiz with question cards and Bloom's level badges.
 * 
 * Requirements:
 * - 5.2: Display questions targeting Bloom's Taxonomy levels
 * - 5.3: Show explanation for each correct answer
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  EyeOff,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Quiz, QuizQuestion, BloomLevel } from '@/lib/instructional/quiz';

/**
 * Props for the QuizPreview component
 */
export interface QuizPreviewProps {
  /** The quiz to display */
  quiz: Quiz;
  /** Whether to show answers by default */
  showAnswers?: boolean;
  /** CSS class name */
  className?: string;
}

/**
 * Bloom's level badge colors
 * Requirement 5.2: Visual distinction for Bloom's Taxonomy levels
 */
const BLOOM_LEVEL_COLORS: Record<BloomLevel, string> = {
  remember: 'bg-slate-500',
  understand: 'bg-blue-500',
  apply: 'bg-green-500',
  analyze: 'bg-yellow-500',
  evaluate: 'bg-orange-500',
  create: 'bg-purple-500',
};

/**
 * Bloom's level descriptions
 */
const BLOOM_LEVEL_DESCRIPTIONS: Record<BloomLevel, string> = {
  remember: 'Recall facts and basic concepts',
  understand: 'Explain ideas or concepts',
  apply: 'Use information in new situations',
  analyze: 'Draw connections among ideas',
  evaluate: 'Justify a decision or course of action',
  create: 'Produce new or original work',
};

/**
 * BloomLevelBadge Component
 * Displays a badge for the Bloom's Taxonomy level
 */
function BloomLevelBadge({ level }: { level: BloomLevel }) {
  return (
    <Badge
      className={cn(
        'text-white capitalize',
        BLOOM_LEVEL_COLORS[level]
      )}
      title={BLOOM_LEVEL_DESCRIPTIONS[level]}
    >
      <Brain className="h-3 w-3 mr-1" />
      {level}
    </Badge>
  );
}

/**
 * QuestionTypeBadge Component
 */
function QuestionTypeBadge({ type }: { type: QuizQuestion['type'] }) {
  const labels: Record<QuizQuestion['type'], string> = {
    'multiple-choice': 'Multiple Choice',
    'true-false': 'True/False',
    'short-answer': 'Short Answer',
  };

  return (
    <Badge variant="outline" className="capitalize">
      {labels[type]}
    </Badge>
  );
}


/**
 * QuestionCard Component
 * Displays a single quiz question with options and explanation
 */
function QuestionCard({
  question,
  index,
  showAnswer,
}: {
  question: QuizQuestion;
  index: number;
  showAnswer: boolean;
}) {
  const [revealed, setRevealed] = useState(showAnswer);

  // Update revealed state when showAnswer prop changes
  React.useEffect(() => {
    setRevealed(showAnswer);
  }, [showAnswer]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-examai-purple-500 text-white text-sm font-medium">
              {index + 1}
            </span>
            <CardTitle className="text-base font-medium leading-relaxed">
              {question.text}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <QuestionTypeBadge type={question.type} />
            <BloomLevelBadge level={question.bloomLevel} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Options for multiple-choice and true-false */}
        {question.options && question.options.length > 0 && (
          <div className="space-y-2">
            {question.options.map((option, optIndex) => {
              const isCorrect = question.correctOptionIndex === optIndex;
              const showCorrectness = revealed && isCorrect;
              const showIncorrect = revealed && !isCorrect;

              return (
                <div
                  key={optIndex}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                    showCorrectness && 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700',
                    showIncorrect && 'bg-muted/50 border-border',
                    !revealed && 'hover:bg-muted/50'
                  )}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm">
                    {String.fromCharCode(65 + optIndex)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showCorrectness && (
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  )}
                  {showIncorrect && (
                    <XCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Short answer display */}
        {question.type === 'short-answer' && revealed && question.correctAnswer && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-300 dark:bg-green-900/20 dark:border-green-700">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              Expected Answer
            </div>
            <p className="text-sm">{question.correctAnswer}</p>
          </div>
        )}

        {/* Explanation - Requirement 5.3 */}
        {revealed && question.explanation && (
          <Accordion type="single" collapsible defaultValue="explanation">
            <AccordionItem value="explanation" className="border-none">
              <AccordionTrigger className="py-2 text-sm hover:no-underline">
                <span className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Explanation
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {question.explanation}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Toggle answer visibility */}
        {!showAnswer && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRevealed(!revealed)}
            className="w-full"
          >
            {revealed ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Answer
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Answer
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}


/**
 * QuizPreview Component
 * 
 * Displays a complete quiz with all questions, answers, and explanations.
 */
export function QuizPreview({
  quiz,
  showAnswers = false,
  className,
}: QuizPreviewProps) {
  const [showAllAnswers, setShowAllAnswers] = useState(showAnswers);

  // Count questions by Bloom's level
  const bloomCounts = quiz.questions.reduce((acc, q) => {
    acc[q.bloomLevel] = (acc[q.bloomLevel] || 0) + 1;
    return acc;
  }, {} as Record<BloomLevel, number>);

  // Count questions by type
  const typeCounts = quiz.questions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {} as Record<QuizQuestion['type'], number>);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Quiz Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{quiz.title}</h2>
            <p className="text-muted-foreground mt-1">{quiz.instructions}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllAnswers(!showAllAnswers)}
          >
            {showAllAnswers ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide All Answers
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show All Answers
              </>
            )}
          </Button>
        </div>

        {/* Quiz Stats */}
        <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Questions</p>
            <p className="text-lg font-semibold">{quiz.questions.length}</p>
          </div>

          <div className="w-px bg-border" />

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Question Types</p>
            <div className="flex gap-2">
              {Object.entries(typeCounts).map(([type, count]) => (
                <Badge key={type} variant="secondary" className="capitalize">
                  {type.replace('-', ' ')}: {count}
                </Badge>
              ))}
            </div>
          </div>

          <div className="w-px bg-border" />

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Bloom's Levels</p>
            <div className="flex gap-2">
              {Object.entries(bloomCounts).map(([level, count]) => (
                <Badge
                  key={level}
                  className={cn('text-white capitalize', BLOOM_LEVEL_COLORS[level as BloomLevel])}
                >
                  {level}: {count}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {quiz.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            showAnswer={showAllAnswers}
          />
        ))}
      </div>
    </div>
  );
}

export default QuizPreview;
