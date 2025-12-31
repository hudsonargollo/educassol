/**
 * Planner components barrel export
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.5, 4.2, 4.5, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 7.1, 7.4, 9.2, 9.3, 11.1, 11.2, 11.3
 */

export { CalendarView } from './CalendarView';
export type { CalendarEvent, CalendarViewProps } from './CalendarView';

export { LessonCard } from './LessonCard';
export type { LessonCardData, LessonCardProps } from './LessonCard';

export { CalendarSlot, EmptySlotButton } from './CalendarSlot';
export type { CalendarSlotProps } from './CalendarSlot';

export { UnitPlanWizard } from './UnitPlanWizard';
export type { UnitPlanWizardProps } from './UnitPlanWizard';

export { StandardsSelector } from './StandardsSelector';
export type { Standard, StandardsSelectorProps } from './StandardsSelector';

// Activity Generator UI Components (Task 8)
export { ActivityGeneratorModal } from './ActivityGeneratorModal';
export type {
  ActivityGeneratorModalProps,
  ActivityType,
  QuizOptions,
  WorksheetOptions,
  ReadingOptions,
  SlidesOptions,
} from './ActivityGeneratorModal';

export { StreamingContent, StreamingJSON, LoadingSparkle } from './StreamingContent';
export type {
  StreamingContentProps,
  StreamingJSONProps,
  LoadingSparkleProps,
} from './StreamingContent';

export { QuizPreview } from './QuizPreview';
export type { QuizPreviewProps } from './QuizPreview';

export { WorksheetPreview } from './WorksheetPreview';
export type { WorksheetPreviewProps } from './WorksheetPreview';

export { LeveledReadingPreview } from './LeveledReadingPreview';
export type { LeveledReadingPreviewProps } from './LeveledReadingPreview';

export { SlideOutlinePreview } from './SlideOutlinePreview';
export type { SlideOutlinePreviewProps } from './SlideOutlinePreview';

// Differentiation Engine Components (Task 9)
export { DifferentiationPanel, useDifferentiation } from './DifferentiationPanel';
export type {
  DifferentiationPanelProps,
  DifferentiationType,
  DifferentiableContent,
  DifferentiatedResult,
} from './DifferentiationPanel';

// Content Refinement Components (Task 10)
export { 
  RefinementToolbar, 
  useRefinementToolbar, 
  useRefinementHistory 
} from './RefinementToolbar';
export type {
  RefinementToolbarProps,
  RefinementAction,
  RefinementHistoryItem,
  UseRefinementToolbarOptions,
  UseRefinementToolbarReturn,
  UseRefinementHistoryOptions,
  UseRefinementHistoryReturn,
} from './RefinementToolbar';

// Export Components (Task 12)
export { ExportMenu, MultiExportMenu } from './ExportMenu';
export type {
  ExportMenuProps,
  MultiExportMenuProps,
  ExportableContentType,
  ExportableContent,
} from './ExportMenu';

// Version History Components (Task 13)
export { VersionHistory, useVersionHistory } from './VersionHistory';
export type {
  VersionHistoryProps,
  LessonPlanVersion,
  UseVersionHistoryOptions,
  UseVersionHistoryReturn,
} from './VersionHistory';

// Search Components (Task 13)
export { LessonPlanSearch } from './LessonPlanSearch';
export type {
  LessonPlanSearchProps,
  SearchResult,
  SearchFilters,
} from './LessonPlanSearch';

// Archived Lessons Components (Task 13)
export { ArchivedLessonsPanel, ShowArchivedToggle } from './ArchivedLessonsPanel';
export type {
  ArchivedLessonsPanelProps,
  ArchivedLesson,
  ShowArchivedToggleProps,
} from './ArchivedLessonsPanel';
