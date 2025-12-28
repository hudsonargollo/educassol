import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  generateStoragePath,
  parseStoragePath,
  isValidUUID,
  sanitizeFilename,
  type StoragePathOptions,
} from '../storage-path';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Arbitrary for valid UUIDs
 */
const arbitraryUUID = (): fc.Arbitrary<string> =>
  fc.uuid();

/**
 * Arbitrary for valid filenames
 */
const arbitraryValidFilename = (): fc.Arbitrary<string> =>
  fc.stringMatching(/^[a-zA-Z0-9._-]{1,50}$/);

/**
 * Arbitrary for valid storage path options
 */
const arbitraryValidStoragePathOptions = (): fc.Arbitrary<StoragePathOptions> =>
  fc.record({
    educatorId: arbitraryUUID(),
    examId: arbitraryUUID(),
    filename: arbitraryValidFilename(),
    timestamp: fc.integer({ min: 1000000000000, max: 9999999999999 }),
  });

/**
 * Arbitrary for invalid UUIDs
 */
const arbitraryInvalidUUID = (): fc.Arbitrary<string> =>
  fc.string({ minLength: 1, maxLength: 50 }).filter(
    (s) => !isValidUUID(s)
  );

describe('Storage Path Property Tests', () => {
  /**
   * **Feature: automated-assessment, Property 6: Storage path structure**
   * **Validates: Requirements 2.3**
   * 
   * *For any* successful file upload, the resulting storage_path should match the pattern 
   * `user_{educator_id}/exam_{exam_id}/{timestamp}_{filename}` where all IDs are valid UUIDs.
   */
  test('Property 6: valid inputs produce correctly structured paths', () => {
    fc.assert(
      fc.property(arbitraryValidStoragePathOptions(), (options) => {
        const result = generateStoragePath(options);
        
        expect(result.success).toBe(true);
        expect(result.path).toBeDefined();
        
        // Verify path structure
        const pathRegex = /^user_([0-9a-f-]+)\/exam_([0-9a-f-]+)\/(\d+)_(.+)$/i;
        expect(result.path).toMatch(pathRegex);
        
        // Verify IDs in path are valid UUIDs
        const match = result.path!.match(pathRegex);
        expect(match).not.toBeNull();
        expect(isValidUUID(match![1])).toBe(true);
        expect(isValidUUID(match![2])).toBe(true);
        
        // Verify educator and exam IDs match input
        expect(match![1].toLowerCase()).toBe(options.educatorId.toLowerCase());
        expect(match![2].toLowerCase()).toBe(options.examId.toLowerCase());
      })
    );
  });

  /**
   * **Feature: automated-assessment, Property 6: Storage path structure**
   * **Validates: Requirements 2.3**
   * 
   * Invalid educator IDs should be rejected.
   */
  test('Property 6: invalid educator IDs are rejected', () => {
    fc.assert(
      fc.property(
        arbitraryInvalidUUID(),
        arbitraryUUID(),
        arbitraryValidFilename(),
        (educatorId, examId, filename) => {
          const result = generateStoragePath({ educatorId, examId, filename });
          expect(result.success).toBe(false);
          expect(result.error).toContain('educator ID');
        }
      )
    );
  });

  /**
   * **Feature: automated-assessment, Property 6: Storage path structure**
   * **Validates: Requirements 2.3**
   * 
   * Invalid exam IDs should be rejected.
   */
  test('Property 6: invalid exam IDs are rejected', () => {
    fc.assert(
      fc.property(
        arbitraryUUID(),
        arbitraryInvalidUUID(),
        arbitraryValidFilename(),
        (educatorId, examId, filename) => {
          const result = generateStoragePath({ educatorId, examId, filename });
          expect(result.success).toBe(false);
          expect(result.error).toContain('exam ID');
        }
      )
    );
  });

  /**
   * **Feature: automated-assessment, Property 6: Storage path structure**
   * **Validates: Requirements 2.3**
   * 
   * Empty filenames should be rejected.
   */
  test('Property 6: empty filenames are rejected', () => {
    fc.assert(
      fc.property(
        arbitraryUUID(),
        arbitraryUUID(),
        fc.constantFrom('', '   ', '\t', '\n'),
        (educatorId, examId, filename) => {
          const result = generateStoragePath({ educatorId, examId, filename });
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
        }
      )
    );
  });

  /**
   * **Feature: automated-assessment, Property 6: Storage path structure**
   * **Validates: Requirements 2.3**
   * 
   * Storage path round-trip: generating a path and parsing it should recover the original components.
   */
  test('Property 6: storage path round-trip preserves components', () => {
    fc.assert(
      fc.property(arbitraryValidStoragePathOptions(), (options) => {
        const generateResult = generateStoragePath(options);
        
        if (!generateResult.success || !generateResult.path) {
          return; // Skip if generation failed
        }
        
        const parsed = parseStoragePath(generateResult.path);
        
        expect(parsed).not.toBeNull();
        expect(parsed?.educatorId.toLowerCase()).toBe(options.educatorId.toLowerCase());
        expect(parsed?.examId.toLowerCase()).toBe(options.examId.toLowerCase());
        expect(parsed?.timestamp).toBe(options.timestamp);
      })
    );
  });

  /**
   * **Feature: automated-assessment, Property 6: Storage path structure**
   * **Validates: Requirements 2.3**
   * 
   * Filename sanitization removes dangerous characters.
   */
  test('Property 6: filename sanitization removes dangerous characters', () => {
    const dangerousChars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|'];
    
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (filename) => {
          const sanitized = sanitizeFilename(filename);
          
          // Sanitized filename should not contain dangerous characters
          for (const char of dangerousChars) {
            expect(sanitized).not.toContain(char);
          }
        }
      )
    );
  });

  /**
   * **Feature: automated-assessment, Property 6: Storage path structure**
   * **Validates: Requirements 2.3**
   * 
   * UUID validation correctly identifies valid UUIDs.
   */
  test('Property 6: UUID validation accepts valid UUIDs', () => {
    fc.assert(
      fc.property(arbitraryUUID(), (uuid) => {
        expect(isValidUUID(uuid)).toBe(true);
      })
    );
  });

  /**
   * **Feature: automated-assessment, Property 6: Storage path structure**
   * **Validates: Requirements 2.3**
   * 
   * UUID validation correctly rejects invalid UUIDs.
   */
  test('Property 6: UUID validation rejects invalid UUIDs', () => {
    fc.assert(
      fc.property(arbitraryInvalidUUID(), (invalidUuid) => {
        expect(isValidUUID(invalidUuid)).toBe(false);
      })
    );
  });
});
