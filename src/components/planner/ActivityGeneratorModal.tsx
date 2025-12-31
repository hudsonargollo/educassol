/**
 * ActivityGeneratorModal Component
 * 
 * Modal for generating educational activities from lesson context.
 * Supports quiz, worksheet, reading, and slides generation.
 * 
 * Requirements: 5.1, 6.1, 7.1
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, FileText, BookOpen, Presentation, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LessonPlan } from '@/lib/instructional/lesson-plan';

/**
 * Activity types supported by the generator
 */
export type ActivityType = 'quiz' | 'worksheet' | 'reading' | 'slides';

/**
 * Quiz generation options
 */
export interface QuizOptions {
  numberOfQuestions: number;
  questionTypes: ('multiple-choice' | 'true-false' | 'short-answer')[];
  bloomLevels: ('apply' | 'analyze' | 'evaluate' | 'create')[];
}

/**
 * Worksheet generation options
 */
export interface WorksheetOptions {
  sectionTypes: ('vocabulary-matching' | 'cloze' | 'diagram-labeling' | 'short-answer')[];
  includeAnswerKey: boolean;
}

/**
 * Reading generation options
 */
export interface ReadingOptions {
  easyLexile: number;
  mediumLexile: number;
  hardLexile: number;
}

/**
 * Slides generation options
 */
export interface SlidesOptions {
  numberOfSlides: number;
  includeActivities: boolean;
}


/**
 * Props for the ActivityGeneratorModal component
 */
export interface ActivityGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonPlan: LessonPlan;
  onGenerate: (type: ActivityType, options: QuizOptions | WorksheetOptions | ReadingOptions | SlidesOptions) => void;
  isGenerating?: boolean;
}

/**
 * Activity type configuration
 */
const ACTIVITY_TYPES: {
  type: ActivityType;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    type: 'quiz',
    label: 'Quiz',
    icon: ClipboardList,
    description: 'Generate assessment questions',
  },
  {
    type: 'worksheet',
    label: 'Worksheet',
    icon: FileText,
    description: 'Create practice activities',
  },
  {
    type: 'reading',
    label: 'Reading',
    icon: BookOpen,
    description: 'Leveled reading passages',
  },
  {
    type: 'slides',
    label: 'Slides',
    icon: Presentation,
    description: 'Presentation outline',
  },
];

/**
 * Default options for each activity type
 */
const DEFAULT_QUIZ_OPTIONS: QuizOptions = {
  numberOfQuestions: 10,
  questionTypes: ['multiple-choice', 'true-false'],
  bloomLevels: ['apply', 'analyze'],
};

const DEFAULT_WORKSHEET_OPTIONS: WorksheetOptions = {
  sectionTypes: ['vocabulary-matching', 'cloze'],
  includeAnswerKey: true,
};

const DEFAULT_READING_OPTIONS: ReadingOptions = {
  easyLexile: 500,
  mediumLexile: 800,
  hardLexile: 1100,
};

const DEFAULT_SLIDES_OPTIONS: SlidesOptions = {
  numberOfSlides: 10,
  includeActivities: true,
};

/**
 * ActivityGeneratorModal Component
 */
