import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  validateSlideOutline,
  serializeSlideOutline,
  deserializeSlideOutline,
  hasRequiredSlideTypes,
  REQUIRED_SLIDE_TYPES,
  type SlideOutline,
  type Slide,
  type SlideType,
} from '../slide-outline';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

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
 * Arbitrary for slide types
 */
const arbitrarySlideType = (): fc.Arbitrary<SlideType> =>
  fc.constantFrom('title', 'agenda', 'concept', 'example', 'activity', 'summary');

/**
 * Arbitrary for a single slide
 */
const arbitrarySlide = (slideNumber: number, type?: SlideType): fc.Arbitrary<Slide> =>
  fc.record({
    slideNumber: fc.constant(slideNumber),
    type: type ? fc.constant(type) : arbitrarySlideType(),
    title: arbitraryNonEmptyString(100),
    bulletPoints: fc.array(arbitraryNonEmptyString(200), { maxLength: 5 }),
    speakerNotes: arbitraryNonEmptyString(500),
    visualSuggestion: fc.option(arbitraryNonEmptyString(200), { nil: undefined }),
  });

/**
 * Arbitrary for valid slide outlines with required slide types
 */
const arbitrarySlideOutline = (): fc.Arbitrary<SlideOutline> =>
  fc.integer({ min: 0, max: 5 }).chain(additionalSlideCount => {
    // Always include required slides: title, concept, summary
    const requiredSlides = [
      arbitrarySlide(1, 'title'),
      arbitrarySlide(2, 'concept'),
      arbitrarySlide(3, 'summary'),
    ];
    
    // Add additional random slides
    const additionalSlides = Array.from({ length: additionalSlideCount }, (_, i) =>
      arbitrarySlide(4 + i)
    );
    
    return fc.tuple(...requiredSlides, ...additionalSlides).chain(slides =>
      fc.record({
        id: fc.uuid(),
        lessonPlanId: fc.uuid(),
        title: arbitraryNonEmptyString(100),
        slides: fc.constant(slides as Slide[]),
        createdAt: arbitraryValidDate(),
      })
    );
  });

