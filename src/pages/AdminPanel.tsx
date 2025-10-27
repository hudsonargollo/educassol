import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sun, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SchoolAdminDashboard from "@/components/admin/SchoolAdminDashboard";

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  createdAt: string;
}

interface SchoolStats {
  totalTeachers: number;
  totalContentGenerated: number;
  activeUsers: number;
  avgContentPerTeacher: number;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([
    {
      id: "1",
      name: "Maria Silva",
      email: "maria@escola.com",
      subject: "Matemática",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "João Santos",
      email: "joao@escola.com",
      subject: "Português",
      createdAt: "2024-02-10",
    },
  ]);
  const [stats, setStats] = useState<SchoolStats>({
    totalTeachers: 2,
    totalContentGenerated: 45,
    activeUsers: 2,
    avgContentPerTeacher: 22.5,
  });

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

  const handleAddTeacher = (email: string, name: string, subject: string) => {
    const newTeacher: Teacher = {
      id: Date.now().toString(),
      name,
      email,
      subject,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setTeachers([...teachers, newTeacher]);
    setStats({
      ...stats,
      totalTeachers: stats.totalTeachers + 1,
    });
  };

  const handleRemoveTeacher = (id: string) => {
    setTeachers(teachers.filter((t) => t.id !== id));
    setStats({
      ...stats,
      totalTeachers: stats.totalTeachers - 1,
    });
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
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              Dashboard
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
        <SchoolAdminDashboard
          schoolName="Escola Municipal de Jequié"
          teachers={teachers}
          stats={stats}
          onAddTeacher={handleAddTeacher}
          onRemoveTeacher={handleRemoveTeacher}
        />
      </main>
    </div>
  );
};

export default AdminPanel;