export function ActivityGeneratorModal({
  open,
  onOpenChange,
  lessonPlan,
  onGenerate,
  isGenerating = false,
}: ActivityGeneratorModalProps) {
  const [selectedType, setSelectedType] = useState<ActivityType>('quiz');
  const [quizOptions, setQuizOptions] = useState<QuizOptions>(DEFAULT_QUIZ_OPTIONS);
  const [worksheetOptions, setWorksheetOptions] = useState<WorksheetOptions>(DEFAULT_WORKSHEET_OPTIONS);
  const [readingOptions, setReadingOptions] = useState<ReadingOptions>(DEFAULT_READING_OPTIONS);
  const [slidesOptions, setSlidesOptions] = useState<SlidesOptions>(DEFAULT_SLIDES_OPTIONS);

  const handleGenerate = () => {
    let options: QuizOptions | WorksheetOptions | ReadingOptions | SlidesOptions;
    switch (selectedType) {
      case 'quiz':
        options = quizOptions;
        break;
      case 'worksheet':
        options = worksheetOptions;
        break;
      case 'reading':
        options = readingOptions;
        break;
      case 'slides':
        options = slidesOptions;
        break;
    }
    onGenerate(selectedType, options);
  };

  const handleQuestionTypeToggle = (type: 'multiple-choice' | 'true-false' | 'short-answer') => {
    setQuizOptions(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type],
    }));
  };

  const handleBloomLevelToggle = (level: 'apply' | 'analyze' | 'evaluate' | 'create') => {
    setQuizOptions(prev => ({
      ...prev,
      bloomLevels: prev.bloomLevels.includes(level)
        ? prev.bloomLevels.filter(l => l !== level)
        : [...prev.bloomLevels, level],
    }));
  };

  const handleSectionTypeToggle = (type: 'vocabulary-matching' | 'cloze' | 'diagram-labeling' | 'short-answer') => {
    setWorksheetOptions(prev => ({
      ...prev,
      sectionTypes: prev.sectionTypes.includes(type)
        ? prev.sectionTypes.filter(t => t !== type)
        : [...prev.sectionTypes, type],
    }));
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-examai-purple-500" />
            Generate Activity for: "{lessonPlan.topic}"
          </DialogTitle>
          <DialogDescription>
            Select an activity type and customize options to generate content from your lesson plan.
          </DialogDescription>
        </DialogHeader>

        {/* Activity Type Selector */}
        <div className="grid grid-cols-4 gap-3 py-4">
          {ACTIVITY_TYPES.map(({ type, label, icon: Icon, description }) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                selectedType === type
                  ? 'border-examai-purple-500 bg-examai-purple-500/10'
                  : 'border-border hover:border-examai-purple-500/50 hover:bg-muted/50'
              )}
            >
              <Icon className={cn(
                'h-8 w-8',
                selectedType === type ? 'text-examai-purple-500' : 'text-muted-foreground'
              )} />
              <span className={cn(
                'font-medium text-sm',
                selectedType === type ? 'text-examai-purple-500' : 'text-foreground'
              )}>
                {label}
              </span>
              <span className="text-xs text-muted-foreground text-center">
                {description}
              </span>
            </button>
          ))}
        </div>

        {/* Type-specific Options */}
        <div className="space-y-4 py-4 border-t">
          {selectedType === 'quiz' && (
            <QuizOptionsForm
              options={quizOptions}
              onNumberChange={(n) => setQuizOptions(prev => ({ ...prev, numberOfQuestions: n }))}
              onQuestionTypeToggle={handleQuestionTypeToggle}
              onBloomLevelToggle={handleBloomLevelToggle}
            />
          )}

          {selectedType === 'worksheet' && (
            <WorksheetOptionsForm
              options={worksheetOptions}
              onSectionTypeToggle={handleSectionTypeToggle}
              onAnswerKeyToggle={(checked) => setWorksheetOptions(prev => ({ ...prev, includeAnswerKey: checked }))}
            />
          )}

          {selectedType === 'reading' && (
            <ReadingOptionsForm
              options={readingOptions}
              onChange={setReadingOptions}
            />
          )}

          {selectedType === 'slides' && (
            <SlidesOptionsForm
              options={slidesOptions}
              onNumberChange={(n) => setSlidesOptions(prev => ({ ...prev, numberOfSlides: n }))}
              onActivitiesToggle={(checked) => setSlidesOptions(prev => ({ ...prev, includeActivities: checked }))}
            />
          )}
        </div>

        {/* Context Info */}
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <span className="font-medium">Context:</span> Using lesson objectives and vocabulary from "{lessonPlan.topic}"
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


/**
 * Quiz Options Form
 */
