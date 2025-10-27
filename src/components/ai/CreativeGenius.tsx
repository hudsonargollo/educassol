import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2, Copy, Download, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreativeGeniusProps {
  onGenerate?: (config: GenerationConfig) => Promise<string>;
  isLoading?: boolean;
}

interface GenerationConfig {
  bnccCode: string;
  contentType: string;
  quantity: number;
  prompt: string;
  gradeLevel: string;
}

interface GeneratedContent {
  id: string;
  content: string;
  config: GenerationConfig;
  createdAt: string;
}

const CONTENT_TYPES = [
  { value: "quiz", label: "Quiz (Múltipla Escolha)" },
  { value: "activity", label: "Atividade Prática" },
  { value: "lesson_plan", label: "Plano de Aula" },
  { value: "game", label: "Jogo Educativo" },
  { value: "assessment", label: "Avaliação Formativa" },
];

const GRADE_LEVELS = [
  { value: "1", label: "1º Ano" },
  { value: "2", label: "2º Ano" },
  { value: "3", label: "3º Ano" },
  { value: "4", label: "4º Ano" },
  { value: "5", label: "5º Ano" },
];

export const CreativeGenius = ({ onGenerate, isLoading = false }: CreativeGeniusProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [editingContent, setEditingContent] = useState<GeneratedContent | null>(null);
  const [config, setConfig] = useState<GenerationConfig>({
    bnccCode: "",
    contentType: "quiz",
    quantity: 5,
    prompt: "",
    gradeLevel: "3",
  });

  const handleGenerate = async () => {
    if (!config.bnccCode.trim()) {
      toast({
        title: "Erro",
        description: "Selecione um código BNCC",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const content = await onGenerate?.(config);
      if (content) {
        const newContent: GeneratedContent = {
          id: Date.now().toString(),
          content,
          config,
          createdAt: new Date().toISOString(),
        };
        setGeneratedContent([newContent, ...generatedContent]);
        toast({
          title: "Sucesso",
          description: "Conteúdo gerado com sucesso!",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao gerar conteúdo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copiado",
      description: "Conteúdo copiado para a área de transferência",
    });
  };

  const handleDownloadContent = (content: string, filename: string) => {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Gênio Criador
              </CardTitle>
              <CardDescription>
                Gere conteúdo educacional com IA em segundos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Clique para abrir o gerador de conteúdo inteligente
              </p>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gênio Criador - Gerador de Conteúdo IA</DialogTitle>
            <DialogDescription>
              Configure os parâmetros e deixe a IA criar conteúdo educacional de qualidade
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Gerar</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bncc-code">Código BNCC</Label>
                <Input
                  id="bncc-code"
                  placeholder="Ex: EF04LP03"
                  value={config.bnccCode}
                  onChange={(e) => setConfig({ ...config, bnccCode: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Ano Escolar</Label>
                  <Select value={config.gradeLevel} onValueChange={(value) => setConfig({ ...config, gradeLevel: value })}>
                    <SelectTrigger id="grade">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content-type">Tipo de Conteúdo</Label>
                  <Select value={config.contentType} onValueChange={(value) => setConfig({ ...config, contentType: value })}>
                    <SelectTrigger id="content-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantidade {config.contentType === "quiz" && "(questões)"}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="20"
                  value={config.quantity}
                  onChange={(e) => setConfig({ ...config, quantity: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Instruções Adicionais (opcional)</Label>
                <Textarea
                  id="prompt"
                  placeholder="Descreva qualquer detalhe específico que você gostaria que a IA considerasse..."
                  value={config.prompt}
                  onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                  rows={4}
                />
              </div>

              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                <Wand2 className="h-4 w-4 mr-2" />
                {isGenerating ? "Gerando..." : "Gerar Conteúdo"}
              </Button>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {generatedContent.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum conteúdo gerado ainda. Comece gerando novo conteúdo!
                </p>
              ) : (
                <div className="space-y-4">
                  {generatedContent.map((item) => (
                    <Card key={item.id}>
                      <CardHeader>
                        <CardTitle className="text-base">
                          {item.config.contentType} - {item.config.bnccCode}
                        </CardTitle>
                        <CardDescription>
                          {new Date(item.createdAt).toLocaleString("pt-BR")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm line-clamp-3">{item.content}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyContent(item.content)}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copiar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadContent(item.content, `conteudo_${item.id}.txt`)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Baixar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingContent(item)}
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {editingContent && (
        <Dialog open={!!editingContent} onOpenChange={() => setEditingContent(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Conteúdo</DialogTitle>
              <DialogDescription>
                Modifique o conteúdo gerado antes de salvar
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={editingContent.content}
                onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                rows={10}
              />
              <div className="flex gap-2">
                <Button onClick={() => setEditingContent(null)} className="flex-1">
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setEditingContent(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CreativeGenius;

