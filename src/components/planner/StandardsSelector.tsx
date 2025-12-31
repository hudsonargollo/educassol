import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Check, BookOpen, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Standard interface matching database schema
 */
export interface Standard {
  id: string;
  framework: 'bncc' | 'common-core' | 'teks';
  code: string;
  text: string;
  gradeLevel: string;
  subject: string;
  parentCode: string | null;
}

export interface StandardsSelectorProps {
  framework?: 'bncc' | 'common-core' | 'teks';
  gradeLevel?: string;
  subject?: string;
  selectedStandards: string[];
  onSelect: (standards: string[]) => void;
  maxSelections?: number;
  className?: string;
}

/**
 * Grade level options for BNCC
 */
const GRADE_LEVELS = [
  '1º Ano',
  '2º Ano',
  '3º Ano',
  '4º Ano',
  '5º Ano',
  '6º Ano',
  '7º Ano',
  '8º Ano',
  '9º Ano',
];

/**
 * Subject options for BNCC
 */
const SUBJECTS = [
  'Matemática',
  'Língua Portuguesa',
  'Ciências',
];

/**
 * Transform database row to Standard type
 */
function transformDbToStandard(row: any): Standard {
  return {
    id: row.id,
    framework: row.framework,
    code: row.code,
    text: row.text,
    gradeLevel: row.grade_level,
    subject: row.subject,
    parentCode: row.parent_code,
  };
}

/**
 * StandardsSelector Component
 * 
 * Searchable interface for selecting curriculum standards.
 * Supports filtering by grade level and subject area.
 * Displays full standard text on selection.
 * 
 * Requirements: 11.1, 11.2, 11.3
 */
