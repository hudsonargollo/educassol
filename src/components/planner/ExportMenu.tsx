/**
 * ExportMenu Component
 * Requirements: 12.1, 12.2, 12.3
 * 
 * Dropdown menu for exporting content in various formats:
 * - PDF for lesson plans, quizzes, and worksheets
 * - PPTX for slide outlines
 * - CSV for quizzes (for LMS import)
 */

import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Presentation,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import type { LessonPlan } from '@/lib/instructional/lesson-plan';
import type { Quiz } from '@/lib/instructional/quiz';
import type { Worksheet } from '@/lib/instructional/worksheet';
import type { SlideOutline } from '@/lib/instructional/slide-outline';

import { downloadLessonPlanPDF, downloadQuizPDF, downloadWorksheetPDF } from '@/lib/instructional/export-pdf';
import { downloadSlideOutlinePPTX } from '@/lib/instructional/export-pptx';
import { downloadQuizCSV, downloadQuizLMSCSV, downloadQuizAnswerKeyCSV } from '@/lib/instructional/export-csv';

/**
 * Content types that can be exported
 */
export type ExportableContentType = 'lesson-plan' | 'quiz' | 'worksheet' | 'slides';

/**
 * Union type for all exportable content
 */
export type ExportableContent = 
  | { type: 'lesson-plan'; data: LessonPlan }
  | { type: 'quiz'; data: Quiz }
  | { type: 'worksheet'; data: Worksheet }
  | { type: 'slides'; data: SlideOutline };

/**
 * Props for the ExportMenu component
 */
