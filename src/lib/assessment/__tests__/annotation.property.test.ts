import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  validateAnnotation,
  isTextLocation,
  isImageLocation,
  type Annotation,
  type TextLocation,
  type ImageLocation,
  type AnnotationType,
} from '../annotation';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Arbitrary for annotation type
 */
const arbitraryAnnotationType = (): fc.Arbitrary<AnnotationType> =>
  fc.constantFrom('highlight', 'comment', 'correction');

/**
 * Arbitrary for valid text location
 */
const arbitraryTextLocation = (): fc.Arbitrary<TextLocation> =>
  fc.record({
    startOffset: fc.integer({ min: 0, max: 10000 }),
    endOffset: fc.integer({ min: 0, max: 10000 }),
    pageNumber: fc.integer({ min: 1, max: 100 }),
  }).filter(loc => loc.endOffset >= loc.startOffset);

/**
 * Arbitrary for valid image location
 */
const arbitraryImageLocation = (): fc.Arbitrary<ImageLocation> =>
  fc.record({
    x: fc.float({ min: 0, max: 1000, noNaN: true }),
    y: fc.float({ min: 0, max: 1000, noNaN: true }),
    width: fc.float({ min: 0, max: 500, noNaN: true }),
    height: fc.float({ min: 0, max: 500, noNaN: true }),
    pageNumber: fc.integer({ min: 1, max: 100 }),
  });

/**
 * Arbitrary for valid annotation location (either text or image)
 */
const arbitraryAnnotationLocation = () =>
  fc.oneof(arbitraryTextLocation(), arbitraryImageLocation());

/**
 * Arbitrary for valid annotation
 */
const arbitraryAnnotation = (): fc.Arbitrary<Annotation> =>
  fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    submissionId: fc.string({ minLength: 1, maxLength: 50 }),
    questionNumber: fc.string({ minLength: 1, maxLength: 20 }),
    type: arbitraryAnnotationType(),
    content: fc.string({ minLength: 1, maxLength: 500 }),
    location: arbitraryAnnotationLocation(),
    createdAt: fc.date(),
  });

describe('Annotation Property Tests', () => {
  /**
   * **Feature: magic-grading-engine, Property 6: Annotation Structure Validity**
   * **Validates: Requirements 4.2, 4.3, 4.4**
   * 
   * *For any* annotation, it SHALL have a valid location (either text offsets for text 
   * submissions or coordinates for image submissions), a non-empty questionNumber 
   * referencing a criterion, and non-empty content.
   */
  test('Property 6: valid annotations with text locations are accepted', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 50 }),
          submissionId: fc.string({ minLength: 1, maxLength: 50 }),
          questionNumber: fc.string({ minLength: 1, maxLength: 20 }),
          type: arbitraryAnnotationType(),
          content: fc.string({ minLength: 1, maxLength: 500 }),
          location: arbitraryTextLocation(),
          createdAt: fc.date(),
        }),
        (annotation) => {
          const result = validateAnnotation(annotation);
          expect(result.success).toBe(true);
          expect(result.data).toBeDefined();
          
          // Verify location is text-based
          expect(isTextLocation(result.data!.location)).toBe(true);
          
          // Verify required fields are present
          expect(result.data!.questionNumber.length).toBeGreaterThan(0);
          expect(result.data!.content.length).toBeGreaterThan(0);
        }
      )
    );
  });

  /**
   * **Feature: magic-grading-engine, Property 6: Annotation Structure Validity**
   * **Validates: Requirements 4.2, 4.3, 4.4**
   */
  test('Property 6: valid annotations with image locations are accepted', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 50 }),
          submissionId: fc.string({ minLength: 1, maxLength: 50 }),
          questionNumber: fc.string({ minLength: 1, maxLength: 20 }),
          type: arbitraryAnnotationType(),
          content: fc.string({ minLength: 1, maxLength: 500 }),
          location: arbitraryImageLocation(),
          createdAt: fc.date(),
        }),
        (annotation) => {
          const result = validateAnnotation(annotation);
          expect(result.success).toBe(true);
          expect(result.data).toBeDefined();
          
          // Verify location is image-based
          expect(isImageLocation(result.data!.location)).toBe(true);
          
          // Verify required fields are present
          expect(result.data!.questionNumber.length).toBeGreaterThan(0);
          expect(result.data!.content.length).toBeGreaterThan(0);
        }
      )
    );
  });

  /**
   * **Feature: magic-grading-engine, Property 6: Annotation Structure Validity**
   * **Validates: Requirements 4.2, 4.3, 4.4**
   * 
   * Annotations with empty questionNumber should be rejected.
   */
  test('Property 6: annotations with empty questionNumber are rejected', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 50 }),
          submissionId: fc.string({ minLength: 1, maxLength: 50 }),
          questionNumber: fc.constant(''),
          type: arbitraryAnnotationType(),
          content: fc.string({ minLength: 1, maxLength: 500 }),
          location: arbitraryAnnotationLocation(),
          createdAt: fc.date(),
        }),
        (annotation) => {
          const result = validateAnnotation(annotation);
          expect(result.success).toBe(false);
          expect(result.errors).toBeDefined();
        }
      )
    );
  });

  /**
   * **Feature: magic-grading-engine, Property 6: Annotation Structure Validity**
   * **Validates: Requirements 4.2, 4.3, 4.4**
   * 
   * Annotations with empty content should be rejected.
   */
  test('Property 6: annotations with empty content are rejected', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 50 }),
          submissionId: fc.string({ minLength: 1, maxLength: 50 }),
          questionNumber: fc.string({ minLength: 1, maxLength: 20 }),
          type: arbitraryAnnotationType(),
          content: fc.constant(''),
          location: arbitraryAnnotationLocation(),
          createdAt: fc.date(),
        }),
        (annotation) => {
          const result = validateAnnotation(annotation);
          expect(result.success).toBe(false);
          expect(result.errors).toBeDefined();
        }
      )
    );
  });

  /**
   * **Feature: magic-grading-engine, Property 6: Annotation Structure Validity**
   * **Validates: Requirements 4.2, 4.3, 4.4**
   * 
   * Text locations with endOffset < startOffset should be rejected.
   */
  test('Property 6: text locations with invalid offset range are rejected', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 50 }),
          submissionId: fc.string({ minLength: 1, maxLength: 50 }),
          questionNumber: fc.string({ minLength: 1, maxLength: 20 }),
          type: arbitraryAnnotationType(),
          content: fc.string({ minLength: 1, maxLength: 500 }),
          location: fc.record({
            startOffset: fc.integer({ min: 100, max: 10000 }),
            endOffset: fc.integer({ min: 0, max: 99 }),
            pageNumber: fc.integer({ min: 1, max: 100 }),
          }),
          createdAt: fc.date(),
        }),
        (annotation) => {
          const result = validateAnnotation(annotation);
          expect(result.success).toBe(false);
          expect(result.errors).toBeDefined();
        }
      )
    );
  });
});
