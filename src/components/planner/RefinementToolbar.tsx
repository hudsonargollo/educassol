/**
 * RefinementToolbar Component
 * 
 * Context menu for inline content refinement with text selection.
 * Supports Rewrite, Simplify, Engage, and Expand actions.
 * 
 * Requirements:
 * - 10.1: Display context menu with refinement options on text selection
 * - 10.2: Support "Rewrite", "Simplify", "Make more engaging", and "Expand" actions
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  RefreshCw,
  Minimize2,
  Sparkles,
  Maximize2,
  Loader2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Refinement action types
 * Requirement 10.2: Support these refinement actions
 */
export type RefinementAction = 'rewrite' | 'simplify' | 'engage' | 'expand';

/**
 * Props for the RefinementToolbar component
 */
export interface RefinementToolbarProps {
  /** The selected text to refine */
  selectedText: string;
  /** Position of the toolbar relative to the viewport */
  position: { x: number; y: number };
  /** Whether the toolbar is visible */
  isVisible: boolean;
  /** Callback when a refinement action is requested */
  onRefine: (action: RefinementAction) => Promise<string>;
  /** Callback when the toolbar should be closed */
  onClose: () => void;
  /** Callback when refinement is complete with the result */
  onComplete: (originalText: string, refinedText: string, action: RefinementAction) => void;
  /** Whether a refinement is currently in progress */
  isLoading?: boolean;
  /** CSS class name */
  className?: string;
}

/**
 * Configuration for each refinement action
 */
interface RefinementActionConfig {
  action: RefinementAction;
  label: string;
  icon: React.ElementType;
  description: string;
  shortcut?: string;
}

const REFINEMENT_ACTIONS: RefinementActionConfig[] = [
  {
    action: 'rewrite',
    label: 'Rewrite',
    icon: RefreshCw,
    description: 'Rephrase the selected text',
    shortcut: 'R',
  },
  {
    action: 'simplify',
    label: 'Simplify',
    icon: Minimize2,
    description: 'Make the text easier to understand',
    shortcut: 'S',
  },
  {
    action: 'engage',
    label: 'Engage',
    icon: Sparkles,
    description: 'Make the text more engaging',
    shortcut: 'E',
  },
  {
    action: 'expand',
    label: 'Expand',
    icon: Maximize2,
    description: 'Add more detail to the text',
    shortcut: 'X',
  },
];

/**
 * RefinementToolbar Component
 * 
 * A floating toolbar that appears when text is selected, providing
 * quick access to AI-powered content refinement actions.
 */
