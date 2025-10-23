import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Template {
  id: string;
  type: string;
  title: string;
  description: string;
  grade_levels: string[];
  subjects: string[];
  methodology: string[];
}

interface TemplateSelectorProps {
  contentType: string;
  currentGrade: string;
  currentSubject: string;
  onSelectTemplate: (templateId: string) => void;
  selectedTemplateId?: string;
}

const TemplateSelector = ({
  contentType,
  currentGrade,
  currentSubject,
  onSelectTemplate,
  selectedTemplateId,
}: TemplateSelectorProps) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentGrade && currentSubject) {
      loadTemplates();
    }
  }, [currentGrade, currentSubject, contentType]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("content_templates")
        .select("*")
        .eq("type", contentType)
        .contains("grade_levels", [currentGrade])
        .contains("subjects", [currentSubject]);

      if (error) throw error;
      
      setTemplates(data || []);
    } catch (error: any) {
      console.error("Error loading templates:", error);
      toast({
        title: "Erro ao carregar templates",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentGrade || !currentSubject) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (templates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold mb-2">Templates BNCC Recomendados</h4>
        <p className="text-xs text-muted-foreground">
          Selecione um template otimizado para {currentGrade} - {currentSubject}
        </p>
      </div>

      <div className="space-y-2">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all ${
              selectedTemplateId === template.id
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() => onSelectTemplate(template.id)}
          >
            <CardHeader className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1">
                  <FileText className="h-4 w-4 text-primary mt-1" />
                  <div className="flex-1">
                    <CardTitle className="text-sm">{template.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
                {selectedTemplateId === template.id && (
                  <Badge className="bg-primary">Selecionado</Badge>
                )}
              </div>
            </CardHeader>
            {template.methodology && template.methodology.length > 0 && (
              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-1">
                  {template.methodology.map((method, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {method.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {selectedTemplateId && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectTemplate("")}
          className="w-full"
        >
          Limpar Seleção de Template
        </Button>
      )}
    </div>
  );
};

export default TemplateSelector;