export interface ExportMenuProps {
  /** The content to export */
  content: ExportableContent;
  /** Optional custom trigger element */
  trigger?: React.ReactNode;
  /** Optional callback when export starts */
  onExportStart?: () => void;
  /** Optional callback when export completes */
  onExportComplete?: (format: string) => void;
  /** Optional callback when export fails */
  onExportError?: (error: Error) => void;
  /** Whether the menu is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Export format options by content type
 */
const EXPORT_OPTIONS: Record<ExportableContentType, Array<{
  format: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}>> = {
  'lesson-plan': [
    { format: 'pdf', label: 'PDF Document', icon: <FileText className="h-4 w-4" />, description: 'Print-ready lesson plan' },
  ],
  'quiz': [
    { format: 'pdf', label: 'PDF Document', icon: <FileText className="h-4 w-4" />, description: 'Quiz with answer key' },
    { format: 'csv', label: 'CSV Spreadsheet', icon: <FileSpreadsheet className="h-4 w-4" />, description: 'Full quiz data' },
    { format: 'csv-lms', label: 'LMS Import (CSV)', icon: <FileSpreadsheet className="h-4 w-4" />, description: 'For Google Classroom, Canvas' },
    { format: 'csv-answers', label: 'Answer Key (CSV)', icon: <FileSpreadsheet className="h-4 w-4" />, description: 'Quick grading reference' },
  ],
  'worksheet': [
    { format: 'pdf', label: 'PDF Document', icon: <FileText className="h-4 w-4" />, description: 'Student worksheet' },
  ],
  'slides': [
    { format: 'pptx', label: 'PowerPoint (.pptx)', icon: <Presentation className="h-4 w-4" />, description: 'Editable presentation' },
  ],
};

/**
 * ExportMenu component for exporting instructional content
 */
export function ExportMenu({
  content,
  trigger,
  onExportStart,
  onExportComplete,
  onExportError,
  disabled = false,
  className,
}: ExportMenuProps): React.ReactElement {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const options = EXPORT_OPTIONS[content.type];

  const handleExport = async (format: string) => {
    setIsExporting(true);
    setExportStatus('idle');
    onExportStart?.();

    try {
      switch (content.type) {
        case 'lesson-plan':
          if (format === 'pdf') {
            downloadLessonPlanPDF(content.data);
          }
          break;

        case 'quiz':
          if (format === 'pdf') {
            downloadQuizPDF(content.data);
          } else if (format === 'csv') {
            downloadQuizCSV(content.data);
          } else if (format === 'csv-lms') {
            downloadQuizLMSCSV(content.data);
          } else if (format === 'csv-answers') {
            downloadQuizAnswerKeyCSV(content.data);
          }
          break;

        case 'worksheet':
          if (format === 'pdf') {
            downloadWorksheetPDF(content.data);
          }
          break;

        case 'slides':
          if (format === 'pptx') {
            await downloadSlideOutlinePPTX(content.data);
          }
          break;
      }

      setExportStatus('success');
      onExportComplete?.(format);
      
      toast({
        title: 'Export successful',
        description: `Your ${content.type.replace('-', ' ')} has been exported.`,
      });

      // Reset status after a delay
      setTimeout(() => setExportStatus('idle'), 2000);
    } catch (error) {
      setExportStatus('error');
      const err = error instanceof Error ? error : new Error('Export failed');
      onExportError?.(err);
      
      toast({
        title: 'Export failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusIcon = () => {
    if (isExporting) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (exportStatus === 'success') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (exportStatus === 'error') {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <Download className="h-4 w-4" />;
  };

  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="sm" 
      disabled={disabled || isExporting}
      className={className}
    >
      {getStatusIcon()}
      <span className="ml-2">Export</span>
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuItem
            key={option.format}
            onClick={() => handleExport(option.format)}
            disabled={isExporting}
            className="flex items-start gap-2 py-2"
          >
            <span className="mt-0.5">{option.icon}</span>
            <div className="flex flex-col">
              <span>{option.label}</span>
              {option.description && (
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Props for the MultiExportMenu component
 */
export interface MultiExportMenuProps {
  /** Multiple content items to export */
  contents: ExportableContent[];
  /** Optional custom trigger element */
  trigger?: React.ReactNode;
  /** Optional callback when export completes */
  onExportComplete?: (format: string, contentType: ExportableContentType) => void;
  /** Whether the menu is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * MultiExportMenu component for exporting multiple content types
 * Useful when a lesson has associated quizzes, worksheets, and slides
 */
export function MultiExportMenu({
  contents,
  trigger,
  onExportComplete,
  disabled = false,
  className,
}: MultiExportMenuProps): React.ReactElement {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const contentsByType = contents.reduce((acc, content) => {
    acc[content.type] = content;
    return acc;
  }, {} as Record<ExportableContentType, ExportableContent>);

  const handleExport = async (contentType: ExportableContentType, format: string) => {
    const content = contentsByType[contentType];
    if (!content) return;

    setIsExporting(true);

    try {
      switch (contentType) {
        case 'lesson-plan':
          if (format === 'pdf') {
            downloadLessonPlanPDF(content.data as LessonPlan);
          }
          break;

        case 'quiz':
          const quiz = content.data as Quiz;
          if (format === 'pdf') {
            downloadQuizPDF(quiz);
          } else if (format === 'csv') {
            downloadQuizCSV(quiz);
          } else if (format === 'csv-lms') {
            downloadQuizLMSCSV(quiz);
          }
          break;

        case 'worksheet':
          if (format === 'pdf') {
            downloadWorksheetPDF(content.data as Worksheet);
          }
          break;

        case 'slides':
          if (format === 'pptx') {
            await downloadSlideOutlinePPTX(content.data as SlideOutline);
          }
          break;
      }

      onExportComplete?.(format, contentType);
      
      toast({
        title: 'Export successful',
        description: `Your ${contentType.replace('-', ' ')} has been exported.`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="sm" 
      disabled={disabled || isExporting}
      className={className}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span className="ml-2">Export</span>
    </Button>
  );

  const contentTypeLabels: Record<ExportableContentType, string> = {
    'lesson-plan': 'Lesson Plan',
    'quiz': 'Quiz',
    'worksheet': 'Worksheet',
    'slides': 'Slides',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Export Content</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {Object.entries(contentsByType).map(([type, content]) => {
          const contentType = type as ExportableContentType;
          const options = EXPORT_OPTIONS[contentType];
          
          if (options.length === 1) {
            // Single option - show directly
            return (
              <DropdownMenuItem
                key={type}
                onClick={() => handleExport(contentType, options[0].format)}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                {options[0].icon}
                <span>{contentTypeLabels[contentType]}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {options[0].label}
                </span>
              </DropdownMenuItem>
            );
          }
          
          // Multiple options - show submenu
          return (
            <DropdownMenuSub key={type}>
              <DropdownMenuSubTrigger className="flex items-center gap-2">
                {options[0].icon}
                <span>{contentTypeLabels[contentType]}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {options.map((option) => (
                  <DropdownMenuItem
                    key={option.format}
                    onClick={() => handleExport(contentType, option.format)}
                    disabled={isExporting}
                  >
                    {option.icon}
                    <span className="ml-2">{option.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ExportMenu;