export function StandardsSelector({
  framework = 'bncc',
  gradeLevel: initialGradeLevel,
  subject: initialSubject,
  selectedStandards,
  onSelect,
  maxSelections = 10,
  className,
}: StandardsSelectorProps) {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState(initialGradeLevel || '');
  const [subjectFilter, setSubjectFilter] = useState(initialSubject || '');
  const [expandedStandard, setExpandedStandard] = useState<string | null>(null);

  /**
   * Fetch standards from database with filters
   * Requirement 11.1: Searchable interface for selecting standards
   * Requirement 11.2: Support filtering by grade level and subject
   */
  const fetchStandards = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use raw query since standards table may not be in generated types yet
      let queryBuilder = supabase
        .from('standards' as any)
        .select('*')
        .eq('framework', framework)
        .order('code', { ascending: true });

      // Apply grade filter
      if (gradeFilter) {
        queryBuilder = queryBuilder.eq('grade_level', gradeFilter);
      }

      // Apply subject filter
      if (subjectFilter) {
        queryBuilder = queryBuilder.eq('subject', subjectFilter);
      }

      // Apply search query (search in code and text)
      if (searchQuery.trim()) {
        queryBuilder = queryBuilder.or(`code.ilike.%${searchQuery}%,text.ilike.%${searchQuery}%`);
      }

      const { data, error } = await queryBuilder.limit(100);

      if (error) throw error;

      setStandards((data || []).map(transformDbToStandard));
    } catch (error) {
      console.error('Error fetching standards:', error);
      setStandards([]);
    } finally {
      setIsLoading(false);
    }
  }, [framework, gradeFilter, subjectFilter, searchQuery]);

  // Fetch standards when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchStandards();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [fetchStandards]);

  // Update filters when props change
  useEffect(() => {
    if (initialGradeLevel) setGradeFilter(initialGradeLevel);
  }, [initialGradeLevel]);

  useEffect(() => {
    if (initialSubject) setSubjectFilter(initialSubject);
  }, [initialSubject]);

  /**
   * Handle standard selection toggle
   */
  const handleToggleStandard = useCallback((code: string) => {
    if (selectedStandards.includes(code)) {
      onSelect(selectedStandards.filter(s => s !== code));
    } else if (selectedStandards.length < maxSelections) {
      onSelect([...selectedStandards, code]);
    }
  }, [selectedStandards, onSelect, maxSelections]);

  /**
   * Remove a selected standard
   */
  const handleRemoveStandard = useCallback((code: string) => {
    onSelect(selectedStandards.filter(s => s !== code));
  }, [selectedStandards, onSelect]);

  /**
   * Get selected standards with full details
   * Requirement 11.3: Display full standard text on selection
   */
  const selectedStandardsDetails = useMemo(() => {
    return standards.filter(s => selectedStandards.includes(s.code));
  }, [standards, selectedStandards]);

  /**
   * Clear all filters
   */
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setGradeFilter('');
    setSubjectFilter('');
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters Row */}
        <div className="flex gap-2 flex-wrap">
          {/* Grade Level Filter - Requirement 11.2 */}
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os anos</SelectItem>
              {GRADE_LEVELS.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Subject Filter - Requirement 11.2 */}
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Disciplina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as disciplinas</SelectItem>
              {SUBJECTS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {(searchQuery || gradeFilter || subjectFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Selected Standards Display - Requirement 11.3 */}
      {selectedStandards.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Selecionados ({selectedStandards.length}/{maxSelections}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedStandards.map((code) => {
              const standard = standards.find(s => s.code === code);
              return (
                <Badge
                  key={code}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/20 group"
                  onClick={() => handleRemoveStandard(code)}
                >
                  {code}
                  <X className="h-3 w-3 ml-1 group-hover:text-destructive" />
                </Badge>
              );
            })}
          </div>
          
          {/* Show full text of selected standards */}
          {selectedStandardsDetails.length > 0 && (
            <div className="mt-3 space-y-2">
              {selectedStandardsDetails.map((standard) => (
                <div
                  key={standard.id}
                  className="p-3 bg-primary/5 rounded-lg border border-primary/20"
                >
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{standard.code}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {standard.text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {standard.gradeLevel} • {standard.subject}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Standards List */}
      <div className="border rounded-lg">
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : standards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <BookOpen className="h-8 w-8 mb-2" />
              <p className="text-sm">Nenhum padrão encontrado</p>
              <p className="text-xs">Tente ajustar os filtros</p>
            </div>
          ) : (
            <div className="divide-y">
              {standards.map((standard) => {
                const isSelected = selectedStandards.includes(standard.code);
                const isExpanded = expandedStandard === standard.id;
                const canSelect = isSelected || selectedStandards.length < maxSelections;

                return (
                  <div
                    key={standard.id}
                    className={cn(
                      'p-3 transition-colors cursor-pointer',
                      isSelected && 'bg-primary/10',
                      !isSelected && canSelect && 'hover:bg-muted/50',
                      !canSelect && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={() => canSelect && handleToggleStandard(standard.code)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Selection Indicator */}
                      <div
                        className={cn(
                          'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5',
                          isSelected
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-muted-foreground/30'
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>

                      {/* Standard Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium">
                            {standard.code}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {standard.gradeLevel}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {standard.subject}
                          </Badge>
                        </div>
                        
                        {/* Standard Text - Requirement 11.3 */}
                        <p
                          className={cn(
                            'text-sm text-muted-foreground mt-1',
                            !isExpanded && 'line-clamp-2'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedStandard(isExpanded ? null : standard.id);
                          }}
                        >
                          {standard.text}
                        </p>
                        
                        {standard.text.length > 150 && (
                          <button
                            className="text-xs text-primary hover:underline mt-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedStandard(isExpanded ? null : standard.id);
                            }}
                          >
                            {isExpanded ? 'Ver menos' : 'Ver mais'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Results Count */}
      <p className="text-xs text-muted-foreground text-center">
        {standards.length} padrão(ões) encontrado(s)
      </p>
    </div>
  );
}

export default StandardsSelector;
