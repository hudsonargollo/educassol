import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, BarChart3, Plus, Trash2, Edit2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface SchoolAdminDashboardProps {
  schoolName?: string;
  teachers?: Teacher[];
  stats?: SchoolStats;
  onAddTeacher?: (email: string, name: string, subject: string) => void;
  onRemoveTeacher?: (id: string) => void;
}

export const SchoolAdminDashboard = ({
  schoolName = "Minha Escola",
  teachers = [],
  stats = {
    totalTeachers: 0,
    totalContentGenerated: 0,
    activeUsers: 0,
    avgContentPerTeacher: 0,
  },
  onAddTeacher,
  onRemoveTeacher,
}: SchoolAdminDashboardProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ email: "", name: "", subject: "" });

  const handleAddTeacher = () => {
    if (!formData.email.trim() || !formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Email e nome são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    onAddTeacher?.(formData.email, formData.name, formData.subject);
    toast({
      title: "Sucesso",
      description: "Professor adicionado com sucesso",
    });
    setFormData({ email: "", name: "", subject: "" });
    setIsOpen(false);
  };

  const handleRemoveTeacher = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este professor?")) {
      onRemoveTeacher?.(id);
      toast({
        title: "Sucesso",
        description: "Professor removido com sucesso",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{schoolName}</h1>
          <p className="text-muted-foreground">Painel de Administração Escolar</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Professores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conteúdo Gerado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContentGenerated}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Média por Professor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgContentPerTeacher.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="teachers" className="w-full">
        <TabsList>
          <TabsTrigger value="teachers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Professores
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Análises
          </TabsTrigger>
        </TabsList>

        {/* Teachers Tab */}
        <TabsContent value="teachers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Gerenciar Professores</h2>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Professor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Professor</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do professor para criar uma conta
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Maria Silva"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Ex: maria@escola.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Disciplina (opcional)</Label>
                    <Input
                      id="subject"
                      placeholder="Ex: Matemática"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddTeacher} className="flex-1">
                      Adicionar
                    </Button>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {teachers.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhum professor adicionado ainda. Comece adicionando professores!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {teachers.map((teacher) => (
                <Card key={teacher.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{teacher.name}</p>
                        <p className="text-sm text-muted-foreground">{teacher.email}</p>
                        {teacher.subject && (
                          <p className="text-sm text-muted-foreground">
                            Disciplina: {teacher.subject}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveTeacher(teacher.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Crescimento de Conteúdo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Conteúdo gerado este mês
                    </p>
                    <p className="text-3xl font-bold">
                      {Math.floor(stats.totalContentGenerated * 0.3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Crescimento em relação ao mês anterior
                    </p>
                    <p className="text-2xl font-bold text-green-600">+15%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disciplinas Mais Usadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Matemática</span>
                    <span className="font-semibold">35%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Língua Portuguesa</span>
                    <span className="font-semibold">28%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ciências</span>
                    <span className="font-semibold">22%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Outras</span>
                    <span className="font-semibold">15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchoolAdminDashboard;

