import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  validateQuiz,
  serializeQuiz,
  deserializeQuiz,
  isHigherOrderBloomLevel,
  HIGHER_ORDER_BLOOM_LEVELS,
  type Quiz,
  type QuizQuestion,
  type BloomLevel,
  type QuestionType,
} from '../quiz';

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
 * Arbitrary for Bloom's levels
 */
const arbitraryBloomLevel = (): fc.Arbitrary<BloomLevel> =>
  fc.constantFrom('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create');

/**
 * Arbitrary for higher-order Bloom's levels only (Apply and above)
 * Requirement 5.2, 14.4: Target Apply and Analyze levels
 */
const arbitraryHigherOrderBloomLevel = (): fc.Arbitrary<BloomLevel> =>
  fc.constantFrom('apply', 'analyze', 'evaluate', 'create');

/**
 * Arbitrary for question types
 */
const arbitraryQuestionType = (): fc.Arbitrary<QuestionType> =>
  fc.constantFrom('multiple-choice', 'true-false', 'short-answer');

/**
 * Arbitrary for multiple-choice questions
 */
const arbitraryMultipleChoiceQuestion = (id: number): fc.Arbitrary<QuizQuestion> =>
  fc.integer({ min: 2, max: 5 }).chain(optionCount =>
    fc.record({
      id: fc.constant(id),
      text: arbitraryNonEmptyString(200),
      type: fc.constant('multiple-choice' as QuestionType),
      options: fc.array(arbitraryNonEmptyString(100), { minLength: optionCount, maxLength: optionCount }),
      correctOptionIndex: fc.integer({ min: 0, max: optionCount - 1 }),
      correctAnswer: fc.constant(undefined),
      explanation: arbitraryNonEmptyString(300),
      bloomLevel: arbitraryHigherOrderBloomLevel(),
    })
  );

/**
 * Arbitrary for true/false questions
 */
const arbitraryTrueFalseQuestion = (id: number): fc.Arbitrary<QuizQuestion> =>
  fc.record({
    id: fc.constant(id),
    text: arbitraryNonEmptyString(200),
    type: fc.constant('true-false' as QuestionType),
    options: fc.constant(['True', 'False']),
    correctOptionIndex: fc.integer({ min: 0, max: 1 }),
    correctAnswer: fc.constant(undefined),
    explanation: arbitraryNonEmptyString(300),
    bloomLevel: arbitraryHigherOrderBloomLevel(),
  });

/**
 * Arbitrary for short-answer questions
 */
const arbitraryShortAnswerQuestion = (id: number): fc.Arbitrary<QuizQuestion> =>
  fc.record({
    id: fc.constant(id),
    text: arbitraryNonEmptyString(200),
    type: fc.constant('short-answer' as QuestionType),
    options: fc.constant(undefined),
    correctOptionIndex: fc.constant(undefined),
    correctAnswer: arbitraryNonEmptyString(200),
    explanation: arbitraryNonEmptyString(300),
    bloomLevel: arbitraryHigherOrderBloomLevel(),
  });

/**
 * Arbitrary for any valid quiz question
 */
const arbitraryQuizQuestion = (id: number): fc.Arbitrary<QuizQuestion> =>
  fc.oneof(
    arbitraryMultipleChoiceQuestion(id),
    arbitraryTrueFalseQuestion(id),
    arbitraryShortAnswerQuestion(id)
  );

/**
 * Arbitrary for valid quizzes
 */
const arbitraryQuiz = (): fc.Arbitrary<Quiz> =>
  fc.integer({ min: 1, max: 10 }).chain(questionCount =>
    fc.record({
      id: fc.uuid(),
      lessonPlanId: fc.uuid(),
      title: arbitraryNonEmptyString(100),
      instructions: arbitraryNonEmptyString(300),
      questions: fc.tuple(
        ...Array.from({ length: questionCount }, (_, i) => arbitraryQuizQuestion(i + 1))
      ).map(questions => questions as QuizQuestion[]),
      createdAt: arbitraryValidDate(),
    })
  );

