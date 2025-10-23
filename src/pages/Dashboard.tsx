import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, LogOut, FileText, ClipboardList, FileQuestion, Plus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ContentWizard from "@/components/dashboard/ContentWizard";
import ContentList from "@/components/dashboard/ContentList";
import CalendarWidget from "@/components/calendar/CalendarWidget";
import UpcomingEventsNotification from "@/components/calendar/UpcomingEventsNotification";

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
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">EDUCA SOL</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/classes")}>
              <Users className="h-4 w-4 mr-2" />
              Minhas Turmas
            </Button>
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Painel do Professor</h2>
          <p className="text-muted-foreground">
            Crie conteúdos educacionais com inteligência artificial
          </p>
        </div>

        {/* Upcoming Events Notifications */}
        <div className="mb-8">
          <UpcomingEventsNotification onGenerateContent={handleGenerateFromEvent} />
        </div>

        {/* Grid Layout: Calendar + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Calendar Widget - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <CalendarWidget onGenerateContent={handleGenerateFromEvent} />
          </div>

          {/* Quick Actions - Takes 1 column */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Criar Conteúdo</h3>
            
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleGenerateContent("lesson_plan")}
            >
              <CardHeader className="pb-3">
                <FileText className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Plano de Aula</CardTitle>
                <CardDescription className="text-sm">
                  Crie um plano de aula completo alinhado à BNCC
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleGenerateContent("activity")}
            >
              <CardHeader className="pb-3">
                <ClipboardList className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Atividade</CardTitle>
                <CardDescription className="text-sm">
                  Gere atividades práticas e engajadoras
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleGenerateContent("assessment")}
            >
              <CardHeader className="pb-3">
                <FileQuestion className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Avaliação</CardTitle>
                <CardDescription className="text-sm">
                  Crie provas e avaliações personalizadas
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="lesson_plan">Planos de Aula</TabsTrigger>
            <TabsTrigger value="activity">Atividades</TabsTrigger>
            <TabsTrigger value="assessment">Avaliações</TabsTrigger>
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
