import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Allowed MIME types for exam file uploads
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const;
type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// Map MIME types to file type enum values
const MIME_TO_FILE_TYPE: Record<AllowedMimeType, 'pdf' | 'jpeg' | 'png'> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
};

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[/\\:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .trim();
}

function generateStoragePath(educatorId: string, examId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = sanitizeFilename(filename);
  return `user_${educatorId}/exam_${examId}/${timestamp}_${sanitizedFilename}`;
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

    console.log('Processing upload for user:', user.id);

    // Parse multipart form data
    const formData = await req.formData();
    
    const file = formData.get('file') as File | null;
    const examId = formData.get('exam_id') as string | null;
    const studentIdentifier = formData.get('student_identifier') as string | null;

    // Validate required fields
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!examId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: exam_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate exam_id is a valid UUID
    if (!isValidUUID(examId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid exam_id: must be a valid UUID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid file type', 
          allowed: ['pdf', 'jpeg', 'png'],
          received: mimeType 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size
    const fileSize = file.size;
    if (fileSize > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (fileSize / (1024 * 1024)).toFixed(2);
      return new Response(
        JSON.stringify({ 
          error: 'File exceeds 10MB limit', 
          size: fileSize,
          sizeMB: `${sizeMB}MB`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify exam exists and user has access
    const { data: exam, error: examError } = await supabaseClient
      .from('exams')
      .select('id, educator_id')
      .eq('id', examId)
      .single();

    if (examError || !exam) {
      return new Response(
        JSON.stringify({ error: 'Exam not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate storage path
    const storagePath = generateStoragePath(user.id, examId, file.name);
    
    console.log('Uploading file to:', storagePath);

    // Read file content
    const fileBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseClient.storage
      .from('raw-exams')
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Storage operation failed', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create submission record
    const fileType = MIME_TO_FILE_TYPE[mimeType as AllowedMimeType];
    
    const { data: submission, error: submissionError } = await supabaseClient
      .from('submissions')
      .insert({
        exam_id: examId,
        student_identifier: studentIdentifier || null,
        storage_path: storagePath,
        file_type: fileType,
        file_size_bytes: fileSize,
        status: 'uploaded',
      })
      .select('id, storage_path, status')
      .single();

    if (submissionError) {
      console.error('Submission insert error:', submissionError);
      // Try to clean up the uploaded file
      await supabaseClient.storage.from('raw-exams').remove([storagePath]);
      
      return new Response(
        JSON.stringify({ error: 'Failed to create submission record', details: submissionError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Submission created:', submission.id);

    // Return success response
    return new Response(
      JSON.stringify({
        submission_id: submission.id,
        storage_path: submission.storage_path,
        status: submission.status,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in upload-exam:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
