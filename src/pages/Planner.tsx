import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { CalendarView, CalendarEvent } from '@/components/planner/CalendarView';
import { LessonCard, LessonCardData } from '@/components/planner/LessonCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  BookOpen,
  FileText,
  ClipboardList,
  Presentation,
  Calendar as CalendarIcon,
  Target,
  Search,
} from 'lucide-react';
import type { SlotInfo } from 'react-big-calendar';
import { LessonPlanSearch, SearchResult } from '@/components/planner/LessonPlanSearch';
import { ArchivedLessonsPanel } from '@/components/planner/ArchivedLessonsPanel';

// Type for lesson plan from database (until Supabase types are regenerated)
interface LessonPlanRow {
  id: string;
  unit_id?: string;
  user_id: string;
  date: string;
  topic: string;
  grade_level: string;
  subject: string;
  duration: number;
  standards: string[];
  learning_objective: string;
  key_vocabulary: unknown;
  materials_needed: string[];
  phases: unknown;
  formative_assessment: unknown;
  status: 'draft' | 'planned' | 'in-progress' | 'completed';
  version: number;
  created_at: string;
  updated_at: string;
  archived_at?: string;
}

/**
 * LessonPlanner page - Main calendar dashboard for lesson planning
 * Requirements: 1.1
 * 
 * - Integrates CalendarView as main content (1.1)
 * - Adds sidebar for quick actions and unit context (1.1)
 */
