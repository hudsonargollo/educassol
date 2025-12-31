import { useDroppable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface CalendarSlotProps {
  date: Date;
  period?: string;
  isEmpty?: boolean;
  onCreateLesson: (date: Date, period?: string) => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * CalendarSlot component - Represents a time slot on the calendar
 * Requirements: 1.3
 * 
 * - Handles click to open lesson creation workflow (1.3)
 * - Shows "+" button for empty slots (1.3)
 */
export function CalendarSlot({
  date,
  period,
  isEmpty = true,
  onCreateLesson,
  className,
  children,
}: CalendarSlotProps) {
  // Setup drop zone for drag-and-drop
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${date.toISOString()}-${period || 'default'}`,
    data: { date, period },
  });

  const handleClick = () => {
    if (isEmpty) {
      onCreateLesson(date, period);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && isEmpty) {
      e.preventDefault();
      onCreateLesson(date, period);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative min-h-[80px] p-2 rounded-md transition-all duration-200',
        'border border-transparent',
        isEmpty && 'hover:bg-muted/50 hover:border-dashed hover:border-border cursor-pointer',
        isOver && 'bg-primary/10 border-primary border-dashed',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isEmpty ? 'button' : undefined}
      tabIndex={isEmpty ? 0 : undefined}
      aria-label={
        isEmpty
          ? `Criar aula para ${format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}${period ? `, ${period}` : ''}`
          : undefined
      }
    >
      {/* Empty slot indicator (Requirement 1.3) */}
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20"
            onClick={(e) => {
              e.stopPropagation();
              onCreateLesson(date, period);
            }}
            aria-label="Adicionar aula"
          >
            <Plus className="h-4 w-4 text-primary" />
          </Button>
        </div>
      )}

      {/* Slot content (lessons) */}
      {children && (
        <div className="space-y-2">
          {children}
        </div>
      )}

      {/* Drop indicator */}
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded">
            Soltar aqui
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * EmptySlotButton - Standalone button for creating lessons in empty slots
 */
export function EmptySlotButton({
  date,
  period,
  onCreateLesson,
  className,
}: {
  date: Date;
  period?: string;
  onCreateLesson: (date: Date, period?: string) => void;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'w-full h-full min-h-[60px] border-2 border-dashed border-muted-foreground/20',
        'hover:border-primary/50 hover:bg-primary/5',
        'flex flex-col items-center justify-center gap-1',
        'text-muted-foreground hover:text-primary',
        'transition-all duration-200',
        className
      )}
      onClick={() => onCreateLesson(date, period)}
      aria-label={`Criar aula para ${format(date, "d 'de' MMMM", { locale: ptBR })}`}
    >
      <Plus className="h-5 w-5" />
      <span className="text-xs">Adicionar</span>
    </Button>
  );
}

export default CalendarSlot;
