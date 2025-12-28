import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, FileText, Play, RefreshCw, Filter, X, Download, Loader2, Radio } from "lucide-react";
import type { GradingResult } from "@/lib/assessment/grading-result";

export type SubmissionStatus = "uploaded" | "processing" | "graded" | "failed";

export interface SubmissionWithResult {
  id: string;
  exam_id: string;
  student_identifier: string | null;
  storage_path: string;
  file_type: "pdf" | "jpeg" | "png";
  file_size_bytes: number;
  status: SubmissionStatus;
  error_message: string | null;
  uploaded_at: string;
  processed_at: string | null;
  result?: { id: string; total_score: number | null; ai_output: GradingResult | null; pdf_report_url: string | null; verification_token: string; graded_at: string; } | null;
}

export interface SubmissionFilters {
  status: SubmissionStatus | "all";
  minScore: number | null;
  maxScore: number | null;
  searchTerm: string;
}

export function filterSubmissions(submissions: SubmissionWithResult[], filters: SubmissionFilters): SubmissionWithResult[] {
  return submissions.filter((sub) => {
    if (filters.status !== "all" && sub.status !== filters.status) return false;
    if (sub.status === "graded" && sub.result?.total_score !== null) {
      const score = sub.result.total_score;
      if (filters.minScore !== null && score < filters.minScore) return false;
      if (filters.maxScore !== null && score > filters.maxScore) return false;
    }
    if (filters.searchTerm.trim()) {
      const term = filters.searchTerm.toLowerCase();
      const studentId = sub.student_identifier?.toLowerCase() || "";
      if (!studentId.includes(term)) return false;
    }
    return true;
  });
}

interface SubmissionListProps {
  examId: string;
  examTitle: string;
  onViewResult: (submission: SubmissionWithResult) => void;
  onClose: () => void;
  refreshTrigger?: number;
}

