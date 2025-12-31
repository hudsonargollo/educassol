import { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configure date-fns localizer for react-big-calendar
const locales = { 'pt-BR': ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

// Storage key for view preference persistence (Requirement 1.7)
const VIEW_PREFERENCE_KEY = 'planner-calendar-view';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: 'draft' | 'planned' | 'in-progress' | 'completed';
  standards: string[];
  lessonPlanId?: string;
}

export interface CalendarViewProps {
  events: CalendarEvent[];
  onSelectSlot?: (slotInfo: SlotInfo) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent, start: Date, end: Date) => void;
  className?: string;
}

/**
 * CalendarView component - Main calendar dashboard for lesson planning
 * Requirements: 1.1, 1.5, 1.7
 * 
 * - Displays weekly calendar view (Monday-Friday) as default (1.1)
 * - Supports switching between weekly and monthly views (1.5)
 * - Persists calendar view preferences in localStorage (1.7)
 */
export function CalendarView({
  events,
  onSelectSlot,
  onSelectEvent,
  onEventDrop,
  className,
}: CalendarViewProps) {
  // Load saved view preference from localStorage (Requirement 1.7)
  const [view, setView] = useState<View>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(VIEW_PREFERENCE_KEY);
      if (saved === 'week' || saved === 'month') {
        return saved;
      }
    }
    return 'week'; // Default to weekly view (Requirement 1.1)
  });

  const [date, setDate] = useState(new Date());

  // Persist view preference to localStorage (Requirement 1.7)
  useEffect(() => {
    localStorage.setItem(VIEW_PREFERENCE_KEY, view);
  }, [view]);

  // Handle view change (Requirement 1.5)
  const handleViewChange = useCallback((newView: View) => {
    if (newView === 'week' || newView === 'month') {
      setView(newView);
    }
  }, []);

  // Handle navigation
  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  // Handle slot selection (clicking empty slot)
  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      onSelectSlot?.(slotInfo);
    },
    [onSelectSlot]
  );

  // Handle event selection
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      onSelectEvent?.(event);
    },
    [onSelectEvent]
  );

  // Handle event drag and drop (Requirement 1.4)
  const handleEventDrop = useCallback(
    ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
      onEventDrop?.(event, start, end);
    },
    [onEventDrop]
  );

  // Custom event styling based on status (Requirement 1.6)
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const baseStyle = {
      borderRadius: '4px',
      opacity: 0.9,
      border: '0px',
      display: 'block',
    };

    switch (event.status) {
      case 'draft':
        return {
          style: {
            ...baseStyle,
            backgroundColor: 'hsl(var(--muted) / 0.5)',
            color: 'hsl(var(--muted-foreground))',
            borderLeft: '3px dashed hsl(var(--border))',
          },
        };
      case 'planned':
        return {
          style: {
            ...baseStyle,
            backgroundColor: 'hsl(var(--muted))',
            color: 'hsl(var(--muted-foreground))',
            borderLeft: '3px solid hsl(var(--border))',
          },
        };
      case 'in-progress':
        return {
          style: {
            ...baseStyle,
            backgroundColor: 'hsl(45 93% 47% / 0.2)',
            color: 'hsl(45 93% 30%)',
            borderLeft: '3px solid hsl(45 93% 47%)',
          },
        };
      case 'completed':
        return {
          style: {
            ...baseStyle,
            backgroundColor: 'hsl(142 76% 36% / 0.2)',
            color: 'hsl(142 76% 25%)',
            borderLeft: '3px solid hsl(142 76% 36%)',
          },
        };
      default:
        return { style: baseStyle };
    }
  }, []);

  // Custom toolbar component
  const CustomToolbar = useMemo(
    () =>
      function Toolbar({ label }: { label: string }) {
        return (
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newDate = new Date(date);
                  if (view === 'week') {
                    newDate.setDate(newDate.getDate() - 7);
                  } else {
                    newDate.setMonth(newDate.getMonth() - 1);
                  }
                  setDate(newDate);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newDate = new Date(date);
                  if (view === 'week') {
                    newDate.setDate(newDate.getDate() + 7);
                  } else {
                    newDate.setMonth(newDate.getMonth() + 1);
                  }
                  setDate(newDate);
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold ml-2">{label}</h2>
            </div>

            {/* View toggle (Requirement 1.5) */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={view === 'week' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('week')}
                className="text-xs"
              >
                Semana
              </Button>
              <Button
                variant={view === 'month' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('month')}
                className="text-xs"
              >
                Mês
              </Button>
            </div>
          </div>
        );
      },
    [date, view, handleViewChange]
  );

  // Messages in Portuguese
  const messages = useMemo(
    () => ({
      today: 'Hoje',
      previous: 'Anterior',
      next: 'Próximo',
      month: 'Mês',
      week: 'Semana',
      day: 'Dia',
      agenda: 'Agenda',
      date: 'Data',
      time: 'Hora',
      event: 'Evento',
      noEventsInRange: 'Não há aulas neste período.',
      showMore: (total: number) => `+${total} mais`,
    }),
    []
  );

  return (
    <div className={cn('h-[600px] bg-background rounded-lg', className)}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={handleViewChange}
        date={date}
        onNavigate={handleNavigate}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        eventPropGetter={eventStyleGetter}
        components={{
          toolbar: CustomToolbar,
        }}
        messages={messages}
        culture="pt-BR"
        min={new Date(0, 0, 0, 7, 0, 0)} // Start at 7 AM
        max={new Date(0, 0, 0, 18, 0, 0)} // End at 6 PM
        step={30}
        timeslots={2}
      />
    </div>
  );
}

export default CalendarView;
