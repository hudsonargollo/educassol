import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ClipboardList, FileQuestion, BookOpen, BarChart3, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ContentWizard from "@/components/dashboard/ContentWizard";
import ContentList from "@/components/dashboard/ContentList";
import CalendarWidget from "@/components/calendar/CalendarWidget";
import UpcomingEventsNotification from "@/components/calendar/UpcomingEventsNotification";
import Header from "@/components/Header";
import { FeatureCard, WelcomeBanner } from "@/components/dashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<string>("");
  const [prefilledTopic, setPrefilledTopic] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleGenerateContent = (type: string, topic?: string) => {
    setSelectedContentType(type);
    setPrefilledTopic(topic || "");
    setGenerateDialogOpen(true);
  };

  const handleGenerateFromEvent = (event: any) => {
    handleGenerateContent("lesson_plan", event.titulo);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with theme support */}
      <Header 
        user={user} 
        onSignOut={handleSignOut} 
        showNav={true} 
      />

      {/* Main Content - Add padding-top to account for fixed header */}
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Welcome Banner with AI Exam Generator */}
        <div className="mb-8">
          <WelcomeBanner 
            userName={user?.user_metadata?.name || user?.email?.split('@')[0]}
            onGenerateExam={() => handleGenerateContent("assessment")}
          />
        </div>

        {/* Upcoming Events Notifications */}
        <div className="mb-8">
          <UpcomingEventsNotification onGenerateContent={handleGenerateFromEvent} />
        </div>

        {/* Feature Cards Grid - Responsive layout */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Criar Conteúdo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={<FileText className="h-5 w-5" />}
              title="Plano de Aula"
              description="Crie um plano de aula completo alinhado à BNCC"
              onClick={() => handleGenerateContent("lesson_plan")}
              gradient="purple"
            />
            <FeatureCard
              icon={<ClipboardList className="h-5 w-5" />}
              title="Atividade"
              description="Gere atividades práticas e engajadoras"
              onClick={() => handleGenerateContent("activity")}
              gradient="blue"
            />
            <FeatureCard
              icon={<FileQuestion className="h-5 w-5" />}
              title="Avaliação"
              description="Crie provas e avaliações personalizadas"
              onClick={() => handleGenerateContent("assessment")}
              gradient="amber"
            />
          </div>
        </div>

        {/* Grid Layout: Calendar + Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Calendar Widget - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <CalendarWidget onGenerateContent={handleGenerateFromEvent} />
          </div>

          {/* Quick Stats - Takes 1 column */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Acesso Rápido</h3>
            <FeatureCard
              icon={<BookOpen className="h-5 w-5" />}
              title="Minhas Turmas"
              description="Gerencie suas turmas e alunos"
              href="/classes"
              gradient="green"
            />
            <FeatureCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Avaliações"
              description="Acesse o sistema de correção automática"
              href="/assessments"
              gradient="purple"
            />
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title="Administração"
              description="Painel administrativo da escola"
              href="/admin"
              gradient="blue"
            />
          </div>
        </div>

        {/* Content Tabs with ExamAI styling */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-card border border-border">
            <TabsTrigger 
              value="all"
              className="data-[state=active]:bg-examai-purple-500 data-[state=active]:text-white"
            >
              Todos
            </TabsTrigger>
            <TabsTrigger 
              value="lesson_plan"
              className="data-[state=active]:bg-examai-purple-500 data-[state=active]:text-white"
            >
              Planos de Aula
            </TabsTrigger>
            <TabsTrigger 
              value="activity"
              className="data-[state=active]:bg-examai-purple-500 data-[state=active]:text-white"
            >
              Atividades
            </TabsTrigger>
            <TabsTrigger 
              value="assessment"
              className="data-[state=active]:bg-examai-purple-500 data-[state=active]:text-white"
            >
              Avaliações
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <ContentList type="all" />
          </TabsContent>
          <TabsContent value="lesson_plan">
            <ContentList type="lesson_plan" />
          </TabsContent>
          <TabsContent value="activity">
            <ContentList type="activity" />
          </TabsContent>
          <TabsContent value="assessment">
            <ContentList type="assessment" />
          </TabsContent>
        </Tabs>
      </main>

      {/* Generate Content Dialog */}
      <ContentWizard
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        contentType={selectedContentType}
        prefilledTopic={prefilledTopic}
      />
    </div>
  );
};

export default Dashboard;
