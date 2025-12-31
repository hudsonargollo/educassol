/**
 * LeveledReadingPreview Component
 * 
 * Displays leveled reading passages with tab interface for easy/medium/hard levels.
 * Shows Lexile level badges for each passage.
 * 
 * Requirements:
 * - 4.2: Display same content at three distinct Lexile levels
 * - 4.5: Provide options to print or export each level as PDF
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Download,
  Printer,
  GraduationCap,
  TrendingUp,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LeveledReading, ReadingPassage } from '@/lib/instructional/leveled-reading';

/**
 * Props for the LeveledReadingPreview component
 */
export interface LeveledReadingPreviewProps {
  /** The leveled reading to display */
  leveledReading: LeveledReading;
  /** Callback when export is requested */
  onExport?: (level: 'easy' | 'medium' | 'hard') => void;
  /** Callback when print is requested */
  onPrint?: (level: 'easy' | 'medium' | 'hard') => void;
  /** CSS class name */
  className?: string;
}

/**
 * Reading level configuration
 */
type ReadingLevel = 'easy' | 'medium' | 'hard';

interface LevelConfig {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

const LEVEL_CONFIG: Record<ReadingLevel, LevelConfig> = {
  easy: {
    label: 'Easy',
    icon: BookOpen,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    description: 'Simplified vocabulary and shorter sentences',
  },
  medium: {
    label: 'Medium',
    icon: TrendingUp,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    description: 'Grade-level appropriate complexity',
  },
  hard: {
    label: 'Hard',
    icon: Award,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    description: 'Advanced vocabulary and complex structures',
  },
};

/**
 * LexileBadge Component
 * Displays the Lexile level with appropriate styling
 */
function LexileBadge({
  lexileLevel,
  level,
}: {
  lexileLevel: number;
  level: ReadingLevel;
}) {
  const config = LEVEL_CONFIG[level];

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-mono',
        config.color,
        config.borderColor
      )}
    >
      <GraduationCap className="h-3 w-3 mr-1" />
      {lexileLevel}L
    </Badge>
  );
}


/**
 * PassageCard Component
 * Displays a single reading passage with its metadata
 */
function PassageCard({
  passage,
  level,
  onExport,
  onPrint,
}: {
  passage: ReadingPassage;
  level: ReadingLevel;
  onExport?: () => void;
  onPrint?: () => void;
}) {
  const config = LEVEL_CONFIG[level];
  const Icon = config.icon;

  // Calculate approximate reading stats
  const wordCount = passage.text.split(/\s+/).length;
  const sentenceCount = passage.text.split(/[.!?]+/).filter(Boolean).length;
  const avgWordsPerSentence = Math.round(wordCount / sentenceCount);

  return (
    <Card className={cn('overflow-hidden', config.borderColor)}>
      <CardHeader className={cn('pb-3', config.bgColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              config.bgColor,
              config.borderColor,
              'border'
            )}>
              <Icon className={cn('h-5 w-5', config.color)} />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {config.label} Level
                <LexileBadge lexileLevel={passage.lexileLevel} level={level} />
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {config.description}
              </p>
            </div>
          </div>

          {/* Action Buttons - Requirement 4.5 */}
          <div className="flex items-center gap-2">
            {onPrint && (
              <Button variant="ghost" size="sm" onClick={onPrint}>
                <Printer className="h-4 w-4" />
              </Button>
            )}
            {onExport && (
              <Button variant="ghost" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Reading Stats */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{sentenceCount} sentences</span>
          <span>•</span>
          <span>~{avgWordsPerSentence} words/sentence</span>
        </div>

        {/* Passage Text */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap leading-relaxed text-base">
            {passage.text}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * CoreConceptsCard Component
 * Displays the core concepts preserved across all levels
 */
function CoreConceptsCard({ concepts }: { concepts: string[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Core Concepts Preserved
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          These key concepts are maintained across all reading levels
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {concepts.map((concept, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span className="text-sm">{concept}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}


/**
 * LeveledReadingPreview Component
 * 
 * Displays leveled reading passages with tab interface.
 * Requirement 4.2: Display same content at three distinct Lexile levels
 */
export function LeveledReadingPreview({
  leveledReading,
  onExport,
  onPrint,
  className,
}: LeveledReadingPreviewProps) {
  const [activeLevel, setActiveLevel] = useState<ReadingLevel>('medium');

  const passages: Record<ReadingLevel, ReadingPassage> = {
    easy: leveledReading.passages.easy,
    medium: leveledReading.passages.medium,
    hard: leveledReading.passages.hard,
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{leveledReading.topic}</h2>
        <p className="text-muted-foreground">
          Reading passages at three difficulty levels
        </p>
      </div>

      {/* Lexile Level Comparison */}
      <div className="grid grid-cols-3 gap-4">
        {(['easy', 'medium', 'hard'] as const).map((level) => {
          const config = LEVEL_CONFIG[level];
          const passage = passages[level];
          const Icon = config.icon;

          return (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={cn(
                'p-4 rounded-lg border-2 transition-all text-left',
                activeLevel === level
                  ? cn(config.borderColor, config.bgColor)
                  : 'border-border hover:border-muted-foreground/50'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn('h-5 w-5', config.color)} />
                <span className="font-medium">{config.label}</span>
              </div>
              <LexileBadge lexileLevel={passage.lexileLevel} level={level} />
            </button>
          );
        })}
      </div>

      {/* Tab Interface - Requirement 4.2 */}
      <Tabs value={activeLevel} onValueChange={(v) => setActiveLevel(v as ReadingLevel)}>
        <TabsList className="grid w-full grid-cols-3">
          {(['easy', 'medium', 'hard'] as const).map((level) => {
            const config = LEVEL_CONFIG[level];
            const Icon = config.icon;

            return (
              <TabsTrigger key={level} value={level} className="gap-2">
                <Icon className="h-4 w-4" />
                {config.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(['easy', 'medium', 'hard'] as const).map((level) => (
          <TabsContent key={level} value={level} className="mt-6">
            <PassageCard
              passage={passages[level]}
              level={level}
              onExport={onExport ? () => onExport(level) : undefined}
              onPrint={onPrint ? () => onPrint(level) : undefined}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Core Concepts */}
      <CoreConceptsCard concepts={leveledReading.coreConceptsPreserved} />

      {/* Export All Button */}
      <div className="flex justify-end gap-2">
        {onPrint && (
          <Button variant="outline" onClick={() => onPrint(activeLevel)}>
            <Printer className="h-4 w-4 mr-2" />
            Print {LEVEL_CONFIG[activeLevel].label}
          </Button>
        )}
        {onExport && (
          <Button onClick={() => onExport(activeLevel)}>
            <Download className="h-4 w-4 mr-2" />
            Export {LEVEL_CONFIG[activeLevel].label} as PDF
          </Button>
        )}
      </div>
    </div>
  );
}

export default LeveledReadingPreview;
