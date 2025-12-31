import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  Check,
  Loader2,
  BookOpen,
  Target,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StandardsSelector } from './StandardsSelector';
import { useUnitPlan, type UnitPlanInput } from '@/hooks/useUnitPlan';
import type { UnitPlan } from '@/lib/instructional/unit-plan';
import { useToast } from '@/hooks/use-toast';

/**
 * Wizard step type
 */
type WizardStep = 'inputs' | 'standards' | 'preview' | 'confirm';

/**
 * Wizard data state
 */
interface WizardData {
  title: string;
  gradeLevel: string;
  subject: string;
  topic: string;
  description: string;
  durationDays: number;
  startDate: Date | undefined;
  standards: string[];
}

export interface UnitPlanWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (unitPlan: UnitPlan) => void;
  onCancel?: () => void;
}

/**
 * Grade level options
 */
const GRADE_LEVELS = [
  { value: '1º Ano', label: '1º Ano' },
  { value: '2º Ano', label: '2º Ano' },
  { value: '3º Ano', label: '3º Ano' },
  { value: '4º Ano', label: '4º Ano' },
  { value: '5º Ano', label: '5º Ano' },
  { value: '6º Ano', label: '6º Ano' },
  { value: '7º Ano', label: '7º Ano' },
  { value: '8º Ano', label: '8º Ano' },
  { value: '9º Ano', label: '9º Ano' },
];

/**
 * Subject options
 */
const SUBJECTS = [
  { value: 'Matemática', label: 'Matemática' },
  { value: 'Língua Portuguesa', label: 'Língua Portuguesa' },
  { value: 'Ciências', label: 'Ciências' },
  { value: 'História', label: 'História' },
  { value: 'Geografia', label: 'Geografia' },
  { value: 'Arte', label: 'Arte' },
  { value: 'Educação Física', label: 'Educação Física' },
  { value: 'Inglês', label: 'Inglês' },
];

/**
 * Duration options (in days)
 */
const DURATION_OPTIONS = [
  { value: 5, label: '1 semana (5 dias)' },
  { value: 10, label: '2 semanas (10 dias)' },
  { value: 15, label: '3 semanas (15 dias)' },
  { value: 20, label: '4 semanas (20 dias)' },
  { value: 25, label: '5 semanas (25 dias)' },
  { value: 30, label: '6 semanas (30 dias)' },
];

/**
 * Initial wizard data
 */
const initialWizardData: WizardData = {
  title: '',
  gradeLevel: '',
  subject: '',
  topic: '',
  description: '',
  durationDays: 5,
  startDate: undefined,
  standards: [],
};

/**
 * Step indicator component
 */
function StepIndicator({
  currentStep,
  steps,
}: {
  currentStep: WizardStep;
  steps: { key: WizardStep; label: string; icon: React.ReactNode }[];
}) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, index) => {
        const isActive = step.key === currentStep;
        const isCompleted = index < currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                isActive && 'border-primary bg-primary text-primary-foreground',
                isCompleted && 'border-primary bg-primary/20 text-primary',
                !isActive && !isCompleted && 'border-muted-foreground/30 text-muted-foreground'
              )}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-xs font-medium">{index + 1}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-12 h-0.5 mx-1',
                  index < currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * UnitPlanWizard Component
 * 
 * Multi-step wizard for creating unit plans.
 * Steps: inputs → standards → preview → confirm
 * 
 * Requirements: 2.1, 2.5
 */
