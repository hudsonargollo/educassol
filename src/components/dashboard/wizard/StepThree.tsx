import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { WizardData } from "../ContentWizard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TemplateSelector from "./TemplateSelector";

interface StepThreeProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  contentType: string;
}

interface BNCCSkill {
  code: string;
  description: string;
  relevance: string;
}

export const StepThree = ({ data, onUpdate, onNext, onBack, contentType }: StepThreeProps) => {
  const { toast } = useToast();
  const [topicInput, setTopicInput] = useState("");
  const [bnccSuggestions, setBnccSuggestions] = useState<BNCCSkill[]>([]);
  const [loadingBncc, setLoadingBncc] = useState(false);
  const [selectedBnccCode, setSelectedBnccCode] = useState<string>("");

  const accessibilityOptions = [
    { id: "visual", label: "👁️ Alunos com deficiência visual" },
    { id: "auditiva", label: "👂 Alunos com deficiência auditiva" },
    { id: "tdah", label: "⚡ Alunos com transtorno do déficit de atenção (TDAH)" },
    { id: "autismo1", label: "🧩 Alunos com transtorno do espectro autista (Nível 1)" },
    { id: "autismo2", label: "🧩 Alunos com transtorno do espectro autista (Nível 2)" },
    { id: "autismo3", label: "🧩 Alunos com transtorno do espectro autista (Nível 3)" },
    { id: "intelectual", label: "🧠 Alunos com deficiência intelectual" },
    { id: "ansiedade", label: "😰 Alunos com transtornos de ansiedade" },
    { id: "superdotacao", label: "⭐ Alunos com altas habilidades ou superdotação" },
    { id: "motora", label: "🦽 Alunos com dificuldades motoras" },
    { id: "socializacao", label: "💛 Alunos com dificuldades de socialização" },
    { id: "linguistica", label: "🗣️ Alunos imigrantes com barreiras linguísticas" },
    { id: "socioeconomico", label: "🎒 Alunos com baixa participação por fatores socioeconômicos" },
  ];

  const methodologies = [
    "Aprendizagem Baseada em Problemas",
    "Aprendizagem Baseada em Projetos",
    "Sala de Aula Invertida",
    "Gamificação",
    "Aprendizagem por Pares",
    "Rotação por Estações",
  ];

  const handleAddTopic = () => {
    if (topicInput.trim()) {
      const topics = topicInput.split(";").map(t => t.trim()).filter(t => t);
      onUpdate({ topics: [...data.topics, ...topics] });
      setTopicInput("");
    }
  };

  const handleRemoveTopic = (index: number) => {
    const newTopics = data.topics.filter((_, i) => i !== index);
    onUpdate({ topics: newTopics });
  };

  const toggleAccessibility = (optionId: string) => {
    const current = data.accessibilityOptions || [];
    if (current.includes(optionId)) {
      onUpdate({ accessibilityOptions: current.filter(id => id !== optionId) });
    } else {
      onUpdate({ accessibilityOptions: [...current, optionId] });
    }
  };

  const toggleMethodology = (method: string) => {
    const current = data.methodologies || [];
    if (current.includes(method)) {
      onUpdate({ methodologies: current.filter(m => m !== method) });
    } else {
      onUpdate({ methodologies: [...current, method] });
    }
  };

  const handleSuggestBncc = async () => {
    if (!data.grade || !data.subject) {
      toast({
        title: "Informações insuficientes",
        description: "Selecione o ano e a disciplina primeiro",
        variant: "destructive",
      });
      return;
    }

    setLoadingBncc(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { data: result, error } = await supabase.functions.invoke("suggest-bncc-skills", {
        body: {
          grade: data.grade,
          subject: data.subject,
          topic: data.topics.length > 0 ? data.topics.join(", ") : undefined,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      
      setBnccSuggestions(result.skills || []);
      
      toast({
        title: "Sugestões BNCC geradas!",
        description: `${result.skills.length} habilidades sugeridas`,
      });
    } catch (error: any) {
      console.error("Error suggesting BNCC:", error);
      toast({
        title: "Erro ao buscar sugestões",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingBncc(false);
    }
  };

  const handleSelectBnccSkill = (skill: BNCCSkill) => {
    setSelectedBnccCode(skill.code);
    // Add the BNCC code to topics if not already there
    if (!data.topics.includes(skill.code)) {
      onUpdate({ topics: [...data.topics, `${skill.code}: ${skill.description.substring(0, 50)}...`] });
    }
  };

  const canProceed = data.topics.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Criando seu plano de aula: Etapa 3 de 5</p>
        <h2 className="text-3xl font-bold">Informações Adicionais</h2>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">
              Selecione um ou mais temas:
            </Label>
            <p className="text-xs text-muted-foreground mb-3">
              E/ou escreva um ou mais temas desejados (separados por vírgula):
            </p>
            <div className="space-y-2">
              <Textarea
                placeholder="Escreva aqui o(s) tema(s) desejado(s)"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onBlur={handleAddTopic}
                rows={3}
              />
              {data.topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.topics.map((topic, idx) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1">
                      {topic}
                      <button
                        onClick={() => handleRemoveTopic(idx)}
                        className="ml-2 text-xs hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Label className="text-base font-semibold">
                Você tem alguma ideia específica para essa atividade?
              </Label>
              <Badge variant="secondary" className="text-xs">opcional</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Exemplo 1: <em>Gostaria que os alunos construíssem uma horta durante a atividade</em>
            </p>
            <Textarea
              placeholder="Descreva sua ideia específica"
              value={data.specificIdea}
              onChange={(e) => onUpdate({ specificIdea: e.target.value })}
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-2">200 caracteres restantes</p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="noDigital"
              checked={data.noDigitalResources}
              onCheckedChange={(checked) => onUpdate({ noDigitalResources: checked as boolean })}
            />
            <Label htmlFor="noDigital" className="text-sm cursor-pointer">
              <strong>Não</strong> quero utilizar recursos digitais durante as aulas, como tablets, computadores...
            </Label>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Alunos por turma:</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[data.studentsPerClass]}
                  onValueChange={([value]) => onUpdate({ studentsPerClass: value })}
                  min={10}
                  max={50}
                  step={5}
                  className="flex-1"
                />
                <span className="text-2xl font-bold w-16 text-right">{data.studentsPerClass}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Alunos por turma</p>
            </div>

            <div>
              <Label className="text-sm font-medium">Número de aulas</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[data.numberOfLessons]}
                  onValueChange={([value]) => onUpdate({ numberOfLessons: value })}
                  min={1}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="text-2xl font-bold w-16 text-right">{data.numberOfLessons}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Selecione o número total de aulas</p>
            </div>

            <div>
              <Label className="text-sm font-medium">Duração de cada aula:</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  value={[data.durationPerLesson]}
                  onValueChange={([value]) => onUpdate({ durationPerLesson: value })}
                  min={30}
                  max={120}
                  step={15}
                  className="flex-1"
                />
                <span className="text-2xl font-bold w-16 text-right">{data.durationPerLesson}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Tempo de duração de cada aula, em minutos</p>
          </div>

          {/* Template Selector */}
          <TemplateSelector
            contentType={contentType}
            currentGrade={data.grade}
            currentSubject={data.subject}
            onSelectTemplate={(templateId) => onUpdate({ templateId })}
            selectedTemplateId={data.templateId}
          />

          {/* BNCC Suggestions Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">
                Sugestões de Habilidades BNCC
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSuggestBncc}
                disabled={loadingBncc || !data.grade || !data.subject}
              >
                {loadingBncc ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Sugerir com IA
                  </>
                )}
              </Button>
            </div>
            
            {bnccSuggestions.length > 0 && (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {bnccSuggestions.map((skill, idx) => (
                  <Card
                    key={idx}
                    className={`cursor-pointer transition-all ${
                      selectedBnccCode === skill.code
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => handleSelectBnccSkill(skill)}
                  >
                    <CardHeader className="p-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {skill.code}
                        </Badge>
                        {selectedBnccCode === skill.code && (
                          <Badge className="bg-primary">Selecionada</Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs mt-2">
                        {skill.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-xs text-muted-foreground italic">
                        💡 {skill.relevance}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {bnccSuggestions.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                Clique em "Sugerir com IA" para receber recomendações de habilidades BNCC baseadas no ano, disciplina e tema
              </p>
            )}
          </div>
        </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Label className="text-base font-semibold">
                Selecione as Metodologias Ativas para cada Aula
              </Label>
              <Badge variant="secondary" className="text-xs">opcional</Badge>
            </div>
            <div className="space-y-2">
              {methodologies.map((method) => (
                <div key={method} className="flex items-center space-x-2">
                  <Checkbox
                    id={method}
                    checked={data.methodologies.includes(method)}
                    onCheckedChange={() => toggleMethodology(method)}
                  />
                  <Label htmlFor={method} className="text-sm cursor-pointer font-normal">
                    {method}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Label className="text-base font-semibold">
              Inclusão e acessibilidade
            </Label>
            <Badge variant="secondary" className="text-xs">opcional</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Selecione características específicas da sua turma para personalizar ainda mais sua atividade.
          </p>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {accessibilityOptions.map((option) => (
              <div key={option.id} className="flex items-start space-x-2">
                <Checkbox
                  id={option.id}
                  checked={data.accessibilityOptions.includes(option.id)}
                  onCheckedChange={() => toggleAccessibility(option.id)}
                />
                <Label htmlFor={option.id} className="text-sm cursor-pointer font-normal leading-tight">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
