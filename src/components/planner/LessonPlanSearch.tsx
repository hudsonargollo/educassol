/**
 * LessonPlanSearch Component
 * 
 * Search bar for filtering lesson plans by topic, standard, and date range.
 * 
 * Requirements:
 * - 13.4: Support searching past lesson plans by topic, standard, or date range
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  X,
  CalendarIcon,
  Filter,
  Loader2,
  FileText,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { LessonStatus } from '@/lib/instructional/lesson-plan';

/**
 * Search result item
 */
export interface SearchResult {
  id: string;
  topic: string;
  date: Date;
  subject: string;
  gradeLevel: string;
  standards: string[];
  status: LessonStatus;
  learningObjective: string;
}

/**
 * Search filters
 */
export interface SearchFilters {
  query: string;
  standard?: string;
  startDate?: Date;
  endDate?: Date;
  status?: LessonStatus;
}

/**
 * Props for LessonPlanSearch component
 */
export interface LessonPlanSearchProps {
  /** Callback when a search result is selected */
  onSelect?: (result: SearchResult) => void;
  /** Callback when search results change */
  onResultsChange?: (results: SearchResult[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether to show inline results */
  showInlineResults?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Database row type
 */
interface LessonPlanRow {
  id: string;
  topic: string;
  date: string;
  subject: string;
  grade_level: string;
  standards: string[];
  status: LessonStatus;
  learning_objective: string;
}

/**
 * Convert database row to search result
 */
function rowToSearchResult(row: LessonPlanRow): SearchResult {
  return {
    id: row.id,
    topic: row.topic,
    date: new Date(row.date),
    subject: row.subject,
    gradeLevel: row.grade_level,
    standards: row.standards,
    status: row.status,
    learningObjective: row.learning_objective,
  };
}

/**
 * LessonPlanSearch component
 * Requirement 13.4: Filter by topic, standard, date range
 */
export function LessonPlanSearch({
  onSelect,
  onResultsChange,
  placeholder = 'Buscar aulas...',
  showInlineResults = true,
  className,
}: LessonPlanSearchProps): React.ReactElement {
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Perform search
   */
  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    const { query, standard, startDate, endDate, status } = searchFilters;

    // Don't search if no filters are set
    if (!query && !standard && !startDate && !endDate && !status) {
      setResults([]);
      onResultsChange?.([]);
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setResults([]);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let queryBuilder = (supabase as any)
        .from('lesson_plans')
        .select('id, topic, date, subject, grade_level, standards, status, learning_objective')
        .eq('user_id', user.id)
        .is('archived_at', null)
        .order('date', { ascending: false })
        .limit(20);

      // Apply text search on topic
      if (query) {
        queryBuilder = queryBuilder.ilike('topic', `%${query}%`);
      }

      // Apply standard filter
      if (standard) {
        queryBuilder = queryBuilder.contains('standards', [standard]);
      }

      // Apply date range filters
      if (startDate) {
        queryBuilder = queryBuilder.gte('date', startDate.toISOString().split('T')[0]);
      }
      if (endDate) {
        queryBuilder = queryBuilder.lte('date', endDate.toISOString().split('T')[0]);
      }

      // Apply status filter
      if (status) {
        queryBuilder = queryBuilder.eq('status', status);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      const searchResults = ((data as LessonPlanRow[]) || []).map(rowToSearchResult);
      setResults(searchResults);
      onResultsChange?.(searchResults);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [onResultsChange]);

  /**
   * Handle query change with debounce
   */
  const handleQueryChange = useCallback((value: string) => {
    const newFilters = { ...filters, query: value };
    setFilters(newFilters);

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(newFilters);
    }, 300);
  }, [filters, performSearch]);

  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback((key: keyof SearchFilters, value: unknown) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    performSearch(newFilters);
  }, [filters, performSearch]);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({ query: '' });
    setResults([]);
    onResultsChange?.([]);
    inputRef.current?.focus();
  }, [onResultsChange]);

  /**
   * Handle result selection
   */
  const handleSelect = useCallback((result: SearchResult) => {
    onSelect?.(result);
    setIsOpen(false);
  }, [onSelect]);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = filters.standard || filters.startDate || filters.endDate || filters.status;

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={filters.query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="pl-9 pr-8"
          />
          {(filters.query || hasActiveFilters) && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={clearFilters}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Filter Toggle */}
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(hasActiveFilters && 'border-primary text-primary')}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Filtros</h4>

              {/* Standard Filter */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Padrão/Competência</label>
                <Input
                  placeholder="Ex: EF01MA01"
                  value={filters.standard || ''}
                  onChange={(e) => handleFilterChange('standard', e.target.value || undefined)}
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Data inicial</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {filters.startDate ? (
                          format(filters.startDate, 'dd/MM/yy', { locale: ptBR })
                        ) : (
                          <span className="text-muted-foreground">Início</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.startDate}
                        onSelect={(date) => handleFilterChange('startDate', date)}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Data final</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {filters.endDate ? (
                          format(filters.endDate, 'dd/MM/yy', { locale: ptBR })
                        ) : (
                          <span className="text-muted-foreground">Fim</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.endDate}
                        onSelect={(date) => handleFilterChange('endDate', date)}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Status</label>
                <div className="flex flex-wrap gap-1">
                  {(['draft', 'planned', 'in-progress', 'completed'] as LessonStatus[]).map((status) => (
                    <Badge
                      key={status}
                      variant={filters.status === status ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleFilterChange('status', filters.status === status ? undefined : status)}
                    >
                      {status === 'draft' && 'Rascunho'}
                      {status === 'planned' && 'Planejada'}
                      {status === 'in-progress' && 'Em andamento'}
                      {status === 'completed' && 'Concluída'}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setFilters({ query: filters.query });
                    performSearch({ query: filters.query });
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1 mt-2">
          {filters.standard && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Tag className="h-3 w-3" />
              {filters.standard}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('standard', undefined)}
              />
            </Badge>
          )}
          {filters.startDate && (
            <Badge variant="secondary" className="text-xs gap-1">
              <CalendarIcon className="h-3 w-3" />
              De: {format(filters.startDate, 'dd/MM', { locale: ptBR })}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('startDate', undefined)}
              />
            </Badge>
          )}
          {filters.endDate && (
            <Badge variant="secondary" className="text-xs gap-1">
              <CalendarIcon className="h-3 w-3" />
              Até: {format(filters.endDate, 'dd/MM', { locale: ptBR })}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('endDate', undefined)}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="text-xs gap-1">
              {filters.status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('status', undefined)}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Inline Results */}
      {showInlineResults && isOpen && (filters.query || hasActiveFilters) && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border rounded-lg shadow-lg">
          <ScrollArea className="max-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma aula encontrada
                </p>
              </div>
            ) : (
              <div className="p-1">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className={cn(
                      'w-full text-left p-3 rounded-md transition-colors',
                      'hover:bg-accent focus:bg-accent focus:outline-none'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{result.topic}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {result.subject} • {result.gradeLevel} • {format(result.date, 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs shrink-0',
                          result.status === 'completed' && 'border-emerald-500 text-emerald-600',
                          result.status === 'in-progress' && 'border-amber-500 text-amber-600',
                          result.status === 'planned' && 'border-blue-500 text-blue-600'
                        )}
                      >
                        {result.status === 'draft' && 'Rascunho'}
                        {result.status === 'planned' && 'Planejada'}
                        {result.status === 'in-progress' && 'Em andamento'}
                        {result.status === 'completed' && 'Concluída'}
                      </Badge>
                    </div>
                    {result.standards.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {result.standards.slice(0, 3).map((std) => (
                          <Badge key={std} variant="secondary" className="text-xs">
                            {std}
                          </Badge>
                        ))}
                        {result.standards.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{result.standards.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default LessonPlanSearch;
