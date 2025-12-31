/**
 * Gemini API Client for AI-powered content generation
 * Requirements: 9.1, 9.5
 */

/**
 * System instruction for Educasol AI
 * Defines the AI's role and behavior for instructional content generation
 */
export const SYSTEM_INSTRUCTION = `You are Educasol AI, an expert instructional coach and curriculum developer.
Your goal is to reduce teacher workload while maintaining high pedagogical rigor.

ALWAYS follow Universal Design for Learning (UDL) principles.
ALWAYS align strictly to the provided State Standards.
If the user provides a standard, do not deviate from it.

Output must be valid JSON matching the requested schema.
Do not include "markdown" formatting blocks in the JSON output, just the raw JSON.

When generating lesson plans:
- Use the 5E Instructional Model (Engage, Explore, Explain, Elaborate, Evaluate)
- Align learning objectives to Bloom's Taxonomy
- Include differentiation notes for diverse learners

When generating assessments:
- Target "Apply" and "Analyze" levels of Bloom's Taxonomy
- Avoid simple recall questions
- Generate plausible distractors based on common misconceptions

Tone: Professional, Encouraging, Concise.`;

/**
 * Gemini API configuration
 */
export const GEMINI_CONFIG = {
  model: 'google/gemini-2.5-flash',
  temperature: 0.7,
  topP: 0.95,
  maxOutputTokens: 8192,
} as const;

/**
 * Safety settings for content generation
 */
export const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
] as const;

/**
 * Message structure for chat completions
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Response structure from AI Gateway
 */
export interface AIGatewayResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Streaming chunk structure
 */
export interface StreamingChunk {
  choices: Array<{
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason: string | null;
  }>;
}

/**
 * Generation options for API calls
 */
export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/**
 * Error types for AI generation
 */
export class AIGenerationError extends Error {
  constructor(
    message: string,
    public readonly code: 'TIMEOUT' | 'SCHEMA_VIOLATION' | 'CONTENT_FILTERED' | 'CONTEXT_OVERFLOW' | 'API_ERROR',
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIGenerationError';
  }
}

/**
 * Retry configuration for exponential backoff
 * Requirement 9.4: Retry with exponential backoff up to 3 attempts
 */
export const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
} as const;

/**
 * Calculate delay for exponential backoff
 */
export function calculateBackoffDelay(attempt: number): number {
  const delay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelayMs);
}

/**
 * Sleep utility for retry delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse streaming response chunks
 * Requirement 9.1: Stream response with sub-second time-to-first-token
 */
export function parseStreamingChunk(chunk: string): string | null {
  if (!chunk || chunk === '[DONE]') {
    return null;
  }

  try {
    // Handle SSE format: "data: {...}"
    const dataPrefix = 'data: ';
    if (chunk.startsWith(dataPrefix)) {
      chunk = chunk.slice(dataPrefix.length);
    }

    if (chunk === '[DONE]') {
      return null;
    }

    const parsed: StreamingChunk = JSON.parse(chunk);
    return parsed.choices?.[0]?.delta?.content || null;
  } catch {
    return null;
  }
}

/**
 * Validate JSON response against expected structure
 * Requirement 9.5: Validate response against expected JSON schema
 */
export function validateJSONResponse<T>(
  response: string,
  validator: (data: unknown) => { success: boolean; data?: T; errors?: unknown[] }
): T {
  let parsed: unknown;
  
  try {
    // Try to extract JSON from response (handle markdown code blocks)
    let jsonString = response.trim();
    
    // Remove markdown code blocks if present
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.slice(7);
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.slice(3);
    }
    
    if (jsonString.endsWith('```')) {
      jsonString = jsonString.slice(0, -3);
    }
    
    parsed = JSON.parse(jsonString.trim());
  } catch (e) {
    throw new AIGenerationError(
      'Failed to parse AI response as JSON',
      'SCHEMA_VIOLATION',
      true
    );
  }

  const result = validator(parsed);
  
  if (!result.success) {
    throw new AIGenerationError(
      `AI response does not match expected schema: ${JSON.stringify(result.errors)}`,
      'SCHEMA_VIOLATION',
      true
    );
  }

  return result.data as T;
}

/**
 * Build messages array for chat completion
 */
export function buildMessages(userPrompt: string, systemPrompt?: string): ChatMessage[] {
  return [
    { role: 'system', content: systemPrompt || SYSTEM_INSTRUCTION },
    { role: 'user', content: userPrompt },
  ];
}

/**
 * Type for streaming callback
 */
export type StreamCallback = (chunk: string) => void;

/**
 * Process a streaming response from the AI Gateway
 * Requirement 9.1: Stream response with sub-second time-to-first-token
 */
export async function processStreamingResponse(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk: StreamCallback
): Promise<string> {
  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        const content = parseStreamingChunk(trimmedLine);
        if (content) {
          fullContent += content;
          onChunk(content);
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      const content = parseStreamingChunk(buffer.trim());
      if (content) {
        fullContent += content;
        onChunk(content);
      }
    }

    return fullContent;
  } finally {
    reader.releaseLock();
  }
}