const SubmissionList = ({ examId, examTitle, onViewResult, onClose, refreshTrigger }: SubmissionListProps) => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<SubmissionWithResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [filters, setFilters] = useState<SubmissionFilters>({ status: "all", minScore: null, maxScore: null, searchTerm: "" });

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("submissions").select("id, exam_id, student_identifier, storage_path, file_type, file_size_bytes, status, error_message, uploaded_at, processed_at, results (id, total_score, ai_output, pdf_report_url, verification_token, graded_at)").eq("exam_id", examId).order("uploaded_at", { ascending: false });
      if (error) throw error;
      setSubmissions((data || []).map((sub) => ({ ...sub, result: sub.results?.[0] || null })));
    } catch (error: any) {
      toast({ title: "Erro ao carregar submissões", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [examId, toast]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions, refreshTrigger]);

  useEffect(() => {
    const channel = supabase.channel("submissions-" + examId)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "submissions", filter: "exam_id=eq." + examId }, (payload) => {
        const updated = payload.new as { id: string; status: SubmissionStatus; error_message: string | null; processed_at: string | null };
        setSubmissions((prev) => prev.map((sub) => sub.id === updated.id ? { ...sub, status: updated.status, error_message: updated.error_message, processed_at: updated.processed_at } : sub));
        if (updated.status === "graded") { toast({ title: "Correção concluída" }); fetchSubmissions(); }
        else if (updated.status === "failed") { toast({ title: "Erro na correção", description: updated.error_message || "Falha", variant: "destructive" }); }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "submissions", filter: "exam_id=eq." + examId }, () => { fetchSubmissions(); })
      .subscribe((status) => { setIsRealtimeConnected(status === "SUBSCRIBED"); });
    return () => { supabase.removeChannel(channel); };
  }, [examId, fetchSubmissions, toast]);

  const filteredSubmissions = useMemo(() => filterSubmissions(submissions, filters), [submissions, filters]);

  const handleGrade = async (submissionId: string) => {
    setProcessingIds((prev) => new Set(prev).add(submissionId));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");
      const response = await fetch(import.meta.env.VITE_SUPABASE_URL + "/functions/v1/analyze-exam", { method: "POST", headers: { Authorization: "Bearer " + session.access_token, "Content-Type": "application/json" }, body: JSON.stringify({ submission_id: submissionId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erro");
      toast({ title: "Correção concluída", description: "Nota: " + result.total_score });
      fetchSubmissions();
    } catch (error: any) {
      toast({ title: "Erro na correção", description: error.message, variant: "destructive" });
    } finally {
      setProcessingIds((prev) => { const next = new Set(prev); next.delete(submissionId); return next; });
    }
  };

  const handleGenerateReport = async (resultId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");
      const response = await fetch(import.meta.env.VITE_SUPABASE_URL + "/functions/v1/generate-report", { method: "POST", headers: { Authorization: "Bearer " + session.access_token, "Content-Type": "application/json" }, body: JSON.stringify({ result_id: resultId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erro");
      window.open(result.pdf_url, "_blank");
      toast({ title: "Relatório gerado" });
      fetchSubmissions();
    } catch (error: any) {
      toast({ title: "Erro ao gerar relatório", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case "uploaded": return <Badge variant="secondary">Enviada</Badge>;
      case "processing": return <Badge variant="default">Processando</Badge>;
      case "graded": return <Badge className="bg-green-500 hover:bg-green-600">Corrigida</Badge>;
      case "failed": return <Badge variant="destructive">Falhou</Badge>;
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const formatFileSize = (b: number) => b < 1024 ? b + " B" : b < 1024 * 1024 ? (b / 1024).toFixed(1) + " KB" : (b / (1024 * 1024)).toFixed(1) + " MB";
  const clearFilters = () => setFilters({ status: "all", minScore: null, maxScore: null, searchTerm: "" });
  const hasActiveFilters = filters.status !== "all" || filters.minScore !== null || filters.maxScore !== null || filters.searchTerm.trim() !== "";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Submissões - {examTitle}</CardTitle>
            {isRealtimeConnected && <div className="flex items-center gap-1 text-xs text-green-600"><Radio className="h-3 w-3 animate-pulse" /><span>Ao vivo</span></div>}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{filteredSubmissions.length} de {submissions.length} submissões</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSubmissions}><RefreshCw className="h-4 w-4 mr-1" />Atualizar</Button>
          <Button variant={showFilters ? "default" : "outline"} size="sm" onClick={() => setShowFilters(!showFilters)}><Filter className="h-4 w-4 mr-1" />Filtros{hasActiveFilters && <span className="ml-1 bg-primary-foreground text-primary rounded-full px-1.5 text-xs">!</span>}</Button>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      {showFilters && (
        <div className="px-6 pb-4 border-b">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1"><Label className="text-xs">Status</Label><Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v as SubmissionStatus | "all" })}><SelectTrigger className="h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="uploaded">Enviadas</SelectItem><SelectItem value="processing">Processando</SelectItem><SelectItem value="graded">Corrigidas</SelectItem><SelectItem value="failed">Falhas</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-xs">Nota Mínima</Label><Input type="number" placeholder="0" className="h-8" value={filters.minScore ?? ""} onChange={(e) => setFilters({ ...filters, minScore: e.target.value ? Number(e.target.value) : null })} /></div>
            <div className="space-y-1"><Label className="text-xs">Nota Máxima</Label><Input type="number" placeholder="100" className="h-8" value={filters.maxScore ?? ""} onChange={(e) => setFilters({ ...filters, maxScore: e.target.value ? Number(e.target.value) : null })} /></div>
            <div className="space-y-1"><Label className="text-xs">Buscar Aluno</Label><div className="flex gap-1"><Input placeholder="Nome ou ID..." className="h-8" value={filters.searchTerm} onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })} />{hasActiveFilters && <Button variant="ghost" size="sm" className="h-8 px-2" onClick={clearFilters}><X className="h-4 w-4" /></Button>}</div></div>
          </div>
        </div>
      )}
      <CardContent className="p-0">
        {loading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div> : filteredSubmissions.length === 0 ? <div className="text-center py-8 text-muted-foreground">{submissions.length === 0 ? "Nenhuma submissão encontrada" : "Nenhuma submissão corresponde aos filtros"}</div> : (
          <Table>
            <TableHeader><TableRow><TableHead>Aluno</TableHead><TableHead>Arquivo</TableHead><TableHead>Status</TableHead><TableHead>Nota</TableHead><TableHead>Data</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredSubmissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.student_identifier || <span className="text-muted-foreground italic">Não identificado</span>}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">{s.file_type.toUpperCase()}  {formatFileSize(s.file_size_bytes)}</span></div></TableCell>
                  <TableCell>{getStatusBadge(s.status)}</TableCell>
                  <TableCell>{s.status === "graded" && s.result ? <span className="font-medium">{s.result.total_score?.toFixed(1) ?? "-"}</span> : <span className="text-muted-foreground">-</span>}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(s.uploaded_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {s.status === "uploaded" && <Button variant="outline" size="sm" onClick={() => handleGrade(s.id)} disabled={processingIds.has(s.id)}>{processingIds.has(s.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Play className="h-4 w-4 mr-1" />Corrigir</>}</Button>}
                      {s.status === "graded" && s.result && <><Button variant="outline" size="sm" onClick={() => onViewResult(s)}><Eye className="h-4 w-4 mr-1" />Ver</Button><Button variant="outline" size="sm" onClick={() => s.result?.pdf_report_url ? window.open(s.result.pdf_report_url, "_blank") : handleGenerateReport(s.result!.id)}><Download className="h-4 w-4 mr-1" />PDF</Button></>}
                      {s.status === "failed" && <Button variant="outline" size="sm" onClick={() => handleGrade(s.id)} disabled={processingIds.has(s.id)}>{processingIds.has(s.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <><RefreshCw className="h-4 w-4 mr-1" />Tentar Novamente</>}</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default SubmissionList;