describe('Slide Outline Property Tests', () => {
  /**
   * **Feature: instructional-design-platform, Property 17: Slide Outline Completeness**
   * **Validates: Requirements 7.1, 7.2, 7.4**
   * 
   * *For any* generated slide outline, the slides array SHALL contain at least one 
   * slide of type 'title', at least one of type 'concept', and at least one of type 
   * 'summary'. Each slide SHALL have non-empty speakerNotes.
   */
  test('Property 17: slide outline has required slide types', () => {
    fc.assert(
      fc.property(arbitrarySlideOutline(), (slideOutline) => {
        const result = validateSlideOutline(slideOutline);
        expect(result.success).toBe(true);
        
        const slideTypes = result.data?.slides.map(s => s.type) || [];
        
        // Verify required slide types are present
        expect(slideTypes).toContain('title');
        expect(slideTypes).toContain('concept');
        expect(slideTypes).toContain('summary');
        
        // Verify using helper function
        expect(hasRequiredSlideTypes(result.data?.slides || [])).toBe(true);
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 17: Slide Outline Completeness**
   * **Validates: Requirements 7.1, 7.2, 7.4**
   * 
   * Each slide SHALL have non-empty speakerNotes.
   */
  test('Property 17: all slides have non-empty speaker notes', () => {
    fc.assert(
      fc.property(arbitrarySlideOutline(), (slideOutline) => {
        const result = validateSlideOutline(slideOutline);
        expect(result.success).toBe(true);
        
        // Verify all slides have non-empty speaker notes
        result.data?.slides.forEach(slide => {
          expect(slide.speakerNotes).toBeDefined();
          expect(slide.speakerNotes.length).toBeGreaterThan(0);
        });
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 17: Slide Outline Completeness**
   * **Validates: Requirements 7.1, 7.2, 7.4**
   * 
   * Slide outlines missing required slide types should be rejected.
   */
  test('Property 17: missing required slide types are rejected', () => {
    // Missing title slide
    const missingTitle = {
      id: '00000000-0000-0000-0000-000000000001',
      lessonPlanId: '00000000-0000-0000-0000-000000000002',
      title: 'Test Outline',
      slides: [
        { slideNumber: 1, type: 'concept', title: 'Concept', bulletPoints: [], speakerNotes: 'Notes' },
        { slideNumber: 2, type: 'summary', title: 'Summary', bulletPoints: [], speakerNotes: 'Notes' },
      ],
      createdAt: new Date(),
    };
    
    expect(validateSlideOutline(missingTitle).success).toBe(false);
    
    // Missing concept slide
    const missingConcept = {
      id: '00000000-0000-0000-0000-000000000001',
      lessonPlanId: '00000000-0000-0000-0000-000000000002',
      title: 'Test Outline',
      slides: [
        { slideNumber: 1, type: 'title', title: 'Title', bulletPoints: [], speakerNotes: 'Notes' },
        { slideNumber: 2, type: 'summary', title: 'Summary', bulletPoints: [], speakerNotes: 'Notes' },
      ],
      createdAt: new Date(),
    };
    
    expect(validateSlideOutline(missingConcept).success).toBe(false);
    
    // Missing summary slide
    const missingSummary = {
      id: '00000000-0000-0000-0000-000000000001',
      lessonPlanId: '00000000-0000-0000-0000-000000000002',
      title: 'Test Outline',
      slides: [
        { slideNumber: 1, type: 'title', title: 'Title', bulletPoints: [], speakerNotes: 'Notes' },
        { slideNumber: 2, type: 'concept', title: 'Concept', bulletPoints: [], speakerNotes: 'Notes' },
      ],
      createdAt: new Date(),
    };
    
    expect(validateSlideOutline(missingSummary).success).toBe(false);
  });

  /**
   * **Feature: instructional-design-platform, Property 18: Slide Outline Schema Round-Trip**
   * **Validates: Requirements 7.3**
   * 
   * *For any* valid SlideOutline object, serializing to JSON then deserializing 
   * SHALL produce an equivalent SlideOutline object.
   */
  test('Property 18: slide outline serialization round-trip preserves data', () => {
    fc.assert(
      fc.property(arbitrarySlideOutline(), (slideOutline) => {
        // Serialize to JSON
        const json = serializeSlideOutline(slideOutline);
        
        // Deserialize back
        const result = deserializeSlideOutline(json);
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        
        // Verify core fields are preserved
        expect(result.data?.id).toBe(slideOutline.id);
        expect(result.data?.lessonPlanId).toBe(slideOutline.lessonPlanId);
        expect(result.data?.title).toBe(slideOutline.title);
        expect(result.data?.slides.length).toBe(slideOutline.slides.length);
        
        // Verify each slide is preserved
        for (let i = 0; i < slideOutline.slides.length; i++) {
          expect(result.data?.slides[i].slideNumber).toBe(slideOutline.slides[i].slideNumber);
          expect(result.data?.slides[i].type).toBe(slideOutline.slides[i].type);
          expect(result.data?.slides[i].title).toBe(slideOutline.slides[i].title);
          expect(result.data?.slides[i].speakerNotes).toBe(slideOutline.slides[i].speakerNotes);
          expect(result.data?.slides[i].bulletPoints).toEqual(slideOutline.slides[i].bulletPoints);
        }
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 18: Slide Outline Schema Round-Trip**
   * **Validates: Requirements 7.3**
   * 
   * Invalid JSON strings should be rejected during deserialization.
   */
  test('Property 18: invalid JSON strings are rejected', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => {
          try {
            JSON.parse(s);
            return false;
          } catch {
            return true;
          }
        }),
        (invalidJson) => {
          const result = deserializeSlideOutline(invalidJson);
          expect(result.success).toBe(false);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 17: Slide Outline Completeness**
   * **Validates: Requirements 7.1, 7.2, 7.4**
   * 
   * Valid slide outlines should pass validation.
   */
  test('Property 17: valid slide outlines are accepted', () => {
    fc.assert(
      fc.property(arbitrarySlideOutline(), (slideOutline) => {
        const result = validateSlideOutline(slideOutline);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 17: Slide Outline Completeness**
   * **Validates: Requirements 7.1, 7.2, 7.4**
   * 
   * Required slide types constant is properly defined.
   */
  test('Property 17: required slide types are properly defined', () => {
    expect(REQUIRED_SLIDE_TYPES).toContain('title');
    expect(REQUIRED_SLIDE_TYPES).toContain('concept');
    expect(REQUIRED_SLIDE_TYPES).toContain('summary');
    expect(REQUIRED_SLIDE_TYPES.length).toBe(3);
  });
});
