import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ClipboardList, FileQuestion, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

interface ContentListProps {
  type: string;
}

const ContentList = ({ type }: ContentListProps) => {
  const { toast } = useToast();
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const fetchContents = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("generated_content")
        .select("*")
        .order("created_at", { ascending: false });

      if (type !== "all") {
        query = query.eq("type", type);
      }

      const { data, error } = await query;

      if (error) throw error;
      setContents(data || []);
    } catch (error: any) {
      console.error("Error fetching contents:", error);
      toast({
        title: "Erro ao carregar conteúdos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [type]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("generated_content")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Conteúdo excluído",
        description: "O conteúdo foi removido com sucesso",
      });

      fetchContents();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleView = (content: any) => {
    setSelectedContent(content);
    setViewDialogOpen(true);
  };

  const getIcon = (contentType: string) => {
    switch (contentType) {
      case "lesson_plan":
        return <FileText className="h-5 w-5" />;
      case "activity":
        return <ClipboardList className="h-5 w-5" />;
      case "assessment":
        return <FileQuestion className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (contentType: string) => {
    switch (contentType) {
      case "lesson_plan":
        return "Plano de Aula";
      case "activity":
        return "Atividade";
      case "assessment":
        return "Avaliação";
      default:
        return contentType;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (contents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">
            Nenhum conteúdo encontrado
          </p>
          <p className="text-sm text-muted-foreground">
            Clique em um dos cards acima para gerar seu primeiro conteúdo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contents.map((content) => (
          <Card key={content.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getIcon(content.type)}
                  <div>
                    <CardTitle className="text-lg">{content.title}</CardTitle>
                    <CardDescription>{getTypeLabel(content.type)}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {content.bncc_codes && content.bncc_codes.length > 0 && (
                  <p className="text-muted-foreground">
                    BNCC: {content.bncc_codes.join(", ")}
                  </p>
                )}
                {content.methodology && (
                  <p className="text-muted-foreground">
                    Metodologia: {content.methodology}
                  </p>
                )}
                {content.duration_minutes && (
                  <p className="text-muted-foreground">
                    Duração: {content.duration_minutes} min
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Criado em: {new Date(content.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(content)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(content.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{selectedContent?.content || ""}</ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContentList;
