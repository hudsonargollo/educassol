import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ClassDialog from "@/components/classes/ClassDialog";
import ClassCard from "@/components/classes/ClassCard";
import Header from "@/components/Header";

interface Class {
  id: string;
  subject: string;
  grade: string;
  total_alunos: number | null;
  possui_ane: boolean;
  detalhes_ane: string | null;
}

const Classes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        loadClasses();
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

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClasses(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar turmas",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("classes").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Turma excluída",
        description: "A turma foi removida com sucesso.",
      });

      loadClasses();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir turma",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = (shouldRefresh: boolean) => {
    setDialogOpen(false);
    setEditingClass(null);
    if (shouldRefresh) {
      loadClasses();
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
    <div className="min-h-screen bg-background">
      {/* Header with theme support */}
      <Header 
        user={user} 
        onSignOut={handleSignOut} 
        showNav={true} 
      />

      {/* Main Content - Add padding-top to account for fixed header */}
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Minhas Turmas</h2>
            <p className="text-muted-foreground">
              Gerencie suas turmas e personalize o conteúdo gerado pela IA
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Nova Turma
          </Button>
        </div>

        {classes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Nenhuma turma cadastrada
              </CardTitle>
              <CardDescription>
                Comece criando sua primeira turma para gerar conteúdos mais personalizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Turma
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((classItem) => (
              <ClassCard
                key={classItem.id}
                classItem={classItem}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Class Dialog */}
      <ClassDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        editingClass={editingClass}
      />
    </div>
  );
};

export default Classes;
