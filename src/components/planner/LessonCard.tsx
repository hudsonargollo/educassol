import { useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, GripVertical, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import type { LessonStatus } from '@/lib/instructional/lesson-plan';

export interface LessonCardData {
  id: string;
  topic: string;
  standards: string[];
  status: LessonStatus;
  duration?: number;
  date: Date;
}

export interface LessonCardProps {
  lesson: LessonCardData;
  onClick?: (lesson: LessonCardData) => void;
  isDraggable?: boolean;
  className?: string;
}

/**
 * Status icon component for visual distinction (Requirement 1.6)
 */
function StatusIcon({ status }: { status: LessonStatus }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case 'in-progress':
      return <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />;
    case 'planned':
      return <Circle className="h-4 w-4 text-slate-400" />;
    case 'draft':
    default:
      return <Circle className="h-4 w-4 text-slate-300" strokeDasharray="4 2" />;
  }
}

/**
 * Get status-specific styling classes (Requirement 1.6)
 */
function getStatusStyles(status: LessonStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 hover:border-emerald-500';
    case 'in-progress':
      return 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 hover:border-amber-500';
    case 'planned':
      return 'bg-slate-100 dark:bg-slate-800 border-slate-300 hover:border-slate-400';
    case 'draft':
    default:
      return 'bg-slate-50 dark:bg-slate-900 border-slate-200 border-dashed hover:border-slate-300';
  }
}

/**
 * Get status label in Portuguese
 */
function getStatusLabel(status: LessonStatus): string {
  switch (status) {
    case 'completed':
      return 'Concluída';
    case 'in-progress':
      return 'Em andamento';
    case 'planned':
      return 'Planejada';
    case 'draft':
    default:
      return 'Rascunho';
  }
}

/**
 * LessonCard component - Displays lesson information on calendar
 * Requirements: 1.2, 1.4, 1.6
 * 
 * - Displays topic, standards, status with visual distinction (1.2, 1.6)
 * - Supports drag-and-drop for rescheduling (1.4)
 */
export function LessonCard({
  lesson,
  onClick,
  isDraggable = true,
  className,
}: LessonCardProps) {
  // Setup drag-and-drop (Requirement 1.4)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lesson.id,
    data: lesson,
    disabled: !isDraggable,
  });

  const style = useMemo(
    () => ({
      transform: CSS.Translate.toString(transform),
      opacity: isDragging ? 0.5 : 1,
    }),
    [transform, isDragging]
  );

  const statusStyles = getStatusStyles(lesson.status);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-pointer transition-all duration-200',
        'border-l-4',
        statusStyles,
        isDragging && 'shadow-lg ring-2 ring-primary/20',
        className
      )}
      onClick={() => onClick?.(lesson)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(lesson);
        }
      }}
      aria-label={`Aula: ${lesson.topic}. Status: ${getStatusLabel(lesson.status)}`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          {/* Drag handle (Requirement 1.4) */}
          {isDraggable && (
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Arrastar para reagendar"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}

          <div className="flex-1 min-w-0">
            {/* Topic and status (Requirement 1.2) */}
            <div className="flex items-center gap-2 mb-1">
              <StatusIcon status={lesson.status} />
              <h4 className="font-medium text-sm truncate flex-1" title={lesson.topic}>
                {lesson.topic}
              </h4>
            </div>

            {/* Standards (Requirement 1.2) */}
            {lesson.standards.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {lesson.standards.slice(0, 2).map((standard) => (
                  <Badge
                    key={standard}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {standard}
                  </Badge>
                ))}
                {lesson.standards.length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0"
                  >
                    +{lesson.standards.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Duration */}
            {lesson.duration && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{lesson.duration} min</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default LessonCard;
