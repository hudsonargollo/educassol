import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { STAGGER_PARENT, FADE_UP_ITEM } from '@/lib/motion';
import { RubricCriterionEditor } from './RubricCriterionEditor';
import { AccessControlGuard } from './AccessControlGuard';
import { validateRubric, type Rubric, type RubricQuestion } from '@/lib/assessment/rubric';
import type { ExamAccessContext } from '@/lib/assessment/access-control';

export interface RubricDesignerProps {
  examId: string;
  initialRubric?: Rubric;
  onSave: (rubric: Rubric) => void;
  onCancel: () => void;
  /** Exam context for access control (Requirements: 7.1, 7.2) */
  examContext?: ExamAccessContext;
  /** Callback when access is denied */
  onAccessDenied?: (reason: string) => void;
  /** Callback to navigate to login */
  onLoginRequired?: () => void;
}

interface SortableCriterionProps {
  id: string;
  criterion: RubricQuestion;
  index: number;
  onChange: (criterion: RubricQuestion) => void;
  onRemove: () => void;
}

function SortableCriterion({
  id,
  criterion,
  index,
  onChange,
  onRemove,
}: SortableCriterionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 cursor-grab active:cursor-grabbing z-10 hidden md:block"
        aria-label={`Arrastar para reordenar critério ${index + 1}`}
        role="button"
        tabIndex={0}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <RubricCriterionEditor
        criterion={criterion}
        index={index}
        onChange={onChange}
        onRemove={onRemove}
      />
    </div>
  );
}


/**
 * RubricDesigner component for creating and managing grading rubrics.
 * Provides a wizard-style interface with title, description, and criteria list.
 * Supports drag-and-drop reordering, auto-calculates total points, and validates using validateRubric().
 * Responsive design for mobile devices with proper accessibility.
 * 
 * Requirements: 1.1, 1.4, 1.5, 10.1, 10.2, 10.3, 10.4, 10.5
 */
