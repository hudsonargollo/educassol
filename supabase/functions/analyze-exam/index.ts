import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry configuration for Gemini API calls
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

// Rubric question schema for validation
const RubricQuestionSchema = z.object({
  number: z.string(),
  topic: z.string(),
  max_points: z.number(),
  expected_answer: z.string().optional(),
  partial_credit_criteria: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
});

// Rubric schema for validation
const RubricSchema = z.object({
  title: z.string(),
  total_points: z.number(),
  questions: z.array(RubricQuestionSchema),
  grading_instructions: z.string().optional(),
});

// Request validation schema - supports both submission_id lookup and direct rubric/submission input
const AnalyzeExamRequestSchema = z.object({
  submission_id: z.string().uuid('submission_id must be a valid UUID').optional(),
  // Direct input mode - rubric and submission content provided directly
  rubric: RubricSchema.optional(),
  submission_content: z.string().optional(), // Base64 encoded file content
  submission_mime_type: z.string().optional(),
  // Streaming mode flag
  stream: z.boolean().optional().default(false),
}).refine(
  (data) => data.submission_id || (data.rubric && data.submission_content && data.submission_mime_type),
  { message: 'Either submission_id or (rubric, submission_content, submission_mime_type) must be provided' }
);

// Grading result schema from Gemini - includes confidence score
const GradingResultSchema = z.object({
  student_metadata: z.object({
    name: z.string(),
    student_id: z.string(),
    handwriting_quality: z.enum(['excellent', 'good', 'poor', 'illegible']),
  }),
  questions: z.array(z.object({
    number: z.string(),
    topic: z.string(),
    student_response_transcription: z.string(),
    is_correct: z.boolean(),
    points_awarded: z.number(),
    max_points: z.number(),
    reasoning: z.string(),
    feedback_for_student: z.string(),
  })),
  summary_comment: z.string(),
  total_score: z.number(),
  confidenceScore: z.number().min(0).max(100),
});

/**
 * Retry wrapper with exponential backoff for API calls
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  config = RETRY_CONFIG
): Promise<T> {
  let lastError: Error = new Error('Unknown error');
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Attempt ${attempt}/${config.maxAttempts} failed:`, lastError.message);
      
      if (attempt < config.maxAttempts) {
        const delay = Math.min(
          config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelayMs
        );
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Convert file buffer to Base64 string
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Get MIME type from file type
 */
function getMimeType(fileType: string): string {
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
  };
  return mimeTypes[fileType] || 'application/octet-stream';
}

/**
 * Build the system prompt for Gemini
 */
function buildSystemPrompt(): string {
  return `You are an expert exam grader for Brazilian schools. Your task is to:
1. Analyze the scanned handwritten exam image/PDF
2. Transcribe each student answer accurately
3. Grade each answer according to the provided rubric
4. Provide constructive feedback in Portuguese
5. Assess your confidence in the grading (0-100%)

Be fair, consistent, and thorough in your grading. Consider partial credit where appropriate.
Extract the student's name and ID if visible on the exam.
Assess the overall handwriting quality.

Your confidence score should reflect:
- How legible the handwriting is
- How clearly you could match answers to rubric criteria
- Any ambiguity in the student's responses

IMPORTANT: You must respond with valid JSON matching the exact schema provided.`;
}

/**
 * Build the user prompt with rubric details
 */
function buildUserPrompt(rubric: z.infer<typeof RubricSchema>): string {
  let prompt = `Please grade this exam according to the following rubric:\n\n`;
  prompt += `**Exam Title:** ${rubric.title}\n`;
  prompt += `**Total Points:** ${rubric.total_points}\n\n`;
  
  if (rubric.grading_instructions) {
    prompt += `**Grading Instructions:** ${rubric.grading_instructions}\n\n`;
  }
  
  prompt += `**Questions:**\n`;
  for (const question of rubric.questions) {
    prompt += `\n- Question ${question.number}: ${question.topic} (${question.max_points} points)\n`;
    if (question.expected_answer) {
      prompt += `  Expected Answer: ${question.expected_answer}\n`;
    }
    if (question.keywords && question.keywords.length > 0) {
      prompt += `  Keywords to look for: ${question.keywords.join(', ')}\n`;
    }
    if (question.partial_credit_criteria && question.partial_credit_criteria.length > 0) {
      prompt += `  Partial credit criteria:\n`;
      for (const criteria of question.partial_credit_criteria) {
        prompt += `    - ${criteria}\n`;
      }
    }
  }
  
  prompt += `\nPlease analyze the attached exam and provide your grading in the specified JSON format.`;
  prompt += `\nInclude a confidenceScore (0-100) indicating how confident you are in your grading.`;
  return prompt;
}

