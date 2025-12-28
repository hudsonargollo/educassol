import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import QRCode from 'https://esm.sh/qrcode@1.5.3';
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Request validation schema
const GenerateReportRequestSchema = z.object({
  result_id: z.string().uuid('result_id must be a valid UUID'),
});

// Grading result schema for validation
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
});

type GradingResult = z.infer<typeof GradingResultSchema>;

/**
 * Generate QR code as Base64 Data URI
 * Requirements: 5.2, 5.3
 */
async function generateQRCodeDataURI(verificationUrl: string): Promise<string> {
  const dataUri = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 150,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
  return dataUri;
}

/**
 * Generate verification URL with token
 * Requirements: 5.2
 */
function generateVerificationUrl(verificationToken: string): string {
  const baseUrl = Deno.env.get('PUBLIC_SITE_URL') || 'https://educasol.app';
  return `${baseUrl}/verify?token=${verificationToken}`;
}


/**
 * Convert Data URI to Uint8Array for embedding in PDF
 */
function dataURItoUint8Array(dataURI: string): Uint8Array {
  const base64 = dataURI.split(',')[1];
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Format date for display in Portuguese
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Wrap text to fit within a given width
 */
function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Generate PDF report using pdf-lib
 * Requirements: 5.1, 5.2, 5.3
 */
async function generatePDFReport(
  gradingResult: GradingResult,
  examTitle: string,
  verificationToken: string,
  gradedAt: Date
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Generate QR code
  const verificationUrl = generateVerificationUrl(verificationToken);
  const qrCodeDataUri = await generateQRCodeDataURI(verificationUrl);
  const qrCodeBytes = dataURItoUint8Array(qrCodeDataUri);
  const qrCodeImage = await pdfDoc.embedPng(qrCodeBytes);
  
  // Page dimensions
  const pageWidth = 595.28; // A4 width in points
  const pageHeight = 841.89; // A4 height in points
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;
  
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  // Helper function to add new page if needed
  const ensureSpace = (requiredSpace: number) => {
    if (yPosition - requiredSpace < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
    }
  };
  
  // Header - Title
  page.drawText('RELATÓRIO DE AVALIAÇÃO', {
    x: margin,
    y: yPosition,
    size: 18,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.4),
  });
  yPosition -= 30;
  
  // Exam title
  page.drawText(examTitle, {
    x: margin,
    y: yPosition,
    size: 14,
    font: helveticaBold,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 25;
  
  // Horizontal line
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: pageWidth - margin, y: yPosition },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
  yPosition -= 20;
  
  // Student info section
  page.drawText('INFORMAÇÕES DO ALUNO', {
    x: margin,
    y: yPosition,
    size: 12,
    font: helveticaBold,
    color: rgb(0.3, 0.3, 0.3),
  });
  yPosition -= 18;
  
  page.drawText(`Nome: ${gradingResult.student_metadata.name}`, {
    x: margin,
    y: yPosition,
    size: 11,
    font: helvetica,
  });
  yPosition -= 15;
  
  page.drawText(`ID: ${gradingResult.student_metadata.student_id}`, {
    x: margin,
    y: yPosition,
    size: 11,
    font: helvetica,
  });
  yPosition -= 15;
  
  const qualityMap: Record<string, string> = {
    'excellent': 'Excelente',
    'good': 'Boa',
    'poor': 'Ruim',
    'illegible': 'Ilegível',
  };
  page.drawText(`Qualidade da Escrita: ${qualityMap[gradingResult.student_metadata.handwriting_quality]}`, {
    x: margin,
    y: yPosition,
    size: 11,
    font: helvetica,
  });
  yPosition -= 15;
  
  page.drawText(`Data da Avaliação: ${formatDate(gradedAt)}`, {
    x: margin,
    y: yPosition,
    size: 11,
    font: helvetica,
  });
  yPosition -= 25;

  // Score section with highlight
  const maxScore = gradingResult.questions.reduce((sum, q) => sum + q.max_points, 0);
  const scoreText = `PONTUAÇÃO TOTAL: ${gradingResult.total_score} / ${maxScore}`;
  
  page.drawRectangle({
    x: margin,
    y: yPosition - 5,
    width: contentWidth,
    height: 30,
    color: rgb(0.9, 0.95, 1),
    borderColor: rgb(0.1, 0.1, 0.4),
    borderWidth: 1,
  });
  
  page.drawText(scoreText, {
    x: margin + 10,
    y: yPosition + 5,
    size: 14,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.4),
  });
  yPosition -= 45;
  
  // Questions section
  page.drawText('DETALHAMENTO POR QUESTÃO', {
    x: margin,
    y: yPosition,
    size: 12,
    font: helveticaBold,
    color: rgb(0.3, 0.3, 0.3),
  });
  yPosition -= 20;
  
  for (const question of gradingResult.questions) {
    ensureSpace(120);
    
    // Question header
    const statusIcon = question.is_correct ? '✓' : '✗';
    const statusColor = question.is_correct ? rgb(0.1, 0.6, 0.1) : rgb(0.8, 0.1, 0.1);
    
    page.drawText(`Questão ${question.number}: ${question.topic}`, {
      x: margin,
      y: yPosition,
      size: 11,
      font: helveticaBold,
    });
    
    page.drawText(`${statusIcon} ${question.points_awarded}/${question.max_points} pts`, {
      x: pageWidth - margin - 80,
      y: yPosition,
      size: 11,
      font: helveticaBold,
      color: statusColor,
    });
    yPosition -= 15;
    
    // Student response transcription
    page.drawText('Resposta do aluno:', {
      x: margin + 10,
      y: yPosition,
      size: 9,
      font: helveticaBold,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPosition -= 12;
    
    const responseLines = wrapText(question.student_response_transcription, 90);
    for (const line of responseLines.slice(0, 3)) {
      ensureSpace(15);
      page.drawText(line, {
        x: margin + 10,
        y: yPosition,
        size: 9,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= 12;
    }
    if (responseLines.length > 3) {
      page.drawText('...', {
        x: margin + 10,
        y: yPosition,
        size: 9,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });
      yPosition -= 12;
    }
    
    // Feedback
    page.drawText('Feedback:', {
      x: margin + 10,
      y: yPosition,
      size: 9,
      font: helveticaBold,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPosition -= 12;
    
    const feedbackLines = wrapText(question.feedback_for_student, 90);
    for (const line of feedbackLines.slice(0, 3)) {
      ensureSpace(15);
      page.drawText(line, {
        x: margin + 10,
        y: yPosition,
        size: 9,
        font: helvetica,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 12;
    }
    if (feedbackLines.length > 3) {
      page.drawText('...', {
        x: margin + 10,
        y: yPosition,
        size: 9,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });
      yPosition -= 12;
    }
    
    yPosition -= 10;
  }
  
  // Summary comment
  ensureSpace(80);
  page.drawText('COMENTÁRIO GERAL', {
    x: margin,
    y: yPosition,
    size: 12,
    font: helveticaBold,
    color: rgb(0.3, 0.3, 0.3),
  });
  yPosition -= 18;
  
  const summaryLines = wrapText(gradingResult.summary_comment, 85);
  for (const line of summaryLines) {
    ensureSpace(15);
    page.drawText(line, {
      x: margin,
      y: yPosition,
      size: 10,
      font: helvetica,
    });
    yPosition -= 14;
  }
  yPosition -= 20;

  // QR Code section at the bottom
  ensureSpace(180);
  
  // Draw separator line
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: pageWidth - margin, y: yPosition },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
  yPosition -= 20;
  
  page.drawText('VERIFICAÇÃO DE AUTENTICIDADE', {
    x: margin,
    y: yPosition,
    size: 10,
    font: helveticaBold,
    color: rgb(0.3, 0.3, 0.3),
  });
  yPosition -= 15;
  
  page.drawText('Escaneie o QR code para verificar a autenticidade deste relatório:', {
    x: margin,
    y: yPosition,
    size: 9,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4),
  });
  yPosition -= 100;
  
  // Draw QR code
  const qrSize = 80;
  page.drawImage(qrCodeImage, {
    x: margin,
    y: yPosition,
    width: qrSize,
    height: qrSize,
  });
  
  // Verification URL text
  page.drawText(verificationUrl, {
    x: margin + qrSize + 15,
    y: yPosition + qrSize / 2,
    size: 8,
    font: helvetica,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  // Footer
  const footerY = margin - 20;
  page.drawText('Gerado automaticamente pelo EducaSol', {
    x: margin,
    y: footerY,
    size: 8,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText(`Token: ${verificationToken}`, {
    x: pageWidth - margin - 200,
    y: footerY,
    size: 8,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  // Save PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
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

    console.log('Processing generate-report for user:', user.id);

    // Parse and validate request body
    const requestBody = await req.json();
    const validationResult = GenerateReportRequestSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request', 
          details: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { result_id } = validationResult.data;

    // Fetch result with submission and exam details
    const { data: result, error: resultError } = await supabaseClient
      .from('results')
      .select(`
        id,
        ai_output,
        verification_token,
        graded_at,
        pdf_report_url,
        submissions (
          id,
          exam_id,
          exams (
            id,
            title
          )
        )
      `)
      .eq('id', result_id)
      .single();

    if (resultError || !result) {
      console.error('Result fetch error:', resultError);
      return new Response(
        JSON.stringify({ error: 'Result not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate grading result
    const gradingValidation = GradingResultSchema.safeParse(result.ai_output);
    if (!gradingValidation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid grading result data', details: gradingValidation.error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const gradingResult = gradingValidation.data;
    const examTitle = result.submissions?.exams?.title || 'Avaliação';
    const verificationToken = result.verification_token;
    const gradedAt = new Date(result.graded_at);

    console.log('Generating PDF report for result:', result_id);

    // Generate PDF
    const pdfBytes = await generatePDFReport(
      gradingResult,
      examTitle,
      verificationToken,
      gradedAt
    );

    // Store PDF in Supabase Storage
    const storagePath = `${result_id}.pdf`;
    
    const { error: uploadError } = await supabaseClient.storage
      .from('graded-reports')
      .upload(storagePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('PDF upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to store PDF report', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL for the PDF
    const { data: urlData } = supabaseClient.storage
      .from('graded-reports')
      .getPublicUrl(storagePath);

    const pdfUrl = urlData.publicUrl;

    // Update result with PDF URL
    const { error: updateError } = await supabaseClient
      .from('results')
      .update({ pdf_report_url: pdfUrl })
      .eq('id', result_id);

    if (updateError) {
      console.error('Result update error:', updateError);
      // Don't fail the request, PDF was generated successfully
    }

    console.log('PDF report generated successfully:', storagePath);

    // Return success response
    return new Response(
      JSON.stringify({
        pdf_url: pdfUrl,
        verification_token: verificationToken,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-report:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