export function RubricDesigner({
  examId,
  initialRubric,
  onSave,
  onCancel,
  examContext,
  onAccessDenied,
  onLoginRequired,
}: RubricDesignerProps) {
  const [title, setTitle] = useState(initialRubric?.title || '');
  const [gradingInstructions, setGradingInstructions] = useState(
    initialRubric?.grading_instructions || ''
  );
  const [criteria, setCriteria] = useState<RubricQuestion[]>(
    initialRubric?.questions || []
  );
  const [errors, setErrors] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Auto-calculate total points (Requirement 1.4)
  const totalPoints = useMemo(() => {
    return criteria.reduce((sum, c) => sum + (c.max_points || 0), 0);
  }, [criteria]);

  // Generate unique IDs for sortable items
  const criteriaIds = useMemo(() => {
    return criteria.map((_, index) => `criterion-${index}`);
  }, [criteria]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCriteria((items) => {
        const oldIndex = criteriaIds.indexOf(active.id as string);
        const newIndex = criteriaIds.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, [criteriaIds]);

  const addCriterion = useCallback(() => {
    const newCriterion: RubricQuestion = {
      number: `Q${criteria.length + 1}`,
      topic: '',
      max_points: 10,
      expected_answer: '',
      keywords: [],
    };
    setCriteria((prev) => [...prev, newCriterion]);
  }, [criteria.length]);

  const updateCriterion = useCallback((index: number, updated: RubricQuestion) => {
    setCriteria((prev) => {
      const newCriteria = [...prev];
      newCriteria[index] = updated;
      return newCriteria;
    });
  }, []);

  const removeCriterion = useCallback((index: number) => {
    setCriteria((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(() => {
    const rubric: Rubric = {
      title,
      total_points: totalPoints,
      questions: criteria,
      grading_instructions: gradingInstructions || undefined,
    };

    // Validate using existing validateRubric function (Requirement 1.5)
    const result = validateRubric(rubric);

    if (!result.success) {
      const errorMessages = result.errors?.map((e) => e.message) || ['Validation failed'];
      setErrors(errorMessages);
      return;
    }

    setErrors([]);
    onSave(result.data!);
  }, [title, totalPoints, criteria, gradingInstructions, onSave]);

  // Content to be wrapped with AccessControlGuard
  const content = (
    <motion.div
      initial="hidden"
      animate="show"
      variants={STAGGER_PARENT}
      className="space-y-4 md:space-y-6"
      role="form"
      aria-label="Designer de rubrica"
    >
      <motion.div variants={FADE_UP_ITEM}>
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-lg md:text-xl">Designer de Rubrica</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Crie uma rubrica de avaliação com critérios e valores de pontuação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rubric-title" className="text-sm">
                Título da Rubrica <span className="text-destructive" aria-hidden="true">*</span>
                <span className="sr-only">(obrigatório)</span>
              </Label>
              <Input
                id="rubric-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Rubrica de Avaliação de Redação"
                aria-required="true"
                className="text-sm md:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grading-instructions" className="text-sm">
                Instruções de Correção (Opcional)
              </Label>
              <Textarea
                id="grading-instructions"
                value={gradingInstructions}
                onChange={(e) => setGradingInstructions(e.target.value)}
                placeholder="Instruções gerais para correção..."
                rows={3}
                className="text-sm md:text-base"
              />
            </div>

            <div className="flex items-center justify-between pt-3 md:pt-4 border-t">
              <div className="text-xs md:text-sm text-muted-foreground">
                Pontuação Total:{' '}
                <span className="font-semibold text-foreground" aria-live="polite">{totalPoints}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={FADE_UP_ITEM}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base md:text-lg font-semibold">Critérios</h3>
          <Button onClick={addCriterion} size="sm" aria-label="Adicionar novo critério">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Adicionar Critério
          </Button>
        </div>

        {criteria.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 md:py-12 text-center px-4">
              <p className="text-xs md:text-sm text-muted-foreground mb-4">
                Nenhum critério adicionado ainda. Adicione seu primeiro critério para começar.
              </p>
              <Button onClick={addCriterion} variant="outline" aria-label="Adicionar primeiro critério">
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                Adicionar Primeiro Critério
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={criteriaIds}
              strategy={verticalListSortingStrategy}
            >
              <motion.div
                variants={STAGGER_PARENT}
                initial="hidden"
                animate="show"
                className="space-y-3 md:space-y-4 md:pl-8"
                role="list"
                aria-label="Lista de critérios"
              >
                {criteria.map((criterion, index) => (
                  <SortableCriterion
                    key={criteriaIds[index]}
                    id={criteriaIds[index]}
                    criterion={criterion}
                    index={index}
                    onChange={(updated) => updateCriterion(index, updated)}
                    onRemove={() => removeCriterion(index)}
                  />
                ))}
              </motion.div>
            </SortableContext>
          </DndContext>
        )}
      </motion.div>

      {errors.length > 0 && (
        <motion.div
          variants={FADE_UP_ITEM}
          className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 md:p-4"
          role="alert"
          aria-live="assertive"
        >
          <h4 className="font-medium text-destructive mb-2 text-sm md:text-base">Erros de Validação</h4>
          <ul className="list-disc list-inside text-xs md:text-sm text-destructive">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </motion.div>
      )}

      <motion.div variants={FADE_UP_ITEM} className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
        <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto" aria-label="Cancelar criação de rubrica">
          <X className="h-4 w-4 mr-2" aria-hidden="true" />
          Cancelar
        </Button>
        <Button onClick={handleSave} className="w-full sm:w-auto" aria-label="Salvar rubrica">
          <Save className="h-4 w-4 mr-2" aria-hidden="true" />
          Salvar Rubrica
        </Button>
      </motion.div>
    </motion.div>
  );

  // If examContext is provided, wrap with AccessControlGuard for exam-level access
  // Requirements: 7.1 - Verify educator role before showing grading features
  // Requirements: 7.2 - Verify exam ownership before grading
  if (examContext) {
    return (
      <AccessControlGuard
        requireEducator={true}
        examContext={examContext}
        accessType="update"
        onAccessDenied={onAccessDenied}
        onLoginRequired={onLoginRequired}
      >
        {content}
      </AccessControlGuard>
    );
  }

  // Otherwise, just require educator role
  return (
    <AccessControlGuard
      requireEducator={true}
      onAccessDenied={onAccessDenied}
      onLoginRequired={onLoginRequired}
    >
      {content}
    </AccessControlGuard>
  );
}

export default RubricDesigner;
