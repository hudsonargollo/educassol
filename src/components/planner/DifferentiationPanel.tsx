/**
 * DifferentiationPanel Component
 * 
 * Panel for adapting content for students with different learning needs.
 * Supports ELL, Advanced, ADHD, and Visual differentiation types.
 * 
 * Requirements: 8.1 - Display options for ELL, Advanced, ADHD, and Visual Supports
 */

import React, { useState, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Globe,
  Rocket,
  Target,
  Eye,
  Sparkles,
  Info,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LessonPlan } from '@/lib/instructional/lesson-plan';
import type { Quiz } from '@/lib/instructional/quiz';
import type { Worksheet } from '@/lib/instructional/worksheet';

/**
 * Differentiation types supported by the engine
 * Requirement 8.1: Options for ELL, Advanced, ADHD, Visual
 */
export type DifferentiationType = 'ell' | 'advanced' | 'adhd' | 'visual';

/**
 * Content types that can be differentiated
 */
export type DifferentiableContent = LessonPlan | Quiz | Worksheet;

/**
 * Differentiation result with modified content
 */
export interface DifferentiatedResult<T extends DifferentiableContent> {
  original: T;
  differentiated: T;
  modificationsApplied: DifferentiationType[];
  preservedObjective: string;
}

/**
 * Props for the DifferentiationPanel component
 */
export interface DifferentiationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: DifferentiableContent;
  contentType: 'lesson-plan' | 'quiz' | 'worksheet';
  onDifferentiate: (types: DifferentiationType[]) => Promise<DifferentiatedResult<DifferentiableContent> | null>;
  onApply: (result: DifferentiatedResult<DifferentiableContent>) => void;
  isLoading?: boolean;
}

/**
 * Configuration for each differentiation type
 */
interface DifferentiationTypeConfig {
  type: DifferentiationType;
  label: string;
  icon: React.ElementType;
  description: string;
  details: string[];
  color: string;
}

const DIFFERENTIATION_TYPES: DifferentiationTypeConfig[] = [
  {
    type: 'ell',
    label: 'ELL Support',
    icon: Globe,
    description: 'English Language Learners',
    details: [
      'Simplify vocabulary and sentence structure',
      'Add visual aids and context clues',
      'Include native language cognates where applicable',
      'Provide sentence frames and scaffolds',
    ],
    color: 'text-blue-500',
  },
  {
    type: 'advanced',
    label: 'Advanced',
    icon: Rocket,
    description: 'Gifted & Talented',
    details: [
      'Add extension activities and challenges',
      'Include higher-order thinking prompts',
      'Provide opportunities for deeper exploration',
      'Add connections to real-world applications',
    ],
    color: 'text-purple-500',
  },
  {
    type: 'adhd',
    label: 'ADHD Support',
    icon: Target,
    description: 'Attention & Focus',
    details: [
      'Chunk content into smaller segments',
      'Add frequent check-ins and breaks',
      'Include movement-based activities',
      'Provide clear, step-by-step instructions',
    ],
    color: 'text-orange-500',
  },
  {
    type: 'visual',
    label: 'Visual Supports',
    icon: Eye,
    description: 'Visual Learning Aids',
    details: [
      'Add graphic organizers and diagrams',
      'Include color-coding suggestions',
      'Provide visual vocabulary cards',
      'Add icons and symbols for key concepts',
    ],
    color: 'text-green-500',
  },
];


/**
 * Get the learning objective from content
 */
function getLearningObjective(content: DifferentiableContent, contentType: string): string {
  if (contentType === 'lesson-plan' && 'learningObjective' in content) {
    return (content as LessonPlan).learningObjective;
  }
  if (contentType === 'quiz' && 'title' in content) {
    return `Quiz: ${(content as Quiz).title}`;
  }
  if (contentType === 'worksheet' && 'title' in content) {
    return `Worksheet: ${(content as Worksheet).title}`;
  }
  return 'Content objective';
}

/**
 * DifferentiationPanel Component
 */
