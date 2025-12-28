import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  FileQuestion, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Upload,
  BarChart3,
  Eye
} from "lucide-react";
import type { Rubric } from "@/lib/assessment/rubric";

/**
 * Submission status counts for an exam
 */
export interface SubmissionStats {
  uploaded: number;
  processing: number;
  graded: number;
  failed: number;
  total: number;
}

/**
 * Exam with aggregated submission statistics
 */
export interface ExamWithStats {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  rubric: Rubric;
  created_at: string;
  stats: SubmissionStats;
  average_score: number | null;
}

interface AssessmentDashboardProps {
  onSelectExam: (examId: string) => void;
  onUpload: (examId: string, examTitle: string) => void;
  refreshTrigger?: number;
}

/**
 * Aggregates submission counts by status for display
 */
export function aggregateSubmissionStats(
  submissions: Array<{ exam_id: string; status: string; }>
): Record<string, SubmissionStats> {
  const statsMap: Record<string, SubmissionStats> = {};

  for (const sub of submissions) {
    if (!statsMap[sub.exam_id]) {
      statsMap[sub.exam_id] = {
        uploaded: 0,
        processing: 0,
        graded: 0,
        failed: 0,
        total: 0,
      };
    }
    
    const stats = statsMap[sub.exam_id];
    stats.total++;
    
    if (sub.status === "uploaded") stats.uploaded++;
    else if (sub.status === "processing") stats.processing++;
    else if (sub.status === "graded") stats.graded++;
    else if (sub.status === "failed") stats.failed++;
  }

  return statsMap;
}

const AssessmentDashboard = ({ 
  onSelectExam, 
  onUpload,
  refreshTrigger 
}: AssessmentDashboardProps) => {
  const { toast } = useToast();
  const [exams, setExams] = useState<ExamWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch all exams for the educator
      const { data: examsData, error: examsError } = await supabase
        .from("exams")
        .select("*")
        .eq("educator_id", session.user.id)
        .order("created_at", { ascending: false });

      if (examsError) throw examsError;

      if (!examsData || examsData.length === 0) {
        setExams([]);
        return;
      }

      const examIds = examsData.map(e => e.id);

      // Fetch all submissions for these exams
      const { data: submissionsData, error: subError } = await supabase
        .from("submissions")
        .select("exam_id, status")
        .in("exam_id", examIds);

      if (subError) throw subError;

      // Fetch results for graded submissions to calculate average scores
      const { data: resultsData, error: resultsError } = await supabase
        .from("results")
        .select("submission_id, total_score");

      if (resultsError) throw resultsError;

      // Get submission IDs to result scores mapping
      const { data: gradedSubmissions, error: gradedError } = await supabase
        .from("submissions")
        .select("id, exam_id")
        .in("exam_id", examIds)
        .eq("status", "graded");

      if (gradedError) throw gradedError;

      // Map submission_id to exam_id for score aggregation
      const submissionToExam: Record<string, string> = {};
      gradedSubmissions?.forEach(s => {
        submissionToExam[s.id] = s.exam_id;
      });

      // Calculate average scores per exam
      const examScores: Record<string, number[]> = {};
      resultsData?.forEach(r => {
        const examId = submissionToExam[r.submission_id];
        if (examId && r.total_score !== null) {
          if (!examScores[examId]) examScores[examId] = [];
          examScores[examId].push(r.total_score);
        }
      });

      // Aggregate submission stats
      const statsMap = aggregateSubmissionStats(submissionsData || []);

      // Combine all data
      const examsWithStats: ExamWithStats[] = examsData.map(exam => {
        const scores = examScores[exam.id] || [];
        const avgScore = scores.length > 0 
          ? scores.reduce((a, b) => a + b, 0) / scores.length 
          : null;

        return {
          ...exam,
          rubric: exam.rubric as unknown as Rubric,
          stats: statsMap[exam.id] || {
            uploaded: 0,
            processing: 0,
            graded: 0,
            failed: 0,
            total: 0,
          },
          average_score: avgScore,
        };
      });

      setExams(examsWithStats);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Erro ao carregar dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">
            Nenhuma prova encontrada
          </p>
          <p className="text-sm text-muted-foreground">
            Crie uma prova para começar a acompanhar as avaliações
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{exams.length}</p>
                <p className="text-sm text-muted-foreground">Total de Provas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {exams.reduce((sum, e) => sum + e.stats.total, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Submissões</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {exams.reduce((sum, e) => sum + e.stats.graded, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Corrigidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {exams.reduce((sum, e) => sum + e.stats.processing + e.stats.uploaded, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exam List with Stats */}
      <div className="space-y-4">
        {exams.map((exam) => (
          <Card key={exam.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileQuestion className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{exam.title}</CardTitle>
                  <Badge variant={
                    exam.status === "published" ? "default" : 
                    exam.status === "draft" ? "secondary" : "outline"
                  }>
                    {exam.status === "published" ? "Publicada" : 
                     exam.status === "draft" ? "Rascunho" : "Arquivada"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {exam.status === "published" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpload(exam.id, exam.title)}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onSelectExam(exam.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {/* Submission Stats */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm">
                    <span className="font-medium">{exam.stats.uploaded}</span>
                    <span className="text-muted-foreground ml-1">Enviadas</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">
                    <span className="font-medium">{exam.stats.processing}</span>
                    <span className="text-muted-foreground ml-1">Processando</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">
                    <span className="font-medium">{exam.stats.graded}</span>
                    <span className="text-muted-foreground ml-1">Corrigidas</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm">
                    <span className="font-medium">{exam.stats.failed}</span>
                    <span className="text-muted-foreground ml-1">Falhas</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    <span className="font-medium">{exam.stats.total}</span>
                    <span className="text-muted-foreground ml-1">Total</span>
                  </span>
                </div>
                {/* Average Score */}
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">
                      {exam.average_score !== null 
                        ? exam.average_score.toFixed(1) 
                        : "-"}
                    </span>
                    <span className="text-muted-foreground ml-1">Média</span>
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              {exam.stats.total > 0 && (
                <div className="mt-4">
                  <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                    {exam.stats.graded > 0 && (
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${(exam.stats.graded / exam.stats.total) * 100}%` }}
                      />
                    )}
                    {exam.stats.processing > 0 && (
                      <div 
                        className="bg-yellow-500" 
                        style={{ width: `${(exam.stats.processing / exam.stats.total) * 100}%` }}
                      />
                    )}
                    {exam.stats.uploaded > 0 && (
                      <div 
                        className="bg-blue-500" 
                        style={{ width: `${(exam.stats.uploaded / exam.stats.total) * 100}%` }}
                      />
                    )}
                    {exam.stats.failed > 0 && (
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${(exam.stats.failed / exam.stats.total) * 100}%` }}
                      />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AssessmentDashboard;
