import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, ShieldCheck } from "lucide-react";

interface VerificationData {
  studentInitials: string;
  examTitle: string;
  gradedDate: string;
  totalScore: number;
}

type VerificationState = 
  | { status: "loading" }
  | { status: "success"; data: VerificationData }
  | { status: "error"; message: string };

/**
 * Extracts initials from a full name.
 * Returns first letter of first name and first letter of last name.
 * If only one name, returns first two letters.
 */
function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "??";
  
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Formats a date string for display.
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Public verification page for QR code grade verification.
 * Displays limited grade information when a valid verification token is provided.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
const Verify = () => {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerificationState>({ status: "loading" });
  
  const token = searchParams.get("token");

  useEffect(() => {
    async function verifyToken() {
      // Handle missing token
      if (!token) {
        setState({ 
          status: "error", 
          message: "Token de verificação não fornecido" 
        });
        return;
      }

      // Validate token format (should be UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(token)) {
        setState({ 
          status: "error", 
          message: "Formato de token inválido" 
        });
        return;
      }

      try {
        // Query results by verification_token with exam info
        const { data, error } = await supabase
          .from("results")
          .select(`
            total_score,
            graded_at,
            ai_output,
            submission:submissions!inner(
              exam:exams!inner(
                title
              )
            )
          `)
          .eq("verification_token", token)
          .single();

        if (error || !data) {
          setState({ 
            status: "error", 
            message: "Token de verificação inválido ou não encontrado" 
          });
          return;
        }

        // Extract student name from ai_output
        const aiOutput = data.ai_output as { student_metadata?: { name?: string } };
        const studentName = aiOutput?.student_metadata?.name || "Aluno";
        
        // Extract exam title from nested relation
        const examTitle = (data.submission as { exam: { title: string } })?.exam?.title || "Avaliação";

        setState({
          status: "success",
          data: {
            studentInitials: getInitials(studentName),
            examTitle: examTitle,
            gradedDate: formatDate(data.graded_at),
            totalScore: data.total_score ?? 0,
          },
        });
      } catch {
        setState({ 
          status: "error", 
          message: "Erro ao verificar o token. Tente novamente mais tarde." 
        });
      }
    }

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center border-b">
          <div className="flex justify-center mb-2">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-xl">Verificação de Nota</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Sistema de Verificação EducaSol
          </p>
        </CardHeader>
        
        <CardContent className="pt-6">
          {state.status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Verificando...</p>
            </div>
          )}

          {state.status === "error" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-red-100 p-3 mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Verificação Falhou</h3>
              <p className="text-muted-foreground text-center mb-6">
                {state.message}
              </p>
              <Link 
                to="/" 
                className="text-primary hover:underline text-sm"
              >
                Voltar para a página inicial
              </Link>
            </div>
          )}

          {state.status === "success" && (
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-green-100 p-3 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Documento Verificado
                </Badge>
              </div>

              <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Aluno</span>
                  <span className="font-medium">{state.data.studentInitials}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avaliação</span>
                  <span className="font-medium text-right max-w-[200px] truncate">
                    {state.data.examTitle}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Data</span>
                  <span className="font-medium">{state.data.gradedDate}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Nota</span>
                  <span className="font-bold text-lg text-primary">
                    {state.data.totalScore.toFixed(1)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Este documento foi verificado pelo sistema EducaSol.
                <br />
                A autenticidade desta nota foi confirmada.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Verify;
