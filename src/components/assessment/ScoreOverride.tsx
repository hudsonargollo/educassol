import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, RotateCcw, Check } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { EDUCASSOL_COLORS } from '@/lib/colors';
import { EDUCASSOL_SPRING } from '@/lib/motion';

/**
 * Props for ScoreOverride component
 */
export interface ScoreOverrideProps {
  /** Question number/identifier */
  questionNumber: string;
  /** Original AI-generated score */
  aiScore: number;
  /** Maximum points for this question */
  maxPoints: number;
  /** Current override score (null if not overridden) */
  overrideScore: number | null;
  /** Callback when score is overridden */
  onOverride: (score: number) => void;
  /** Optional class name */
  className?: string;
}

/**
 * ScoreOverride Component
 * 
 * Allows educators to adjust AI-generated scores using a slider.
 * Displays both AI score and override value, tracks override status for audit.
 * Responsive design for mobile devices with proper accessibility.
 * 
 * Requirements: 5.1, 5.2, 5.4, 8.5, 10.1, 10.2, 10.3, 10.4, 10.5
 */
export function ScoreOverride({
  questionNumber,
  aiScore,
  maxPoints,
  overrideScore,
  onOverride,
  className,
}: ScoreOverrideProps) {
  const [localScore, setLocalScore] = useState(overrideScore ?? aiScore);
  const [isEditing, setIsEditing] = useState(false);

  const hasOverride = overrideScore !== null && overrideScore !== aiScore;
  const effectiveScore = overrideScore ?? aiScore;

  // Sync local score with props
  useEffect(() => {
    setLocalScore(overrideScore ?? aiScore);
  }, [overrideScore, aiScore]);

  // Get color based on score percentage
  const getScoreColor = (score: number) => {
    const percentage = (score / maxPoints) * 100;
    if (percentage >= 80) return EDUCASSOL_COLORS.success;
    if (percentage >= 50) return EDUCASSOL_COLORS.accent;
    return EDUCASSOL_COLORS.error;
  };

  // Handle slider change
  const handleSliderChange = useCallback((value: number[]) => {
    setLocalScore(value[0]);
  }, []);

  // Apply override
  const handleApplyOverride = useCallback(() => {
    onOverride(localScore);
    setIsEditing(false);
  }, [localScore, onOverride]);

  // Reset to AI score
  const handleReset = useCallback(() => {
    setLocalScore(aiScore);
    onOverride(aiScore);
    setIsEditing(false);
  }, [aiScore, onOverride]);

  // Cancel editing
  const handleCancel = useCallback(() => {
    setLocalScore(overrideScore ?? aiScore);
    setIsEditing(false);
  }, [overrideScore, aiScore]);

  return (
    <div 
      className={cn('space-y-2 md:space-y-3', className)}
      role="group"
      aria-label={`Ajuste de nota para questão ${questionNumber}`}
    >
      {/* Header with scores */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Ajustar Nota
        </Label>
        <div className="flex items-center gap-2">
          {hasOverride && (
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ borderColor: EDUCASSOL_COLORS.accent, color: EDUCASSOL_COLORS.accent }}
            >
              <Edit3 className="h-3 w-3 mr-1" aria-hidden="true" />
              Ajustado
            </Badge>
          )}
        </div>
      </div>

      {/* Score Display */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* AI Score */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">IA</p>
          <motion.div
            className="text-base md:text-lg font-bold"
            style={{ color: getScoreColor(aiScore) }}
            initial={{ scale: 1 }}
            animate={{ scale: hasOverride ? 0.9 : 1, opacity: hasOverride ? 0.5 : 1 }}
            transition={EDUCASSOL_SPRING}
            aria-label={`Nota da IA: ${aiScore}`}
          >
            {aiScore}
          </motion.div>
        </div>

        {/* Arrow indicator */}
        {(hasOverride || isEditing) && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-muted-foreground"
            aria-hidden="true"
          >
            →
          </motion.div>
        )}

        {/* Override/Current Score */}
        {(hasOverride || isEditing) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={EDUCASSOL_SPRING}
            className="text-center"
          >
            <p className="text-xs text-muted-foreground mb-1">
              {isEditing ? 'Novo' : 'Ajustado'}
            </p>
            <div 
              className="text-lg md:text-xl font-bold"
              style={{ color: getScoreColor(localScore) }}
              aria-label={`${isEditing ? 'Nova nota' : 'Nota ajustada'}: ${localScore}`}
            >
              {localScore}
            </div>
          </motion.div>
        )}

        {/* Max Points */}
        <div className="text-center ml-auto">
          <p className="text-xs text-muted-foreground mb-1">Máx</p>
          <div className="text-base md:text-lg font-medium text-muted-foreground">
            {maxPoints}
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <Slider
          value={[localScore]}
          onValueChange={handleSliderChange}
          max={maxPoints}
          min={0}
          step={0.5}
          disabled={!isEditing && !hasOverride}
          className={cn(
            'cursor-pointer',
            !isEditing && !hasOverride && 'opacity-50'
          )}
          onPointerDown={() => !isEditing && setIsEditing(true)}
          aria-label={`Ajustar nota da questão ${questionNumber}. Valor atual: ${localScore} de ${maxPoints}`}
          aria-valuemin={0}
          aria-valuemax={maxPoints}
          aria-valuenow={localScore}
        />
        
        {/* Slider Labels */}
        <div className="flex justify-between text-xs text-muted-foreground" aria-hidden="true">
          <span>0</span>
          <span>{maxPoints / 2}</span>
          <span>{maxPoints}</span>
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 pt-2"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="flex-1"
            aria-label="Cancelar ajuste de nota"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleApplyOverride}
            className="flex-1"
            style={{ backgroundColor: EDUCASSOL_COLORS.primary }}
            aria-label={`Aplicar nota ${localScore} para questão ${questionNumber}`}
          >
            <Check className="h-4 w-4 mr-1" aria-hidden="true" />
            Aplicar
          </Button>
        </motion.div>
      )}

      {/* Reset Button (when has override but not editing) */}
      {hasOverride && !isEditing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-end"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs"
            aria-label={`Restaurar nota da IA (${aiScore}) para questão ${questionNumber}`}
          >
            <RotateCcw className="h-3 w-3 mr-1" aria-hidden="true" />
            Restaurar nota da IA
          </Button>
        </motion.div>
      )}

      {/* Edit Button (when no override and not editing) */}
      {!hasOverride && !isEditing && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="w-full"
          aria-label={`Ajustar nota da questão ${questionNumber}`}
        >
          <Edit3 className="h-4 w-4 mr-2" aria-hidden="true" />
          Ajustar Nota
        </Button>
      )}
    </div>
  );
}

export default ScoreOverride;