function QuizOptionsForm({
  options,
  onNumberChange,
  onQuestionTypeToggle,
  onBloomLevelToggle,
}: {
  options: QuizOptions;
  onNumberChange: (n: number) => void;
  onQuestionTypeToggle: (type: 'multiple-choice' | 'true-false' | 'short-answer') => void;
  onBloomLevelToggle: (level: 'apply' | 'analyze' | 'evaluate' | 'create') => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="num-questions">Number of Questions</Label>
        <Select
          value={options.numberOfQuestions.toString()}
          onValueChange={(v) => onNumberChange(parseInt(v, 10))}
        >
          <SelectTrigger id="num-questions">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 15, 20].map((n) => (
              <SelectItem key={n} value={n.toString()}>
                {n} questions
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Question Types</Label>
        <div className="flex flex-wrap gap-4">
          {(['multiple-choice', 'true-false', 'short-answer'] as const).map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`qt-${type}`}
                checked={options.questionTypes.includes(type)}
                onCheckedChange={() => onQuestionTypeToggle(type)}
              />
              <Label htmlFor={`qt-${type}`} className="text-sm font-normal capitalize">
                {type.replace('-', ' ')}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Bloom's Taxonomy Levels</Label>
        <div className="flex flex-wrap gap-4">
          {(['apply', 'analyze', 'evaluate', 'create'] as const).map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={`bl-${level}`}
                checked={options.bloomLevels.includes(level)}
                onCheckedChange={() => onBloomLevelToggle(level)}
              />
              <Label htmlFor={`bl-${level}`} className="text-sm font-normal capitalize">
                {level}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Worksheet Options Form
 */
function WorksheetOptionsForm({
  options,
  onSectionTypeToggle,
  onAnswerKeyToggle,
}: {
  options: WorksheetOptions;
  onSectionTypeToggle: (type: 'vocabulary-matching' | 'cloze' | 'diagram-labeling' | 'short-answer') => void;
  onAnswerKeyToggle: (checked: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Section Types</Label>
        <div className="flex flex-wrap gap-4">
          {(['vocabulary-matching', 'cloze', 'diagram-labeling', 'short-answer'] as const).map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`st-${type}`}
                checked={options.sectionTypes.includes(type)}
                onCheckedChange={() => onSectionTypeToggle(type)}
              />
              <Label htmlFor={`st-${type}`} className="text-sm font-normal capitalize">
                {type.replace('-', ' ')}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="answer-key"
          checked={options.includeAnswerKey}
          onCheckedChange={(checked) => onAnswerKeyToggle(checked === true)}
        />
        <Label htmlFor="answer-key" className="text-sm font-normal">
          Include Answer Key
        </Label>
      </div>
    </div>
  );
}


/**
 * Reading Options Form
 */
function ReadingOptionsForm({
  options,
  onChange,
}: {
  options: ReadingOptions;
  onChange: (options: ReadingOptions) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="easy-lexile">Easy Level (Lexile)</Label>
          <Input
            id="easy-lexile"
            type="number"
            value={options.easyLexile}
            onChange={(e) => onChange({ ...options, easyLexile: parseInt(e.target.value, 10) || 500 })}
            min={200}
            max={600}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="medium-lexile">Medium Level (Lexile)</Label>
          <Input
            id="medium-lexile"
            type="number"
            value={options.mediumLexile}
            onChange={(e) => onChange({ ...options, mediumLexile: parseInt(e.target.value, 10) || 800 })}
            min={600}
            max={1000}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hard-lexile">Hard Level (Lexile)</Label>
          <Input
            id="hard-lexile"
            type="number"
            value={options.hardLexile}
            onChange={(e) => onChange({ ...options, hardLexile: parseInt(e.target.value, 10) || 1100 })}
            min={900}
            max={1400}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Lexile levels determine reading difficulty. Lower values are easier to read.
      </p>
    </div>
  );
}

/**
 * Slides Options Form
 */
function SlidesOptionsForm({
  options,
  onNumberChange,
  onActivitiesToggle,
}: {
  options: SlidesOptions;
  onNumberChange: (n: number) => void;
  onActivitiesToggle: (checked: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="num-slides">Number of Slides</Label>
        <Select
          value={options.numberOfSlides.toString()}
          onValueChange={(v) => onNumberChange(parseInt(v, 10))}
        >
          <SelectTrigger id="num-slides">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[5, 8, 10, 12, 15].map((n) => (
              <SelectItem key={n} value={n.toString()}>
                {n} slides
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="include-activities"
          checked={options.includeActivities}
          onCheckedChange={(checked) => onActivitiesToggle(checked === true)}
        />
        <Label htmlFor="include-activities" className="text-sm font-normal">
          Include Activity Slides
        </Label>
      </div>
    </div>
  );
}

export default ActivityGeneratorModal;