export function DifferentiationPanel({
  open,
  onOpenChange,
  content,
  contentType,
  onDifferentiate,
  onApply,
  isLoading = false,
}: DifferentiationPanelProps) {
  const [selectedTypes, setSelectedTypes] = useState<DifferentiationType[]>([]);
  const [previewResult, setPreviewResult] = useState<DifferentiatedResult<DifferentiableContent> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const learningObjective = getLearningObjective(content, contentType);

  /**
   * Toggle a differentiation type selection
   */
  const handleTypeToggle = useCallback((type: DifferentiationType) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
    // Clear preview when selection changes
    setPreviewResult(null);
    setError(null);
  }, []);

  /**
   * Generate preview of differentiated content
   */
  const handlePreview = useCallback(async () => {
    if (selectedTypes.length === 0) {
      setError('Please select at least one differentiation type');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await onDifferentiate(selectedTypes);
      if (result) {
        setPreviewResult(result);
      } else {
        setError('Failed to generate differentiated content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTypes, onDifferentiate]);

  /**
   * Apply the differentiated content
   */
  const handleApply = useCallback(() => {
    if (previewResult) {
      onApply(previewResult);
      onOpenChange(false);
      // Reset state
      setSelectedTypes([]);
      setPreviewResult(null);
      setError(null);
    }
  }, [previewResult, onApply, onOpenChange]);

  /**
   * Reset panel state when closed
   */
  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setSelectedTypes([]);
      setPreviewResult(null);
      setError(null);
    }
    onOpenChange(isOpen);
  }, [onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-examai-purple-500" />
            Differentiate Content
          </SheetTitle>
          <SheetDescription>
            Adapt this {contentType.replace('-', ' ')} for students with different learning needs.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <div className="space-y-6 py-4">
            {/* Learning Objective Preservation Notice */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Learning objective will be preserved:</span>
                <p className="mt-1 text-sm text-muted-foreground">{learningObjective}</p>
              </AlertDescription>
            </Alert>

            {/* Differentiation Type Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Select Differentiation Types</Label>
              
              <div className="grid gap-3">
                {DIFFERENTIATION_TYPES.map((config) => (
                  <DifferentiationTypeCard
                    key={config.type}
                    config={config}
                    isSelected={selectedTypes.includes(config.type)}
                    onToggle={() => handleTypeToggle(config.type)}
                    disabled={isGenerating || isLoading}
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* Preview Section */}
            {previewResult && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Preview</Label>
                <DifferentiationPreview result={previewResult} />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isGenerating || isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          
          {!previewResult ? (
            <Button
              onClick={handlePreview}
              disabled={selectedTypes.length === 0 || isGenerating || isLoading}
              className="w-full sm:w-auto gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Preview...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Preview Changes
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleApply}
              disabled={isLoading}
              className="w-full sm:w-auto gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Apply Differentiation
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}


/**
 * Card component for each differentiation type
 */
interface DifferentiationTypeCardProps {
  config: DifferentiationTypeConfig;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function DifferentiationTypeCard({
  config,
  isSelected,
  onToggle,
  disabled = false,
}: DifferentiationTypeCardProps) {
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer',
        isSelected
          ? 'border-examai-purple-500 bg-examai-purple-500/5'
          : 'border-border hover:border-examai-purple-500/50 hover:bg-muted/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={() => !disabled && onToggle()}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => !disabled && onToggle()}
        disabled={disabled}
        className="mt-1"
      />
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-5 w-5', config.color)} />
          <span className="font-medium">{config.label}</span>
          <Badge variant="secondary" className="text-xs">
            {config.description}
          </Badge>
        </div>
        
        <ul className="text-sm text-muted-foreground space-y-1">
          {config.details.map((detail, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-muted-foreground/50">•</span>
              {detail}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Preview component for differentiated content
 */
interface DifferentiationPreviewProps {
  result: DifferentiatedResult<DifferentiableContent>;
}

function DifferentiationPreview({ result }: DifferentiationPreviewProps) {
  return (
    <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <span className="text-sm font-medium">Differentiation Applied</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {result.modificationsApplied.map((type) => {
          const config = DIFFERENTIATION_TYPES.find(t => t.type === type);
          if (!config) return null;
          const Icon = config.icon;
          
          return (
            <Badge key={type} variant="outline" className="gap-1">
              <Icon className={cn('h-3 w-3', config.color)} />
              {config.label}
            </Badge>
          );
        })}
      </div>
      
      <div className="text-sm">
        <span className="font-medium">Preserved Objective:</span>
        <p className="text-muted-foreground mt-1">{result.preservedObjective}</p>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Click "Apply Differentiation" to use the modified content.
      </p>
    </div>
  );
}

/**
 * Hook for managing differentiation state
 */
export function useDifferentiation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const differentiate = useCallback(async <T extends DifferentiableContent>(
    content: T,
    contentType: 'lesson-plan' | 'quiz' | 'worksheet',
    types: DifferentiationType[],
    differentiateFunction: (content: T, types: DifferentiationType[]) => Promise<T>
  ): Promise<DifferentiatedResult<T> | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const differentiated = await differentiateFunction(content, types);
      
      // Get the preserved objective
      let preservedObjective = '';
      if (contentType === 'lesson-plan' && 'learningObjective' in content) {
        preservedObjective = (content as unknown as LessonPlan).learningObjective;
      } else if ('title' in content) {
        preservedObjective = (content as unknown as { title: string }).title;
      }

      return {
        original: content,
        differentiated,
        modificationsApplied: types,
        preservedObjective,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Differentiation failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    differentiate,
  };
}

export default DifferentiationPanel;