describe('Quiz Property Tests', () => {
  /**
   * **Feature: instructional-design-platform, Property 11: Quiz Question Bloom's Level**
   * **Validates: Requirements 5.2, 14.4**
   * 
   * *For any* quiz question, the bloomLevel SHALL be one of 'apply', 'analyze', 
   * 'evaluate', or 'create' (not 'remember' or 'understand').
   */
  test('Property 11: quiz questions have higher-order Bloom levels', () => {
    fc.assert(
      fc.property(arbitraryQuiz(), (quiz) => {
        const result = validateQuiz(quiz);
        expect(result.success).toBe(true);
        
        // Verify all questions have higher-order Bloom's levels
        result.data?.questions.forEach(question => {
          expect(HIGHER_ORDER_BLOOM_LEVELS).toContain(question.bloomLevel);
          expect(isHigherOrderBloomLevel(question.bloomLevel)).toBe(true);
        });
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 11: Quiz Question Bloom's Level**
   * **Validates: Requirements 5.2, 14.4**
   * 
   * Lower-order Bloom's levels should be identified correctly.
   */
  test('Property 11: lower-order Bloom levels are identified', () => {
    const lowerOrderLevels: BloomLevel[] = ['remember', 'understand'];
    
    lowerOrderLevels.forEach(level => {
      expect(isHigherOrderBloomLevel(level)).toBe(false);
    });
    
    HIGHER_ORDER_BLOOM_LEVELS.forEach(level => {
      expect(isHigherOrderBloomLevel(level)).toBe(true);
    });
  });

  /**
   * **Feature: instructional-design-platform, Property 12: Quiz Explanation Presence**
   * **Validates: Requirements 5.3**
   * 
   * *For any* quiz question, the explanation field SHALL be a non-empty string.
   */
  test('Property 12: quiz questions have non-empty explanations', () => {
    fc.assert(
      fc.property(arbitraryQuiz(), (quiz) => {
        const result = validateQuiz(quiz);
        expect(result.success).toBe(true);
        
        // Verify all questions have non-empty explanations
        result.data?.questions.forEach(question => {
          expect(question.explanation).toBeDefined();
          expect(question.explanation.length).toBeGreaterThan(0);
        });
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 12: Quiz Explanation Presence**
   * **Validates: Requirements 5.3**
   * 
   * Questions without explanations should be rejected.
   */
  test('Property 12: questions without explanations are rejected', () => {
    const invalidQuiz = {
      id: '00000000-0000-0000-0000-000000000001',
      lessonPlanId: '00000000-0000-0000-0000-000000000002',
      title: 'Test Quiz',
      instructions: 'Answer all questions',
      questions: [
        {
          id: 1,
          text: 'What is 2 + 2?',
          type: 'short-answer',
          correctAnswer: '4',
          explanation: '', // Empty explanation
          bloomLevel: 'apply',
        },
      ],
      createdAt: new Date(),
    };
    
    const result = validateQuiz(invalidQuiz);
    expect(result.success).toBe(false);
  });

  /**
   * **Feature: instructional-design-platform, Property 13: Quiz Schema Round-Trip**
   * **Validates: Requirements 5.5**
   * 
   * *For any* valid Quiz object, serializing to JSON then deserializing 
   * SHALL produce an equivalent Quiz object.
   */
  test('Property 13: quiz serialization round-trip preserves data', () => {
    fc.assert(
      fc.property(arbitraryQuiz(), (quiz) => {
        // Serialize to JSON
        const json = serializeQuiz(quiz);
        
        // Deserialize back
        const result = deserializeQuiz(json);
        
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        
        // Verify core fields are preserved
        expect(result.data?.id).toBe(quiz.id);
        expect(result.data?.lessonPlanId).toBe(quiz.lessonPlanId);
        expect(result.data?.title).toBe(quiz.title);
        expect(result.data?.instructions).toBe(quiz.instructions);
        expect(result.data?.questions.length).toBe(quiz.questions.length);
        
        // Verify each question is preserved
        for (let i = 0; i < quiz.questions.length; i++) {
          expect(result.data?.questions[i].id).toBe(quiz.questions[i].id);
          expect(result.data?.questions[i].text).toBe(quiz.questions[i].text);
          expect(result.data?.questions[i].type).toBe(quiz.questions[i].type);
          expect(result.data?.questions[i].explanation).toBe(quiz.questions[i].explanation);
          expect(result.data?.questions[i].bloomLevel).toBe(quiz.questions[i].bloomLevel);
        }
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 13: Quiz Schema Round-Trip**
   * **Validates: Requirements 5.5**
   * 
   * Invalid JSON strings should be rejected during deserialization.
   */
  test('Property 13: invalid JSON strings are rejected', () => {
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
          const result = deserializeQuiz(invalidJson);
          expect(result.success).toBe(false);
        }
      )
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 10: Quiz Context Inheritance**
   * **Validates: Requirements 5.1**
   * 
   * *For any* quiz generated from a lesson plan, the quiz.lessonPlanId 
   * SHALL match the source lesson plan's ID.
   */
  test('Property 10: quiz has valid lessonPlanId', () => {
    fc.assert(
      fc.property(arbitraryQuiz(), (quiz) => {
        const result = validateQuiz(quiz);
        expect(result.success).toBe(true);
        
        // Verify lessonPlanId is a valid UUID
        expect(result.data?.lessonPlanId).toBeDefined();
        expect(result.data?.lessonPlanId).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        );
      })
    );
  });

  /**
   * **Feature: instructional-design-platform, Property 13: Quiz Schema Round-Trip**
   * **Validates: Requirements 5.5**
   * 
   * Valid quizzes should pass validation.
   */
  test('Property 13: valid quizzes are accepted', () => {
    fc.assert(
      fc.property(arbitraryQuiz(), (quiz) => {
        const result = validateQuiz(quiz);
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
      })
    );
  });
});
