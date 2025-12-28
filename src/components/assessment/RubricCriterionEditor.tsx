import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { FADE_UP_ITEM } from '@/lib/motion';
import type { RubricQuestion } from '@/lib/assessment/rubric';

export interface RubricCriterionEditorProps {
  criterion: RubricQuestion;
  index: number;
  onChange: (criterion: RubricQuestion) => void;
  onRemove: () => void;
}

/**
 * RubricCriterionEditor component for editing a single rubric criterion.
 * Provides form fields for name (topic), description, max_points, expected_answer, and keywords.
 * Uses Shadcn UI components and applies fade-up animation on mount.
 * Responsive design for mobile devices with proper accessibility.
 * 
 * Requirements: 1.2 - Validates that criterion has non-empty name, description, and positive max points
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */
export function RubricCriterionEditor({
  criterion,
  index,
  onChange,
  onRemove,
}: RubricCriterionEditorProps) {
  const handleFieldChange = (
    field: keyof RubricQuestion,
    value: string | number | string[]
  ) => {
    onChange({
      ...criterion,
      [field]: value,
    });
  };

  const handleKeywordsChange = (value: string) => {
    // Split by comma and trim whitespace
    const keywords = value
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    handleFieldChange('keywords', keywords);
  };

  return (
    <motion.div variants={FADE_UP_ITEM} role="listitem">
      <Card className="relative">
        <CardContent className="pt-4 md:pt-6">
          <div className="absolute top-3 md:top-4 right-3 md:right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              aria-label={`Remover critério ${index + 1}`}
              className="text-muted-foreground hover:text-destructive h-8 w-8"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="space-y-3 md:space-y-4 pr-10">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <span 
                className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/10 text-primary font-semibold text-xs md:text-sm"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span className="text-xs md:text-sm font-medium text-muted-foreground">
                Critério {index + 1}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor={`criterion-${index}-number`} className="text-xs md:text-sm">
                  Número da Questão <span className="text-destructive" aria-hidden="true">*</span>
                  <span className="sr-only">(obrigatório)</span>
                </Label>
                <Input
                  id={`criterion-${index}-number`}
                  value={criterion.number}
                  onChange={(e) => handleFieldChange('number', e.target.value)}
                  placeholder="ex: Q1, 1a"
                  aria-required="true"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`criterion-${index}-max-points`} className="text-xs md:text-sm">
                  Pontuação Máxima <span className="text-destructive" aria-hidden="true">*</span>
                  <span className="sr-only">(obrigatório)</span>
                </Label>
                <Input
                  id={`criterion-${index}-max-points`}
                  type="number"
                  min={1}
                  value={criterion.max_points}
                  onChange={(e) =>
                    handleFieldChange('max_points', parseInt(e.target.value) || 0)
                  }
                  placeholder="10"
                  aria-required="true"
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`criterion-${index}-topic`} className="text-xs md:text-sm">
                Tópico / Nome <span className="text-destructive" aria-hidden="true">*</span>
                <span className="sr-only">(obrigatório)</span>
              </Label>
              <Input
                id={`criterion-${index}-topic`}
                value={criterion.topic}
                onChange={(e) => handleFieldChange('topic', e.target.value)}
                placeholder="ex: Resolução de Problemas, Análise Crítica"
                aria-required="true"
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`criterion-${index}-expected-answer`} className="text-xs md:text-sm">
                Resposta Esperada
              </Label>
              <Textarea
                id={`criterion-${index}-expected-answer`}
                value={criterion.expected_answer || ''}
                onChange={(e) =>
                  handleFieldChange('expected_answer', e.target.value)
                }
                placeholder="Descreva a resposta esperada ou pontos-chave..."
                rows={3}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`criterion-${index}-keywords`} className="text-xs md:text-sm">
                Palavras-chave (separadas por vírgula)
              </Label>
              <Input
                id={`criterion-${index}-keywords`}
                value={criterion.keywords?.join(', ') || ''}
                onChange={(e) => handleKeywordsChange(e.target.value)}
                placeholder="ex: análise, síntese, avaliação"
                className="text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default RubricCriterionEditor;
