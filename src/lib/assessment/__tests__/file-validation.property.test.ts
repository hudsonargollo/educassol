import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import {
  validateFileType,
  validateFileSize,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '../file-validation';

// Configure fast-check to run 100 iterations
fc.configureGlobal({ numRuns: 100 });

/**
 * Arbitrary for valid MIME types
 */
const arbitraryValidMimeType = (): fc.Arbitrary<string> =>
  fc.constantFrom('application/pdf', 'image/jpeg', 'image/png');

/**
 * Arbitrary for invalid MIME types
 */
const arbitraryInvalidMimeType = (): fc.Arbitrary<string> =>
  fc.string({ minLength: 1, maxLength: 100 }).filter(
    (s) => !ALLOWED_MIME_TYPES.includes(s.toLowerCase().trim() as any)
  );

/**
 * Arbitrary for valid file sizes (1 byte to 10MB)
 */
const arbitraryValidFileSize = (): fc.Arbitrary<number> =>
  fc.integer({ min: 1, max: MAX_FILE_SIZE_BYTES });

/**
 * Arbitrary for invalid file sizes (over 10MB)
 */
const arbitraryInvalidFileSize = (): fc.Arbitrary<number> =>
  fc.integer({ min: MAX_FILE_SIZE_BYTES + 1, max: MAX_FILE_SIZE_BYTES * 10 });

describe('File Validation Property Tests', () => {
  /**
   * **Feature: automated-assessment, Property 4: File type validation**
   * **Validates: Requirements 2.1**
   * 
   * *For any* file upload attempt, the system should accept files with MIME types 
   * application/pdf, image/jpeg, or image/png, and reject all other MIME types.
   */
  test('Property 4: valid MIME types are accepted', () => {
    fc.assert(
      fc.property(arbitraryValidMimeType(), (mimeType) => {
        const result = validateFileType(mimeType);
        expect(result.valid).toBe(true);
        expect(result.mimeType).toBeDefined();
        expect(ALLOWED_MIME_TYPES).toContain(result.mimeType);
      })
    );
  });

  /**
   * **Feature: automated-assessment, Property 4: File type validation**
   * **Validates: Requirements 2.1**
   * 
   * Invalid MIME types should be rejected.
   */
  test('Property 4: invalid MIME types are rejected', () => {
    fc.assert(
      fc.property(arbitraryInvalidMimeType(), (mimeType) => {
        const result = validateFileType(mimeType);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      })
    );
  });

  /**
   * **Feature: automated-assessment, Property 4: File type validation**
   * **Validates: Requirements 2.1**
   * 
   * MIME type validation should be case-insensitive.
   */
  test('Property 4: MIME type validation is case-insensitive', () => {
    fc.assert(
      fc.property(
        arbitraryValidMimeType(),
        fc.boolean(),
        (mimeType, toUpper) => {
          const transformedType = toUpper ? mimeType.toUpperCase() : mimeType.toLowerCase();
          const result = validateFileType(transformedType);
          expect(result.valid).toBe(true);
        }
      )
    );
  });

  /**
   * **Feature: automated-assessment, Property 5: File size validation**
   * **Validates: Requirements 2.2**
   * 
   * *For any* file upload attempt, the system should accept files with size ≤ 10MB 
   * and reject files exceeding 10MB.
   */
  test('Property 5: valid file sizes are accepted', () => {
    fc.assert(
      fc.property(arbitraryValidFileSize(), (sizeBytes) => {
        const result = validateFileSize(sizeBytes);
        expect(result.valid).toBe(true);
        expect(result.sizeBytes).toBe(sizeBytes);
      })
    );
  });

  /**
   * **Feature: automated-assessment, Property 5: File size validation**
   * **Validates: Requirements 2.2**
   * 
   * Files exceeding 10MB should be rejected.
   */
  test('Property 5: oversized files are rejected', () => {
    fc.assert(
      fc.property(arbitraryInvalidFileSize(), (sizeBytes) => {
        const result = validateFileSize(sizeBytes);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error).toContain('exceeds');
      })
    );
  });

  /**
   * **Feature: automated-assessment, Property 5: File size validation**
   * **Validates: Requirements 2.2**
   * 
   * Zero or negative file sizes should be rejected.
   */
  test('Property 5: zero or negative file sizes are rejected', () => {
    fc.assert(
      fc.property(fc.integer({ min: -1000, max: 0 }), (sizeBytes) => {
        const result = validateFileSize(sizeBytes);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      })
    );
  });

  /**
   * **Feature: automated-assessment, Property 5: File size validation**
   * **Validates: Requirements 2.2**
   * 
   * Boundary test: exactly 10MB should be accepted.
   */
  test('Property 5: exactly 10MB is accepted', () => {
    const result = validateFileSize(MAX_FILE_SIZE_BYTES);
    expect(result.valid).toBe(true);
    expect(result.sizeBytes).toBe(MAX_FILE_SIZE_BYTES);
  });

  /**
   * **Feature: automated-assessment, Property 5: File size validation**
   * **Validates: Requirements 2.2**
   * 
   * Boundary test: 10MB + 1 byte should be rejected.
   */
  test('Property 5: 10MB + 1 byte is rejected', () => {
    const result = validateFileSize(MAX_FILE_SIZE_BYTES + 1);
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
