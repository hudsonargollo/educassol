/**
 * UUID validation regex pattern
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Storage path generation result
 */
export interface StoragePathResult {
  success: boolean;
  path?: string;
  error?: string;
}

/**
 * Options for generating a storage path
 */
export interface StoragePathOptions {
  educatorId: string;
  examId: string;
  filename: string;
  timestamp?: number;
}

/**
 * Validates that a string is a valid UUID
 * 
 * @param id - The string to validate
 * @returns true if valid UUID, false otherwise
 */
export function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

/**
 * Sanitizes a filename by removing or replacing invalid characters
 * 
 * @param filename - The original filename
 * @returns Sanitized filename safe for storage paths
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and other dangerous characters
  // Keep alphanumeric, dots, hyphens, and underscores
  return filename
    .replace(/[/\\:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .trim();
}

/**
 * Generates a storage path for an uploaded exam file.
 * Path structure: user_{educator_id}/exam_{exam_id}/{timestamp}_{filename}
 * 
 * @param options - The options for generating the path
 * @returns StoragePathResult with success status and either path or error
 */
export function generateStoragePath(options: StoragePathOptions): StoragePathResult {
  const { educatorId, examId, filename, timestamp = Date.now() } = options;
  
  // Validate educator ID
  if (!educatorId || !isValidUUID(educatorId)) {
    return {
      success: false,
      error: 'Invalid educator ID: must be a valid UUID',
    };
  }
  
  // Validate exam ID
  if (!examId || !isValidUUID(examId)) {
    return {
      success: false,
      error: 'Invalid exam ID: must be a valid UUID',
    };
  }
  
  // Validate filename
  if (!filename || filename.trim().length === 0) {
    return {
      success: false,
      error: 'Filename is required',
    };
  }
  
  const sanitizedFilename = sanitizeFilename(filename);
  
  if (sanitizedFilename.length === 0) {
    return {
      success: false,
      error: 'Filename contains only invalid characters',
    };
  }
  
  const path = `user_${educatorId}/exam_${examId}/${timestamp}_${sanitizedFilename}`;
  
  return {
    success: true,
    path,
  };
}

/**
 * Parses a storage path to extract its components
 * 
 * @param path - The storage path to parse
 * @returns Parsed components or null if invalid
 */
export function parseStoragePath(path: string): StoragePathOptions | null {
  const regex = /^user_([0-9a-f-]+)\/exam_([0-9a-f-]+)\/(\d+)_(.+)$/i;
  const match = path.match(regex);
  
  if (!match) {
    return null;
  }
  
  const [, educatorId, examId, timestampStr, filename] = match;
  
  if (!isValidUUID(educatorId) || !isValidUUID(examId)) {
    return null;
  }
  
  return {
    educatorId,
    examId,
    timestamp: parseInt(timestampStr, 10),
    filename,
  };
}
