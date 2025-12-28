import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ExamCard from "./ExamCard";
import type { Rubric } from "@/lib/assessment/rubric";

interface ExamWithCount {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  rubric: Rubric;
  created_at: string;
  submission_count: number;
}

interface ExamListProps {
  statusFilter?: "all" | "draft" | "published" | "archived";
  onEdit: (exam: any) => void;
  onUpload: (examId: string, examTitle: string) => void;
  onViewSubmissions: (examId: string, examTitle: string) => void;
  refreshTrigger?: number;
}

const ExamList = ({ 
  statusFilter = "all", 
  onEdit, 
  onUpload, 
  onViewSubmissions,
  refreshTrigger 
}: ExamListProps) => {
  const { toast } = useToast();
  const [exams, setExams] = useState<ExamWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch exams
      let query = supabase
        .from("exams")
        .select("*")
        .eq("educator_id", session.user.id)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data: examsData, error: examsError } = await query;
      if (examsError) throw examsError;

      if (!examsData || examsData.length === 0) {
        setExams([]);
        return;
      }

      // Fetch submission counts for each exam
      const examIds = examsData.map(e => e.id);
      const { data: submissionCounts, error: countError } = await supabase
        .from("submissions")
        .select("exam_id")
        .in("exam_id", examIds);

      if (countError) throw countError;

      // Count submissions per exam
      const countMap: Record<string, number> = {};
      submissionCounts?.forEach(s => {
        countMap[s.exam_id] = (countMap[s.exam_id] || 0) + 1;
      });

      // Combine data
      const examsWithCounts: ExamWithCount[] = examsData.map(exam => ({
        ...exam,
        rubric: exam.rubric as unknown as Rubric,
        submission_count: countMap[exam.id] || 0,
      }));

      setExams(examsWithCounts);
    } catch (error: any) {
      console.error("Error fetching exams:", error);
      toast({
        title: "Erro ao carregar provas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [statusFilter, refreshTrigger]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("exams")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Prova excluída",
        description: "A prova foi removida com sucesso.",
      });

      fetchExams();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
          <p className="text-muted-foreground mb-4">
            Nenhuma prova encontrada
          </p>
          <p className="text-sm text-muted-foreground">
            Clique em "Nova Prova" para criar sua primeira prova
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {exams.map((exam) => (
        <ExamCard
          key={exam.id}
          exam={exam}
          onEdit={onEdit}
          onDelete={handleDelete}
          onUpload={onUpload}
          onViewSubmissions={onViewSubmissions}
        />
      ))}
    </div>
  );
};

export default ExamList;
