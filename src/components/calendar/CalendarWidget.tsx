import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface CalendarEvent {
  id: string;
  data: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  relevancia_pedagogica: string | null;
}

interface CalendarWidgetProps {
  onGenerateContent?: (event: CalendarEvent) => void;
}

const CalendarWidget = ({ onGenerateContent }: CalendarWidgetProps) => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from("calendario")
        .select("*")
        .gte("data", format(start, "yyyy-MM-dd"))
        .lte("data", format(end, "yyyy-MM-dd"))
        .order("data");

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar eventos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => 
      isSameDay(new Date(event.data), day)
    );
  };

  const getEventTypeColor = (tipo: string) => {
    const colors = {
      feriado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      comemorativo: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      cultural: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      pedagogico: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return colors[tipo as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleGenerateContent = () => {
    if (selectedEvent && onGenerateContent) {
      onGenerateContent(selectedEvent);
      setDialogOpen(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Calendário Pedagógico
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[150px] text-center">
                {format(currentDate, "MMMM yyyy", { locale: ptBR })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* Week days header */}
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {daysInMonth.map((day) => {
              const dayEvents = getEventsForDay(day);
              const hasEvents = dayEvents.length > 0;
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toString()}
                  className={`
                    min-h-[60px] p-1 border rounded-md relative cursor-pointer transition-colors
                    ${!isSameMonth(day, currentDate) ? "opacity-30" : ""}
                    ${isToday ? "bg-primary/5 border-primary" : "hover:bg-muted"}
                    ${hasEvents ? "border-primary/30" : ""}
                  `}
                  onClick={() => {
                    if (dayEvents.length === 1) {
                      handleEventClick(dayEvents[0]);
                    } else if (dayEvents.length > 1) {
                      // For multiple events, show the first one
                      handleEventClick(dayEvents[0]);
                    }
                  }}
                >
                  <div className="text-xs font-medium text-center">
                    {format(day, "d")}
                  </div>
                  {hasEvents && (
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="text-[10px] truncate bg-primary/10 px-1 rounded"
                          title={event.titulo}
                        >
                          {event.titulo}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] text-muted-foreground text-center">
                          +{dayEvents.length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              Feriado
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Comemorativo
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Cultural
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Pedagógico
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedEvent?.titulo}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent && format(new Date(selectedEvent.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <Badge className={getEventTypeColor(selectedEvent.tipo)}>
                {selectedEvent.tipo}
              </Badge>

              {selectedEvent.descricao && (
                <div>
                  <h4 className="font-medium mb-2">Descrição:</h4>
                  <p className="text-sm text-muted-foreground">{selectedEvent.descricao}</p>
                </div>
              )}

              {selectedEvent.relevancia_pedagogica && (
                <div>
                  <h4 className="font-medium mb-2">Relevância Pedagógica:</h4>
                  <p className="text-sm text-muted-foreground">{selectedEvent.relevancia_pedagogica}</p>
                </div>
              )}

              {onGenerateContent && (
                <Button onClick={handleGenerateContent} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Conteúdo para este Evento
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CalendarWidget;
