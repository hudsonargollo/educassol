import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, isBefore, isAfter, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CalendarEvent {
  id: string;
  data: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  relevancia_pedagogica: string | null;
}

interface UpcomingEventsNotificationProps {
  onGenerateContent?: (event: CalendarEvent) => void;
}

const UpcomingEventsNotification = ({ onGenerateContent }: UpcomingEventsNotificationProps) => {
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [dismissedEvents, setDismissedEvents] = useState<string[]>([]);

  useEffect(() => {
    loadUpcomingEvents();
    
    // Load dismissed events from localStorage
    const dismissed = localStorage.getItem("dismissedCalendarEvents");
    if (dismissed) {
      setDismissedEvents(JSON.parse(dismissed));
    }
  }, []);

  const loadUpcomingEvents = async () => {
    try {
      const today = startOfDay(new Date());
      const threeDaysFromNow = addDays(today, 3);

      const { data, error } = await supabase
        .from("calendario")
        .select("*")
        .gte("data", format(today, "yyyy-MM-dd"))
        .lte("data", format(threeDaysFromNow, "yyyy-MM-dd"))
        .order("data");

      if (error) throw error;
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error("Error loading upcoming events:", error);
    }
  };

  const handleDismiss = (eventId: string) => {
    const newDismissed = [...dismissedEvents, eventId];
    setDismissedEvents(newDismissed);
    localStorage.setItem("dismissedCalendarEvents", JSON.stringify(newDismissed));
  };

  const visibleEvents = upcomingEvents.filter(
    (event) => !dismissedEvents.includes(event.id)
  );

  if (visibleEvents.length === 0) return null;

  return (
    <div className="space-y-3">
      {visibleEvents.map((event) => {
        const eventDate = new Date(event.data);
        const daysUntil = Math.ceil(
          (eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        return (
          <Alert key={event.id} className="bg-primary/5 border-primary/20">
            <Calendar className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <AlertTitle className="flex items-center justify-between">
                <span>
                  {event.titulo} {daysUntil === 0 ? "é hoje!" : `em ${daysUntil} ${daysUntil === 1 ? "dia" : "dias"}`}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleDismiss(event.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertTitle>
              <AlertDescription className="space-y-2">
                <p className="text-sm">
                  {format(eventDate, "dd 'de' MMMM", { locale: ptBR })} - {event.descricao}
                </p>
                {event.relevancia_pedagogica && (
                  <p className="text-xs text-muted-foreground italic">
                    💡 {event.relevancia_pedagogica}
                  </p>
                )}
                {onGenerateContent && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onGenerateContent(event)}
                    className="mt-2"
                  >
                    <FileText className="h-3 w-3 mr-2" />
                    Gerar Atividade para esta Data
                  </Button>
                )}
              </AlertDescription>
            </div>
          </Alert>
        );
      })}
    </div>
  );
};

export default UpcomingEventsNotification;