export function UnitPlanWizard({
  open,
  onOpenChange,
  onComplete,
  onCancel,
}: UnitPlanWizardProps) {
  const [step, setStep] = useState<WizardStep>('inputs');
  const [data, setData] = useState<WizardData>(initialWizardData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createUnitPlan } = useUnitPlan();
  const { toast } = useToast();

  const steps: { key: WizardStep; label: string; icon: React.ReactNode }[] = [
    { key: 'inputs', label: 'Informações', icon: <BookOpen className="h-4 w-4" /> },
    { key: 'standards', label: 'Padrões', icon: <Target className="h-4 w-4" /> },
    { key: 'preview', label: 'Revisão', icon: <Eye className="h-4 w-4" /> },
    { key: 'confirm', label: 'Confirmar', icon: <Check className="h-4 w-4" /> },
  ];

  /**
   * Update wizard data
   */
  const updateData = useCallback((updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Reset wizard state
   */
  const resetWizard = useCallback(() => {
    setStep('inputs');
    setData(initialWizardData);
    setIsSubmitting(false);
  }, []);

  /**
   * Handle dialog close
   */
  const handleClose = useCallback(() => {
    resetWizard();
    onOpenChange(false);
    onCancel?.();
  }, [resetWizard, onOpenChange, onCancel]);

  /**
   * Validate current step
   */
  const validateStep = useCallback((): boolean => {
    switch (step) {
      case 'inputs':
        return !!(
          data.title.trim() &&
          data.gradeLevel &&
          data.subject &&
          data.topic.trim() &&
          data.durationDays > 0 &&
          data.startDate
        );
      case 'standards':
        return data.standards.length > 0;
      case 'preview':
        return true;
      case 'confirm':
        return true;
      default:
        return false;
    }
  }, [step, data]);

  /**
   * Navigate to next step
   */
  const handleNext = useCallback(() => {
    if (!validateStep()) return;

    const stepOrder: WizardStep[] = ['inputs', 'standards', 'preview', 'confirm'];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex < stepOrder.length - 1) {
      setStep(stepOrder[currentIndex + 1]);
    }
  }, [step, validateStep]);

  /**
   * Navigate to previous step
   */
  const handleBack = useCallback(() => {
    const stepOrder: WizardStep[] = ['inputs', 'standards', 'preview', 'confirm'];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      setStep(stepOrder[currentIndex - 1]);
    }
  }, [step]);

  /**
   * Submit the unit plan
   * Requirement 2.5: Populate calendar with lesson placeholders
   */
  const handleSubmit = useCallback(async () => {
    if (!data.startDate) return;

    setIsSubmitting(true);
    try {
      const input: UnitPlanInput = {
        title: data.title,
        gradeLevel: data.gradeLevel,
        subject: data.subject,
        topic: data.topic,
        standards: data.standards,
        durationDays: data.durationDays,
        startDate: data.startDate,
      };

      const unitPlan = await createUnitPlan(input);

      if (unitPlan) {
        toast({
          title: 'Plano de unidade criado',
          description: `"${unitPlan.title}" foi criado com ${unitPlan.durationDays} dias de aulas.`,
        });
        onComplete(unitPlan);
        handleClose();
      } else {
        throw new Error('Falha ao criar plano de unidade');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: 'Erro ao criar plano',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [data, createUnitPlan, toast, onComplete, handleClose]);

  /**
   * Render step content
   */
  const renderStepContent = () => {
    switch (step) {
      case 'inputs':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Preencha as informações básicas do plano de unidade.
            </p>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título do Plano *</Label>
              <Input
                id="title"
                placeholder="Ex: Frações e Números Decimais"
                value={data.title}
                onChange={(e) => updateData({ title: e.target.value })}
              />
            </div>

            {/* Grade Level and Subject Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Grade Level - Requirement 2.1 */}
              <div className="space-y-2">
                <Label>Ano Escolar *</Label>
                <Select
                  value={data.gradeLevel}
                  onValueChange={(value) => updateData({ gradeLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject - Requirement 2.1 */}
              <div className="space-y-2">
                <Label>Disciplina *</Label>
                <Select
                  value={data.subject}
                  onValueChange={(value) => updateData({ subject: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((subject) => (
                      <SelectItem key={subject.value} value={subject.value}>
                        {subject.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Topic - Requirement 2.1 */}
            <div className="space-y-2">
              <Label htmlFor="topic">Tópico Principal *</Label>
              <Input
                id="topic"
                placeholder="Ex: Operações com frações"
                value={data.topic}
                onChange={(e) => updateData({ topic: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descreva brevemente os objetivos desta unidade..."
                value={data.description}
                onChange={(e) => updateData({ description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Duration and Start Date Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Duration - Requirement 2.1 */}
              <div className="space-y-2">
                <Label>Duração *</Label>
                <Select
                  value={data.durationDays.toString()}
                  onValueChange={(value) => updateData({ durationDays: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label>Data de Início *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !data.startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {data.startDate ? (
                        format(data.startDate, 'PPP', { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={data.startDate}
                      onSelect={(date) => updateData({ startDate: date })}
                      locale={ptBR}
                      disabled={(date) => {
                        const day = date.getDay();
                        return day === 0 || day === 6; // Disable weekends
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        );

      case 'standards':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecione os padrões curriculares (BNCC) que serão trabalhados nesta unidade.
            </p>

            {/* Standards Selector - Requirement 2.1 */}
            <StandardsSelector
              framework="bncc"
              gradeLevel={data.gradeLevel}
              subject={data.subject}
              selectedStandards={data.standards}
              onSelect={(standards) => updateData({ standards })}
              maxSelections={10}
            />
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Revise as informações do plano de unidade antes de criar.
            </p>

            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Título</p>
                  <p className="font-medium">{data.title}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tópico</p>
                  <p className="font-medium">{data.topic}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ano Escolar</p>
                  <p className="font-medium">{data.gradeLevel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Disciplina</p>
                  <p className="font-medium">{data.subject}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duração</p>
                  <p className="font-medium">{data.durationDays} dias</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Data de Início</p>
                  <p className="font-medium">
                    {data.startDate
                      ? format(data.startDate, 'PPP', { locale: ptBR })
                      : '-'}
                  </p>
                </div>
              </div>

              {data.description && (
                <div>
                  <p className="text-xs text-muted-foreground">Descrição</p>
                  <p className="text-sm">{data.description}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Padrões Selecionados ({data.standards.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {data.standards.map((code) => (
                    <span
                      key={code}
                      className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded font-mono"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-4 text-center py-8">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Pronto para criar!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Clique em "Criar Plano" para finalizar a criação do plano de unidade.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                Serão criados <strong>{data.durationDays} dias</strong> de aulas
              </p>
              <p>
                com <strong>{data.standards.length} padrões</strong> curriculares
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Plano de Unidade</DialogTitle>
          <DialogDescription>
            Crie um plano de unidade com múltiplos dias de aula alinhados aos padrões curriculares.
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} steps={steps} />

        {/* Step Content */}
        <div className="min-h-[300px]">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={step === 'inputs' ? handleClose : handleBack}
            disabled={isSubmitting}
          >
            {step === 'inputs' ? (
              'Cancelar'
            ) : (
              <>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </>
            )}
          </Button>

          {step === 'confirm' ? (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Criar Plano
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!validateStep()}>
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UnitPlanWizard;