/**
 * Build the JSON schema for Gemini's structured output - includes confidence score
 */
function buildResponseSchema() {
  return {
    type: "object",
    properties: {
      student_metadata: {
        type: "object",
        properties: {
          name: { type: "string", description: "Student's name as written on the exam" },
          student_id: { type: "string", description: "Student's ID as written on the exam" },
          handwriting_quality: { 
            type: "string", 
            enum: ["excellent", "good", "poor", "illegible"],
            description: "Overall assessment of handwriting legibility"
          },
        },
        required: ["name", "student_id", "handwriting_quality"],
      },
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            number: { type: "string", description: "Question number" },
            topic: { type: "string", description: "Question topic" },
            student_response_transcription: { type: "string", description: "Transcription of student's handwritten answer" },
            is_correct: { type: "boolean", description: "Whether the answer is correct" },
            points_awarded: { type: "number", description: "Points awarded for this answer" },
            max_points: { type: "number", description: "Maximum possible points" },
            reasoning: { type: "string", description: "Explanation of the grading decision" },
            feedback_for_student: { type: "string", description: "Constructive feedback in Portuguese" },
          },
          required: ["number", "topic", "student_response_transcription", "is_correct", "points_awarded", "max_points", "reasoning", "feedback_for_student"],
        },
      },
      summary_comment: { type: "string", description: "Overall feedback for the student in Portuguese" },
      total_score: { type: "number", description: "Total points awarded" },
      confidenceScore: { type: "number", description: "AI confidence in grading accuracy (0-100)" },
    },
    required: ["student_metadata", "questions", "summary_comment", "total_score", "confidenceScore"],
  };
}

/**
 * Call Gemini API with streaming response for real-time feedback
 */
async function* callGeminiAPIStreaming(
  base64Content: string,
  mimeType: string,
  rubric: z.infer<typeof RubricSchema>,
  apiKey: string
): AsyncGenerator<{ type: 'progress' | 'question' | 'complete' | 'error'; data: unknown }> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(rubric);
  const responseSchema = buildResponseSchema();

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Content,
            },
          },
          {
            text: userPrompt,
          },
        ],
      },
    ],
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.1,
      maxOutputTokens: 8192,
    },
  };

  // Emit progress event
  yield { type: 'progress', data: { status: 'starting', message: 'Initiating AI grading...' } };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:streamGenerateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      yield { type: 'error', data: { message: `Gemini API error: ${response.status}` } };
      return;
    }

    yield { type: 'progress', data: { status: 'processing', message: 'AI is analyzing the submission...' } };

    // Read the streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      yield { type: 'error', data: { message: 'No response body' } };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // Try to parse complete JSON objects from the buffer
      // Gemini streaming returns an array of response chunks
      try {
        // The streaming response is a JSON array, try to extract content
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (line.trim().startsWith('{') || line.trim().startsWith('[')) {
            try {
              const parsed = JSON.parse(line.trim().replace(/^\[|\]$/g, '').trim());
              if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
                fullContent = parsed.candidates[0].content.parts[0].text;
                yield { type: 'progress', data: { status: 'grading', message: 'Processing grading results...' } };
              }
            } catch {
              // Continue accumulating
            }
          }
        }
      } catch {
        // Continue accumulating buffer
      }
    }

    // Parse the final accumulated content
    if (!fullContent) {
      // Try to parse the entire buffer as the response
      try {
        const parsed = JSON.parse(buffer);
        if (Array.isArray(parsed) && parsed[0]?.candidates?.[0]?.content?.parts?.[0]?.text) {
          fullContent = parsed[0].candidates[0].content.parts[0].text;
        } else if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
          fullContent = parsed.candidates[0].content.parts[0].text;
        }
      } catch {
        yield { type: 'error', data: { message: 'Failed to parse streaming response' } };
        return;
      }
    }

    if (!fullContent) {
      yield { type: 'error', data: { message: 'Empty response from Gemini' } };
      return;
    }

    // Parse and validate the grading result
    let gradingResult;
    try {
      gradingResult = JSON.parse(fullContent);
    } catch {
      yield { type: 'error', data: { message: 'Invalid JSON in Gemini response' } };
      return;
    }

    const validationResult = GradingResultSchema.safeParse(gradingResult);
    if (!validationResult.success) {
      console.error('Grading result validation failed:', validationResult.error);
      yield { type: 'error', data: { message: `Invalid grading result: ${validationResult.error.message}` } };
      return;
    }

    // Emit individual question results for real-time feedback
    for (const question of validationResult.data.questions) {
      yield { 
        type: 'question', 
        data: {
          number: question.number,
          topic: question.topic,
          points_awarded: question.points_awarded,
          max_points: question.max_points,
          feedback: question.feedback_for_student,
          is_correct: question.is_correct,
        }
      };
    }

    // Emit complete result
    yield { type: 'complete', data: validationResult.data };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    yield { type: 'error', data: { message: errorMessage } };
  }
}

