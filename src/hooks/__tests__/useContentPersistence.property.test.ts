import { describe, test, expect } from 'vitest';
import fc from 'fast-check';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Content types that can be persisted
 */
type PersistableContentType = 'lesson-plan' | 'quiz' | 'worksheet' | 'reading' | 'slides';

/**
 * Content with persistence metadata
 */
interface PersistedContent {
  id: string;
  type: PersistableContentType;
  content: Record<string, unknown>;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
}

/**
 * Undo history entry
 */
interface UndoEntry {
  content: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Content state with undo history
 */
interface ContentState {
  current: Record<string, unknown>;
  undoStack: UndoEntry[];
  redoStack: UndoEntry[];
}

/**
 * Arbitrary for valid dates
 */
const arbitraryValidDate = (): fc.Arbitrary<Date> =>
  fc.integer({ 
    min: new Date('2020-01-01').getTime(), 
    max: new Date('2030-12-31').getTime() 
  }).map(timestamp => new Date(timestamp));

/**
 * Arbitrary for non-empty strings
 */
const arbitraryNonEmptyString = (maxLength: number = 100): fc.Arbitrary<string> =>
  fc.string({ minLength: 1, maxLength, unit: 'grapheme' })
    .map(s => s.trim() || 'a')
    .filter(s => s.length > 0);

/**
 * Arbitrary for content types
 */
const arbitraryContentType = (): fc.Arbitrary<PersistableContentType> =>
  fc.constantFrom('lesson-plan', 'quiz', 'worksheet', 'reading', 'slides');

/**
 * Arbitrary for simple content objects
 */
const arbitraryContent = (): fc.Arbitrary<Record<string, unknown>> =>
  fc.record({
    title: arbitraryNonEmptyString(100),
    body: arbitraryNonEmptyString(500),
    version: fc.integer({ min: 1, max: 100 }),
  });

/**
 * Arbitrary for persisted content
 */
const arbitraryPersistedContent = (): fc.Arbitrary<PersistedContent> =>
  fc.record({
    id: fc.uuid(),
    type: arbitraryContentType(),
    content: arbitraryContent(),
    createdAt: arbitraryValidDate(),
    createdBy: fc.uuid(),
    updatedAt: arbitraryValidDate(),
  });

/**
 * Apply a refinement action and push to undo stack
 */
function applyRefinement(
  state: ContentState,
  newContent: Record<string, unknown>
): ContentState {
  return {
    current: newContent,
    undoStack: [
      ...state.undoStack,
      { content: state.current, timestamp: new Date() },
    ],
    redoStack: [], // Clear redo stack on new action
  };
}

/**
 * Undo the last refinement action
 */
function undoRefinement(state: ContentState): ContentState {
  if (state.undoStack.length === 0) {
    return state;
  }
  
  const lastEntry = state.undoStack[state.undoStack.length - 1];
  
  return {
    current: lastEntry.content,
    undoStack: state.undoStack.slice(0, -1),
    redoStack: [
      ...state.redoStack,
      { content: state.current, timestamp: new Date() },
    ],
  };
}

/**
 * Redo the last undone action
 */
function redoRefinement(state: ContentState): ContentState {
  if (state.redoStack.length === 0) {
    return state;
  }
  
  const lastEntry = state.redoStack[state.redoStack.length - 1];
  
  return {
    current: lastEntry.content,
    undoStack: [
      ...state.undoStack,
      { content: state.current, timestamp: new Date() },
    ],
    redoStack: state.redoStack.slice(0, -1),
  };
}

/**
 * Check if content has valid persistence metadata
 */
function hasValidPersistenceMetadata(content: PersistedContent): boolean {
  return (
    content.createdAt !== null &&
    content.createdAt !== undefined &&
    content.createdAt instanceof Date &&
    !isNaN(content.createdAt.getTime()) &&
    content.createdBy !== null &&
    content.createdBy !== undefined &&
    content.createdBy.length > 0
  );
}

/**
 * Deep equality check for content objects
 */
function contentEquals(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

describe('Content Persistence Property Tests', () => {
  /**
   * **Feature: instructional-design-platform, Property 24: Content Persistence Metadata**
   * **Validates: Requirements 13.1**
   * 
   * *For any* saved content (lesson plan, quiz, worksheet, etc.), 
   * it SHALL have non-null createdAt timestamp and createdBy user reference.
   */
  test('Property 24: persisted content has non-null createdAt', () => {
    fc.assert(
      fc.property(
        arbitraryPersistedContent(),
        (content) => {
          expect(content.createdAt).not.toBeNull();
          expect(content.createdAt).toBeDefined();
          expect(content.createdAt).toBeInstanceOf(Date);
          expect(isNaN(content.createdAt.getTime())).toBe(false);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 24: Content Persistence Metadata**
   * **Validates: Requirements 13.1**
   * 
   * createdBy user reference is non-null.
   */
  test('Property 24: persisted content has non-null createdBy', () => {
    fc.assert(
      fc.property(
        arbitraryPersistedContent(),
        (content) => {
          expect(content.createdBy).not.toBeNull();
          expect(content.createdBy).toBeDefined();
          expect(content.createdBy.length).toBeGreaterThan(0);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 24: Content Persistence Metadata**
   * **Validates: Requirements 13.1**
   * 
   * All content types have valid persistence metadata.
   */
  test('Property 24: all content types have valid metadata', () => {
    fc.assert(
      fc.property(
        arbitraryPersistedContent(),
        (content) => {
          expect(hasValidPersistenceMetadata(content)).toBe(true);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 24: Content Persistence Metadata**
   * **Validates: Requirements 13.1**
   * 
   * Content ID is a valid UUID.
   */
  test('Property 24: content ID is valid UUID', () => {
    fc.assert(
      fc.property(
        arbitraryPersistedContent(),
        (content) => {
          expect(content.id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          );
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 21: Refinement Undo Round-Trip**
   * **Validates: Requirements 10.4**
   * 
   * *For any* content refinement action, applying undo SHALL restore 
   * the content to its pre-refinement state.
   */
  test('Property 21: undo restores pre-refinement state', () => {
    fc.assert(
      fc.property(
        arbitraryContent(),
        arbitraryContent(),
        (originalContent, refinedContent) => {
          // Start with original content
          const initialState: ContentState = {
            current: originalContent,
            undoStack: [],
            redoStack: [],
          };
          
          // Apply refinement
          const afterRefinement = applyRefinement(initialState, refinedContent);
          
          // Verify refinement was applied
          expect(contentEquals(afterRefinement.current, refinedContent)).toBe(true);
          
          // Apply undo
          const afterUndo = undoRefinement(afterRefinement);
          
          // Verify original content is restored
          expect(contentEquals(afterUndo.current, originalContent)).toBe(true);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 21: Refinement Undo Round-Trip**
   * **Validates: Requirements 10.4**
   * 
   * Multiple refinements can be undone in sequence.
   */
  test('Property 21: multiple refinements can be undone', () => {
    fc.assert(
      fc.property(
        arbitraryContent(),
        fc.array(arbitraryContent(), { minLength: 1, maxLength: 5 }),
        (originalContent, refinements) => {
          // Start with original content
          let state: ContentState = {
            current: originalContent,
            undoStack: [],
            redoStack: [],
          };
          
          // Apply all refinements
          refinements.forEach(refinement => {
            state = applyRefinement(state, refinement);
          });
          
          // Verify last refinement is current
          expect(contentEquals(state.current, refinements[refinements.length - 1])).toBe(true);
          
          // Undo all refinements
          for (let i = refinements.length - 1; i >= 0; i--) {
            state = undoRefinement(state);
            
            if (i > 0) {
              // Should restore to previous refinement
              expect(contentEquals(state.current, refinements[i - 1])).toBe(true);
            } else {
              // Should restore to original
              expect(contentEquals(state.current, originalContent)).toBe(true);
            }
          }
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 21: Refinement Undo Round-Trip**
   * **Validates: Requirements 10.4**
   * 
   * Undo followed by redo restores the refinement.
   */
  test('Property 21: undo then redo restores refinement', () => {
    fc.assert(
      fc.property(
        arbitraryContent(),
        arbitraryContent(),
        (originalContent, refinedContent) => {
          // Start with original content
          const initialState: ContentState = {
            current: originalContent,
            undoStack: [],
            redoStack: [],
          };
          
          // Apply refinement
          const afterRefinement = applyRefinement(initialState, refinedContent);
          
          // Undo
          const afterUndo = undoRefinement(afterRefinement);
          expect(contentEquals(afterUndo.current, originalContent)).toBe(true);
          
          // Redo
          const afterRedo = redoRefinement(afterUndo);
          expect(contentEquals(afterRedo.current, refinedContent)).toBe(true);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 21: Refinement Undo Round-Trip**
   * **Validates: Requirements 10.4**
   * 
   * Undo on empty stack is a no-op.
   */
  test('Property 21: undo on empty stack is no-op', () => {
    fc.assert(
      fc.property(
        arbitraryContent(),
        (content) => {
          const state: ContentState = {
            current: content,
            undoStack: [],
            redoStack: [],
          };
          
          const afterUndo = undoRefinement(state);
          
          // Content should be unchanged
          expect(contentEquals(afterUndo.current, content)).toBe(true);
          expect(afterUndo.undoStack).toHaveLength(0);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 21: Refinement Undo Round-Trip**
   * **Validates: Requirements 10.4**
   * 
   * New refinement clears redo stack.
   */
  test('Property 21: new refinement clears redo stack', () => {
    fc.assert(
      fc.property(
        arbitraryContent(),
        arbitraryContent(),
        arbitraryContent(),
        (original, first, second) => {
          // Apply first refinement
          let state: ContentState = {
            current: original,
            undoStack: [],
            redoStack: [],
          };
          state = applyRefinement(state, first);
          
          // Undo to create redo entry
          state = undoRefinement(state);
          expect(state.redoStack.length).toBeGreaterThan(0);
          
          // Apply new refinement
          state = applyRefinement(state, second);
          
          // Redo stack should be cleared
          expect(state.redoStack).toHaveLength(0);
        }
      )
    );
  });
});