export function RefinementToolbar({
  selectedText,
  position,
  isVisible,
  onRefine,
  onClose,
  onComplete,
  isLoading = false,
  className,
}: RefinementToolbarProps) {
  const [activeAction, setActiveAction] = useState<RefinementAction | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  /**
   * Handle refinement action click
   */
  const handleActionClick = useCallback(async (action: RefinementAction) => {
    if (isLoading || !selectedText) return;

    setActiveAction(action);
    
    try {
      const refinedText = await onRefine(action);
      onComplete(selectedText, refinedText, action);
    } catch (error) {
      console.error('Refinement failed:', error);
    } finally {
      setActiveAction(null);
    }
  }, [isLoading, selectedText, onRefine, onComplete]);

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on Escape
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Handle action shortcuts (Alt + key)
      if (e.altKey && !isLoading) {
        const action = REFINEMENT_ACTIONS.find(
          a => a.shortcut?.toLowerCase() === e.key.toLowerCase()
        );
        if (action) {
          e.preventDefault();
          handleActionClick(action.action);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isLoading, onClose, handleActionClick]);

  /**
   * Handle click outside to close
   */
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        // Small delay to allow action clicks to process
        setTimeout(() => {
          if (!isLoading) {
            onClose();
          }
        }, 100);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, isLoading, onClose]);

  if (!isVisible || !selectedText) {
    return null;
  }

  // Calculate position to keep toolbar in viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 300),
    y: Math.max(position.y - 50, 10),
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={toolbarRef}
        className={cn(
          'fixed z-50 flex items-center gap-1 p-1 bg-popover border rounded-lg shadow-lg',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          className
        )}
        style={{
          left: `${adjustedPosition.x}px`,
          top: `${adjustedPosition.y}px`,
        }}
      >
        {REFINEMENT_ACTIONS.map((config) => {
          const Icon = config.icon;
          const isActive = activeAction === config.action;

          return (
            <Tooltip key={config.action}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 px-2 gap-1.5',
                    isActive && 'bg-examai-purple-500/10 text-examai-purple-500'
                  )}
                  onClick={() => handleActionClick(config.action)}
                  disabled={isLoading}
                >
                  {isActive && isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span className="text-xs font-medium">{config.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p>{config.description}</p>
                {config.shortcut && (
                  <p className="text-muted-foreground mt-1">
                    Alt + {config.shortcut}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Close button */}
        <div className="w-px h-6 bg-border mx-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <p>Close (Esc)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

/**
 * Hook for managing text selection and refinement toolbar state
 */
export interface UseRefinementToolbarOptions {
  /** The container element to watch for text selection */
  containerRef: React.RefObject<HTMLElement>;
  /** Whether the refinement toolbar is enabled */
  enabled?: boolean;
}

export interface UseRefinementToolbarReturn {
  /** The currently selected text */
  selectedText: string;
  /** Position for the toolbar */
  position: { x: number; y: number };
  /** Whether the toolbar should be visible */
  isVisible: boolean;
  /** Show the toolbar */
  show: () => void;
  /** Hide the toolbar */
  hide: () => void;
  /** Clear the selection */
  clearSelection: () => void;
}

export function useRefinementToolbar({
  containerRef,
  enabled = true,
}: UseRefinementToolbarOptions): UseRefinementToolbarReturn {
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Handle text selection
   */
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      
      if (!selection || selection.isCollapsed) {
        // Don't hide immediately - let click handlers process first
        return;
      }

      const text = selection.toString().trim();
      
      if (!text) {
        return;
      }

      // Check if selection is within our container
      const range = selection.getRangeAt(0);
      const container = containerRef.current;
      
      if (!container?.contains(range.commonAncestorContainer)) {
        return;
      }

      // Get position for toolbar
      const rect = range.getBoundingClientRect();
      
      setSelectedText(text);
      setPosition({
        x: rect.left + rect.width / 2 - 150, // Center the toolbar
        y: rect.top + window.scrollY,
      });
      setIsVisible(true);
    };

    const handleMouseUp = () => {
      // Small delay to ensure selection is complete
      setTimeout(handleSelectionChange, 10);
    };

    const container = containerRef.current;
    container.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enabled, containerRef]);

  const show = useCallback(() => setIsVisible(true), []);
  const hide = useCallback(() => setIsVisible(false), []);
  
  const clearSelection = useCallback(() => {
    setSelectedText('');
    setIsVisible(false);
    window.getSelection()?.removeAllRanges();
  }, []);

  return {
    selectedText,
    position,
    isVisible,
    show,
    hide,
    clearSelection,
  };
}

/**
 * Undo history item for refinement actions
 */
export interface RefinementHistoryItem {
  id: string;
  originalText: string;
  refinedText: string;
  action: RefinementAction;
  timestamp: Date;
}

/**
 * Hook for managing refinement undo history
 * Requirement 10.4: Maintain undo history for refinement actions
 */
export interface UseRefinementHistoryOptions {
  /** Maximum number of history items to keep */
  maxHistory?: number;
}

export interface UseRefinementHistoryReturn {
  /** The undo history stack */
  history: RefinementHistoryItem[];
  /** Whether undo is available */
  canUndo: boolean;
  /** Add a refinement to history */
  addToHistory: (item: Omit<RefinementHistoryItem, 'id' | 'timestamp'>) => void;
  /** Undo the last refinement */
  undo: () => RefinementHistoryItem | null;
  /** Clear all history */
  clearHistory: () => void;
}

export function useRefinementHistory({
  maxHistory = 50,
}: UseRefinementHistoryOptions = {}): UseRefinementHistoryReturn {
  const [history, setHistory] = useState<RefinementHistoryItem[]>([]);

  const canUndo = history.length > 0;

  const addToHistory = useCallback((item: Omit<RefinementHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: RefinementHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    setHistory(prev => {
      const updated = [newItem, ...prev];
      return updated.slice(0, maxHistory);
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    if (history.length === 0) return null;

    const [lastItem, ...rest] = history;
    setHistory(rest);
    return lastItem;
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Handle Ctrl+Z keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && canUndo) {
        e.preventDefault();
        undo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, undo]);

  return {
    history,
    canUndo,
    addToHistory,
    undo,
    clearHistory,
  };
}

export default RefinementToolbar;
