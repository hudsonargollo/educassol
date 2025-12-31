/**
 * WorksheetPreview Component
 * 
 * Displays a generated worksheet with vocabulary matching, cloze sections,
 * and renders markdown content.
 * 
 * Requirements:
 * - 6.2: Display vocabulary matching activities with terms and definitions
 * - 6.3: Display cloze (fill-in-the-blank) passages
 * - 6.4: Render markdown content suitable for PDF export
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye,
  EyeOff,
  FileText,
  BookOpen,
  PenLine,
  Image,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  Worksheet,
  WorksheetSection,
  WorksheetSectionType,
  VocabularyMatching,
  ClozePassage,
  DiagramLabeling,
  ShortAnswerSection,
} from '@/lib/instructional/worksheet';

/**
 * Props for the WorksheetPreview component
 */
export interface WorksheetPreviewProps {
  /** The worksheet to display */
  worksheet: Worksheet;
  /** Whether to show answers by default */
  showAnswers?: boolean;
  /** CSS class name */
  className?: string;
}

/**
 * Section type icons
 */
const SECTION_ICONS: Record<WorksheetSectionType, React.ElementType> = {
  'vocabulary-matching': BookOpen,
  'cloze': PenLine,
  'diagram-labeling': Image,
  'short-answer': MessageSquare,
};

/**
 * Section type labels
 */
const SECTION_LABELS: Record<WorksheetSectionType, string> = {
  'vocabulary-matching': 'Vocabulary Matching',
  'cloze': 'Fill in the Blanks',
  'diagram-labeling': 'Diagram Labeling',
  'short-answer': 'Short Answer',
};

/**
 * Type guard for VocabularyMatching content
 */
function isVocabularyMatching(content: unknown): content is VocabularyMatching {
  return (
    typeof content === 'object' &&
    content !== null &&
    'terms' in content &&
    Array.isArray((content as VocabularyMatching).terms)
  );
}

/**
 * Type guard for ClozePassage content
 */
function isClozePassage(content: unknown): content is ClozePassage {
  return (
    typeof content === 'object' &&
    content !== null &&
    'text' in content &&
    'answers' in content
  );
}

/**
 * Type guard for DiagramLabeling content
 */
function isDiagramLabeling(content: unknown): content is DiagramLabeling {
  return (
    typeof content === 'object' &&
    content !== null &&
    'imageDescription' in content &&
    'labels' in content
  );
}

/**
 * Type guard for ShortAnswerSection content
 */
function isShortAnswerSection(content: unknown): content is ShortAnswerSection {
  return (
    typeof content === 'object' &&
    content !== null &&
    'questions' in content &&
    Array.isArray((content as ShortAnswerSection).questions)
  );
}


/**
 * VocabularyMatchingSection Component
 * Requirement 6.2: Display vocabulary matching activities
 */
