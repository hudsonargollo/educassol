import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, LogOut, Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExamCreator from "@/components/assessment/ExamCreator";
import ExamList from "@/components/assessment/ExamList";
import FileUploader from "@/components/assessment/FileUploader";
import SubmissionList from "@/components/assessment/SubmissionList";
import ResultViewer from "@/components/assessment/ResultViewer";
import type { SubmissionWithResult } from "@/components/assessment/SubmissionList";

const Assessments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadExam, setUploadExam] = useState<{ id: string; title: string } | null>(null);
  
  // Submission list state
  const [selectedExam, setSelectedExam] = useState<{ id: string; title: string } | null>(null);
  
  // Result viewer state
  const [resultViewerOpen, setResultViewerOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithResult | null>(null);

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

  const handleCreateNew = () => {
    setEditingExam(null);
    setCreateDialogOpen(true);
  };

  const handleEdit = (exam: any) => {
    setEditingExam(exam);
    setCreateDialogOpen(true);
  };

  const handleUpload = (examId: string, examTitle: string) => {
    setUploadExam({ id: examId, title: examTitle });
    setUploadDialogOpen(true);
  };

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleViewSubmissions = (examId: string, examTitle: string) => {
    setSelectedExam({ id: examId, title: examTitle });
  };

  const handleCloseSubmissions = () => {
    setSelectedExam(null);
  };

  const handleViewResult = (submission: SubmissionWithResult) => {
    setSelectedSubmission(submission);
    setResultViewerOpen(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setCreateDialogOpen(false);
    setEditingExam(null);
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
              <ArrowLeft className="h-4 w-4 mr-2" />
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Avaliações Automatizadas</h2>
            <p className="text-muted-foreground">
              Crie provas e corrija automaticamente com inteligência artificial
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Prova
          </Button>
        </div>

        {/* Show Submission List if exam is selected */}
        {selectedExam ? (
          <SubmissionList
            examId={selectedExam.id}
            examTitle={selectedExam.title}
            onViewResult={handleViewResult}
            onClose={handleCloseSubmissions}
            refreshTrigger={refreshTrigger}
          />
        ) : (
          /* Exam Tabs */
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="draft">Rascunhos</TabsTrigger>
              <TabsTrigger value="published">Publicadas</TabsTrigger>
              <TabsTrigger value="archived">Arquivadas</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <ExamList
                statusFilter="all"
                onEdit={handleEdit}
                onUpload={handleUpload}
                onViewSubmissions={handleViewSubmissions}
                refreshTrigger={refreshTrigger}
              />
            </TabsContent>
            <TabsContent value="draft">
              <ExamList
                statusFilter="draft"
                onEdit={handleEdit}
                onUpload={handleUpload}
                onViewSubmissions={handleViewSubmissions}
                refreshTrigger={refreshTrigger}
              />
            </TabsContent>
            <TabsContent value="published">
              <ExamList
                statusFilter="published"
                onEdit={handleEdit}
                onUpload={handleUpload}
                onViewSubmissions={handleViewSubmissions}
                refreshTrigger={refreshTrigger}
              />
            </TabsContent>
            <TabsContent value="archived">
              <ExamList
                statusFilter="archived"
                onEdit={handleEdit}
                onUpload={handleUpload}
                onViewSubmissions={handleViewSubmissions}
                refreshTrigger={refreshTrigger}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Create/Edit Dialog */}
      <ExamCreator
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        editingExam={editingExam}
        onSuccess={handleSuccess}
      />

      {/* Upload Dialog */}
      {uploadExam && (
        <FileUploader
          examId={uploadExam.id}
          examTitle={uploadExam.title}
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {/* Result Viewer Dialog */}
      <ResultViewer
        open={resultViewerOpen}
        onOpenChange={setResultViewerOpen}
        result={selectedSubmission?.result || null}
        studentIdentifier={selectedSubmission?.student_identifier}
        examTitle={selectedExam?.title}
      />
    </div>
  );
};

export default Assessments;