/**
 * Call Gemini API with non-streaming response (original behavior)
 */
async function callGeminiAPI(
  base64Content: string,
  mimeType: string,
  rubric: z.infer<typeof RubricSchema>,
  apiKey: string
): Promise<z.infer<typeof GradingResultSchema>> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(rubric);
  const responseSchema = buildResponseSchema();

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Content,
            },
          },
          {
            text: userPrompt,
          },
        ],
      },
    ],
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.1,
      maxOutputTokens: 8192,
    },
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response generated by Gemini');
  }

  const candidate = data.candidates[0];
  if (candidate.finishReason === 'SAFETY') {
    throw new Error('Content blocked by safety filters');
  }

  const content = candidate.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error('Empty response from Gemini');
  }

  let parsedResult;
  try {
    parsedResult = JSON.parse(content);
  } catch {
    throw new Error('Invalid JSON in Gemini response');
  }

  const validationResult = GradingResultSchema.safeParse(parsedResult);
  if (!validationResult.success) {
    console.error('Grading result validation failed:', validationResult.error);
    throw new Error(`Invalid grading result schema: ${validationResult.error.message}`);
  }

  return validationResult.data;
}

/**
 * Handle streaming response
 */
async function handleStreamingResponse(
  base64Content: string,
  mimeType: string,
  rubric: z.infer<typeof RubricSchema>,
  apiKey: string
): Promise<Response> {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of callGeminiAPIStreaming(base64Content, mimeType, rubric, apiKey)) {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
        controller.close();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorEvent = `data: ${JSON.stringify({ type: 'error', data: { message: errorMessage } })}\n\n`;
        controller.enqueue(encoder.encode(errorEvent));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user authentication
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing analyze-exam for user:', user.id);

    // Parse and validate request body
    const requestBody = await req.json();
    const validationResult = AnalyzeExamRequestSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request', 
          details: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { submission_id, rubric: directRubric, submission_content, submission_mime_type, stream } = validationResult.data;

    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mode 1: Direct rubric and submission content provided
    if (directRubric && submission_content && submission_mime_type) {
      console.log('Direct grading mode with provided rubric and submission');
      
      if (stream) {
        return await handleStreamingResponse(submission_content, submission_mime_type, directRubric, geminiApiKey);
      }

      // Non-streaming direct mode
      let gradingResult: z.infer<typeof GradingResultSchema>;
      try {
        gradingResult = await withRetry(() => 
          callGeminiAPI(submission_content, submission_mime_type, directRubric, geminiApiKey)
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown AI error';
        return new Response(
          JSON.stringify({ error: 'AI grading failed', details: errorMessage }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          status: 'graded',
          ai_output: gradingResult,
          total_score: gradingResult.total_score,
          confidenceScore: gradingResult.confidenceScore,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mode 2: Submission ID lookup mode (original behavior)
    if (!submission_id) {
      return new Response(
        JSON.stringify({ error: 'submission_id is required when not providing direct content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch submission with exam details
    const { data: submission, error: submissionError } = await supabaseClient
      .from('submissions')
      .select(`
        id,
        exam_id,
        storage_path,
        file_type,
        status,
        exams (
          id,
          rubric,
          title
        )
      `)
      .eq('id', submission_id)
      .single();

    if (submissionError || !submission) {
      console.error('Submission fetch error:', submissionError);
      return new Response(
        JSON.stringify({ error: 'Submission not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already processed
    if (submission.status === 'graded') {
      return new Response(
        JSON.stringify({ error: 'Submission already graded' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate rubric
    const rubricValidation = RubricSchema.safeParse(submission.exams?.rubric);
    if (!rubricValidation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid exam rubric', details: rubricValidation.error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rubric = rubricValidation.data;

    // Update status to processing
    await supabaseClient
      .from('submissions')
      .update({ status: 'processing' })
      .eq('id', submission_id);

    console.log('Downloading file from storage:', submission.storage_path);

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('raw-exams')
      .download(submission.storage_path);

    if (downloadError || !fileData) {
      console.error('File download error:', downloadError);
      await supabaseClient
        .from('submissions')
        .update({ status: 'failed', error_message: 'Failed to download file from storage' })
        .eq('id', submission_id);
      
      return new Response(
        JSON.stringify({ error: 'Failed to download file from storage' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert to Base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64Content = bufferToBase64(arrayBuffer);
    const mimeType = getMimeType(submission.file_type);

    console.log('File converted to Base64, calling Gemini API...');

    // Handle streaming mode for submission_id lookup
    if (stream) {
      return await handleStreamingResponse(base64Content, mimeType, rubric, geminiApiKey);
    }

    // Call Gemini API with retry logic (non-streaming)
    let gradingResult: z.infer<typeof GradingResultSchema>;
    try {
      gradingResult = await withRetry(() => 
        callGeminiAPI(base64Content, mimeType, rubric, geminiApiKey)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown AI error';
      console.error('Gemini API failed after retries:', errorMessage);
      
      await supabaseClient
        .from('submissions')
        .update({ 
          status: 'failed', 
          error_message: `AI grading failed: ${errorMessage}`,
          processed_at: new Date().toISOString()
        })
        .eq('id', submission_id);
      
      return new Response(
        JSON.stringify({ error: 'AI grading failed', details: errorMessage }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Grading complete, storing results...');

    // Store result in database
    const { data: result, error: resultError } = await supabaseClient
      .from('results')
      .insert({
        submission_id: submission_id,
        ai_output: gradingResult,
      })
      .select('id, verification_token, total_score')
      .single();

    if (resultError) {
      console.error('Result insert error:', resultError);
      await supabaseClient
        .from('submissions')
        .update({ 
          status: 'failed', 
          error_message: 'Failed to store grading result',
          processed_at: new Date().toISOString()
        })
        .eq('id', submission_id);
      
      return new Response(
        JSON.stringify({ error: 'Failed to store grading result' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update submission status to graded
    await supabaseClient
      .from('submissions')
      .update({ 
        status: 'graded',
        processed_at: new Date().toISOString()
      })
      .eq('id', submission_id);

    console.log('Analysis complete, result_id:', result.id);

    // Return success response with confidence score
    return new Response(
      JSON.stringify({
        result_id: result.id,
        total_score: gradingResult.total_score,
        confidenceScore: gradingResult.confidenceScore,
        status: 'graded',
        ai_output: gradingResult,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-exam:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