function VocabularyMatchingSection({
  content,
  instructions,
  showAnswers,
}: {
  content: VocabularyMatching;
  instructions: string;
  showAnswers: boolean;
}) {
  // Shuffle definitions for the matching exercise
  const shuffledDefinitions = React.useMemo(() => {
    const defs = content.terms.map((t, i) => ({ definition: t.definition, originalIndex: i }));
    // Simple shuffle
    for (let i = defs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [defs[i], defs[j]] = [defs[j], defs[i]];
    }
    return defs;
  }, [content.terms]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{instructions}</p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Terms Column */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
            Terms
          </h4>
          <div className="space-y-2">
            {content.terms.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-examai-purple-500 text-white text-xs font-medium">
                  {index + 1}
                </span>
                <span className="font-medium">{item.term}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Definitions Column */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
            Definitions
          </h4>
          <div className="space-y-2">
            {shuffledDefinitions.map((item, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border',
                  showAnswers && 'bg-green-50 dark:bg-green-900/20'
                )}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                  {String.fromCharCode(65 + index)}
                </span>
                <div className="flex-1">
                  <span>{item.definition}</span>
                  {showAnswers && (
                    <Badge variant="secondary" className="ml-2">
                      → {item.originalIndex + 1}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ClozeSection Component
 * Requirement 6.3: Display cloze (fill-in-the-blank) passages
 */
function ClozeSection({
  content,
  instructions,
  showAnswers,
}: {
  content: ClozePassage;
  instructions: string;
  showAnswers: boolean;
}) {
  // Replace blanks with numbered placeholders or answers
  const formattedText = React.useMemo(() => {
    let text = content.text;
    let blankIndex = 0;

    // Replace _____ patterns with numbered blanks
    text = text.replace(/_+/g, () => {
      const answer = content.answers[blankIndex];
      blankIndex++;
      if (showAnswers && answer) {
        return `[${answer}]`;
      }
      return `(${blankIndex})_____`;
    });

    return text;
  }, [content.text, content.answers, showAnswers]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{instructions}</p>

      <div className="p-4 rounded-lg border bg-card">
        <p className="whitespace-pre-wrap leading-relaxed">{formattedText}</p>
      </div>

      {/* Word Bank */}
      {!showAnswers && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
            Word Bank
          </h4>
          <div className="flex flex-wrap gap-2">
            {content.answers.map((answer, index) => (
              <Badge key={index} variant="outline" className="text-sm">
                {answer}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Answer Key */}
      {showAnswers && (
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-sm text-green-700 dark:text-green-400 mb-2">
            Answer Key
          </h4>
          <div className="flex flex-wrap gap-2">
            {content.answers.map((answer, index) => (
              <span key={index} className="text-sm">
                {index + 1}. {answer}
                {index < content.answers.length - 1 && ','}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


/**
 * DiagramLabelingSection Component
 */
function DiagramLabelingSection({
  content,
  instructions,
  showAnswers,
}: {
  content: DiagramLabeling;
  instructions: string;
  showAnswers: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{instructions}</p>

      {/* Image Description */}
      <div className="p-4 rounded-lg border bg-muted/50 text-center">
        <Image className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground italic">
          {content.imageDescription}
        </p>
      </div>

      {/* Labels */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
          Labels to Identify
        </h4>
        <div className="grid gap-2">
          {content.labels.map((label, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border',
                showAnswers && 'bg-green-50 dark:bg-green-900/20'
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-examai-purple-500 text-white text-xs font-medium">
                {index + 1}
              </span>
              <span className="text-muted-foreground">{label.position}:</span>
              {showAnswers ? (
                <span className="font-medium text-green-700 dark:text-green-400">
                  {label.answer}
                </span>
              ) : (
                <span className="flex-1 border-b border-dashed border-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * ShortAnswerSection Component
 */
function ShortAnswerSectionComponent({
  content,
  instructions,
  showAnswers,
}: {
  content: ShortAnswerSection;
  instructions: string;
  showAnswers: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{instructions}</p>

      <div className="space-y-4">
        {content.questions.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-examai-purple-500 text-white text-xs font-medium">
                {index + 1}
              </span>
              <p className="font-medium">{item.question}</p>
            </div>

            {showAnswers ? (
              <div className="ml-9 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-400">
                  <span className="font-medium">Expected Answer:</span> {item.expectedAnswer}
                </p>
              </div>
            ) : (
              <div className="ml-9 space-y-1">
                {[1, 2, 3].map((line) => (
                  <div
                    key={line}
                    className="h-6 border-b border-muted-foreground/30"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * SectionRenderer Component
 * Renders the appropriate section component based on type
 */
function SectionRenderer({
  section,
  showAnswers,
}: {
  section: WorksheetSection;
  showAnswers: boolean;
}) {
  const { type, instructions, content } = section;

  switch (type) {
    case 'vocabulary-matching':
      if (isVocabularyMatching(content)) {
        return (
          <VocabularyMatchingSection
            content={content}
            instructions={instructions}
            showAnswers={showAnswers}
          />
        );
      }
      break;
    case 'cloze':
      if (isClozePassage(content)) {
        return (
          <ClozeSection
            content={content}
            instructions={instructions}
            showAnswers={showAnswers}
          />
        );
      }
      break;
    case 'diagram-labeling':
      if (isDiagramLabeling(content)) {
        return (
          <DiagramLabelingSection
            content={content}
            instructions={instructions}
            showAnswers={showAnswers}
          />
        );
      }
      break;
    case 'short-answer':
      if (isShortAnswerSection(content)) {
        return (
          <ShortAnswerSectionComponent
            content={content}
            instructions={instructions}
            showAnswers={showAnswers}
          />
        );
      }
      break;
  }

  return (
    <p className="text-muted-foreground">Unable to render section content.</p>
  );
}


/**
 * WorksheetPreview Component
 * 
 * Displays a complete worksheet with all sections.
 */
export function WorksheetPreview({
  worksheet,
  showAnswers = false,
  className,
}: WorksheetPreviewProps) {
  const [showAllAnswers, setShowAllAnswers] = useState(showAnswers);
  const [activeTab, setActiveTab] = useState<'preview' | 'markdown'>('preview');

  return (
    <div className={cn('space-y-6', className)}>
      {/* Worksheet Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{worksheet.title}</h2>
          <p className="text-muted-foreground mt-1">
            {worksheet.sections.length} section{worksheet.sections.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllAnswers(!showAllAnswers)}
          >
            {showAllAnswers ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Answers
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Answers
              </>
            )}
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'markdown')}>
        <TabsList>
          <TabsTrigger value="preview" className="gap-2">
            <FileText className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="markdown" className="gap-2">
            <FileText className="h-4 w-4" />
            Markdown
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-6 mt-6">
          {/* Section Cards */}
          {worksheet.sections.map((section, index) => {
            const Icon = SECTION_ICONS[section.type];
            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-examai-purple-500/10">
                      <Icon className="h-5 w-5 text-examai-purple-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Section {index + 1}: {SECTION_LABELS[section.type]}
                      </CardTitle>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {section.type.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <SectionRenderer section={section} showAnswers={showAllAnswers} />
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Markdown View - Requirement 6.4 */}
        <TabsContent value="markdown" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Markdown Content</CardTitle>
              <p className="text-sm text-muted-foreground">
                Ready for PDF export
              </p>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-lg bg-muted overflow-auto text-sm whitespace-pre-wrap">
                {worksheet.markdownContent}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default WorksheetPreview;