const Planner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [activeUnit, setActiveUnit] = useState<any>(null);
  
  // Drag and drop state
  const [activeDragItem, setActiveDragItem] = useState<LessonCardData | null>(null);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [pendingReschedule, setPendingReschedule] = useState<{
    event: CalendarEvent;
    newStart: Date;
    newEnd: Date;
  } | null>(null);

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        loadLessonPlans(session.user.id);
      } else {
        navigate('/auth');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Load lesson plans from database
  const loadLessonPlans = async (userId: string) => {
    try {
      // Use explicit typing since Supabase types haven't been regenerated yet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('lesson_plans')
        .select('*')
        .eq('user_id', userId)
        .is('archived_at', null)
        .order('date', { ascending: true });

      if (error) {
        // If table doesn't exist yet, just show empty calendar
        if (error.code === '42P01') {
          console.log('lesson_plans table not yet created');
          setEvents([]);
          return;
        }
        throw error;
      }

      // Transform to calendar events
      const calendarEvents: CalendarEvent[] = ((data as LessonPlanRow[]) || []).map((plan) => ({
        id: plan.id,
        title: plan.topic,
        start: new Date(plan.date),
        end: new Date(new Date(plan.date).getTime() + (plan.duration || 50) * 60000),
        status: plan.status,
        standards: plan.standards || [],
        lessonPlanId: plan.id,
      }));

      setEvents(calendarEvents);
    } catch (error: any) {
      // Don't show error for missing table
      if (error.code !== '42P01') {
        toast({
          title: 'Erro ao carregar aulas',
          description: error.message,
          variant: 'destructive',
        });
      }
      setEvents([]);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Handle slot selection (Requirement 1.3)
  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setSelectedSlot({ start: slotInfo.start, end: slotInfo.end });
    setCreateDialogOpen(true);
  }, []);

  // Handle event selection
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    // Navigate to lesson detail or open edit dialog
    toast({
      title: 'Aula selecionada',
      description: `${event.title}`,
    });
  }, [toast]);

  // Handle search result selection (Requirement 13.4)
  const handleSearchSelect = useCallback((result: SearchResult) => {
    toast({
      title: 'Aula encontrada',
      description: result.topic,
    });
    // TODO: Navigate to lesson detail or scroll to date in calendar
  }, [toast]);

  // Handle lesson restore from archive (Requirement 13.5)
  const handleLessonRestore = useCallback((lessonId: string) => {
    // Reload lesson plans to show restored lesson
    if (user) {
      loadLessonPlans(user.id);
    }
  }, [user]);

  // Handle event drop (Requirement 1.4)
  const handleEventDrop = useCallback(
    (event: CalendarEvent, newStart: Date, newEnd: Date) => {
      setPendingReschedule({ event, newStart, newEnd });
      setRescheduleDialogOpen(true);
    },
    []
  );

  // Confirm reschedule
  const confirmReschedule = async () => {
    if (!pendingReschedule) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('lesson_plans')
        .update({
          date: pendingReschedule.newStart.toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', pendingReschedule.event.id);

      if (error) throw error;

      // Update local state
      setEvents((prev) =>
        prev.map((e) =>
          e.id === pendingReschedule.event.id
            ? { ...e, start: pendingReschedule.newStart, end: pendingReschedule.newEnd }
            : e
        )
      );

      toast({
        title: 'Aula reagendada',
        description: 'A aula foi movida para a nova data.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao reagendar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setRescheduleDialogOpen(false);
      setPendingReschedule(null);
    }
  };

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const lesson = event.active.data.current as LessonCardData;
    setActiveDragItem(lesson);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
    
    if (event.over) {
      const dropData = event.over.data.current as { date: Date; period?: string };
      const draggedLesson = event.active.data.current as LessonCardData;
      
      if (dropData?.date && draggedLesson) {
        const calendarEvent = events.find((e) => e.id === draggedLesson.id);
        if (calendarEvent) {
          const duration = calendarEvent.end.getTime() - calendarEvent.start.getTime();
          handleEventDrop(
            calendarEvent,
            dropData.date,
            new Date(dropData.date.getTime() + duration)
          );
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background">
        <Header user={user} onSignOut={handleSignOut} showNav={true} />

        <main className="container mx-auto px-4 py-8 pt-24">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-primary" />
                Planejador de Aulas
              </h1>
              <p className="text-muted-foreground mt-1">
                Organize suas aulas e crie conteúdo com IA
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Search Bar - Requirement 13.4 */}
              <LessonPlanSearch
                onSelect={handleSearchSelect}
                placeholder="Buscar aulas..."
                className="w-64"
              />
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-gradient-to-r from-examai-purple-500 to-violet-500 hover:from-examai-purple-400 hover:to-violet-400"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Unidade
              </Button>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Calendar - Main Content (3 columns) */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-4">
                  <CalendarView
                    events={events}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    onEventDrop={handleEventDrop}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Quick Actions & Unit Context (1 column) */}
            <div className="space-y-4">
              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Aula
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => toast({ title: 'Em breve', description: 'Funcionalidade em desenvolvimento' })}
                  >
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Gerar Quiz
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => toast({ title: 'Em breve', description: 'Funcionalidade em desenvolvimento' })}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar Atividade
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => toast({ title: 'Em breve', description: 'Funcionalidade em desenvolvimento' })}
                  >
                    <Presentation className="h-4 w-4 mr-2" />
                    Gerar Slides
                  </Button>
                </CardContent>
              </Card>

              {/* Active Unit Context */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Unidade Ativa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeUnit ? (
                    <div className="space-y-3">
                      <h4 className="font-medium">{activeUnit.title}</h4>
                      <div className="text-sm text-muted-foreground">
                        <p>Dia {activeUnit.currentDay} de {activeUnit.totalDays}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {activeUnit.standards?.map((std: string) => (
                          <Badge key={std} variant="secondary" className="text-xs">
                            {std}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Nenhuma unidade ativa
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCreateDialogOpen(true)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Criar Unidade
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Legend */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Legenda</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-slate-300 border-l-2 border-slate-400" />
                    <span className="text-muted-foreground">Planejada</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-amber-200 border-l-2 border-amber-400" />
                    <span className="text-muted-foreground">Em andamento</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-emerald-200 border-l-2 border-emerald-400" />
                    <span className="text-muted-foreground">Concluída</span>
                  </div>
                </CardContent>
              </Card>

              {/* Archived Lessons - Requirement 13.5 */}
              <ArchivedLessonsPanel
                onRestore={handleLessonRestore}
                className="w-full"
              />
            </div>
          </div>
        </main>

        {/* Create Lesson Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Aula</DialogTitle>
              <DialogDescription>
                {selectedSlot
                  ? `Criar aula para ${selectedSlot.start.toLocaleDateString('pt-BR')}`
                  : 'Selecione as opções para criar uma nova aula'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                O assistente de criação de aulas estará disponível em breve.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setCreateDialogOpen(false);
                toast({ title: 'Em breve', description: 'Funcionalidade em desenvolvimento' });
              }}>
                Criar com IA
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reschedule Confirmation Dialog (Requirement 1.4) */}
        <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reagendar Aula</DialogTitle>
              <DialogDescription>
                Deseja mover esta aula para a nova data? Referências dependentes de data podem precisar ser atualizadas.
              </DialogDescription>
            </DialogHeader>
            {pendingReschedule && (
              <div className="py-4">
                <p className="text-sm">
                  <strong>{pendingReschedule.event.title}</strong>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Nova data: {pendingReschedule.newStart.toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRescheduleDialogOpen(false);
                  setPendingReschedule(null);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={confirmReschedule}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeDragItem && (
            <LessonCard
              lesson={activeDragItem}
              isDraggable={false}
              className="shadow-xl"
            />
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default Planner;
