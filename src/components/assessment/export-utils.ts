/**
 * Export utilities for grading results
 * Provides PDF and CSV export functionality
 * 
 * Requirements: 6.3 - Generate formatted report suitable for sharing
 */

import type { GradingResult, QuestionResult } from '@/lib/assessment/grading-result';
import { calculateFinalScore, getOverride } from '@/lib/assessment/override';

/**
 * Formats a date for display in exports
 */
function formatExportDate(date: Date = new Date()): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Escapes special characters for CSV
 */
function escapeCSV(value: string | number | boolean | undefined): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  // If contains comma, newline, or quote, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Gets the effective score for a question (override if present, otherwise AI score)
 */
function getEffectiveScore(question: QuestionResult, gradingResult: GradingResult): number {
  const override = getOverride(gradingResult, question.number);
  return override ? override.overrideScore : question.points_awarded;
}


/**
 * Generates CSV content from grading result
 */
export function generateCSVContent(
  gradingResult: GradingResult,
  examTitle?: string,
  studentIdentifier?: string | null
): string {
  const lines: string[] = [];
  const finalScore = calculateFinalScore(gradingResult);
  const maxScore = gradingResult.questions.reduce((sum, q) => sum + q.max_points, 0);
  
  // Header section
  lines.push('Relatório de Avaliação');
  lines.push(`Prova,${escapeCSV(examTitle || 'Não especificada')}`);
  lines.push(`Aluno,${escapeCSV(gradingResult.student_metadata.name || studentIdentifier || 'Não identificado')}`);
  lines.push(`ID do Aluno,${escapeCSV(gradingResult.student_metadata.student_id)}`);
  lines.push(`Qualidade da Escrita,${escapeCSV(gradingResult.student_metadata.handwriting_quality)}`);
  lines.push(`Pontuação Final,${finalScore}/${maxScore}`);
  lines.push(`Data de Exportação,${formatExportDate()}`);
  lines.push('');
  
  // Questions header
  lines.push('Questão,Tópico,Pontos Obtidos,Pontos Máximos,Ajustado,Pontos Originais,Correto,Resposta do Aluno,Análise da IA,Feedback');
  
  // Questions data
  for (const question of gradingResult.questions) {
    const override = getOverride(gradingResult, question.number);
    const effectiveScore = getEffectiveScore(question, gradingResult);
    const isOverridden = override !== undefined;
    
    lines.push([
      escapeCSV(question.number),
      escapeCSV(question.topic),
      escapeCSV(effectiveScore),
      escapeCSV(question.max_points),
      escapeCSV(isOverridden ? 'Sim' : 'Não'),
      escapeCSV(isOverridden ? override.originalScore : ''),
      escapeCSV(question.is_correct ? 'Sim' : 'Não'),
      escapeCSV(question.student_response_transcription),
      escapeCSV(question.reasoning),
      escapeCSV(question.feedback_for_student),
    ].join(','));
  }
  
  // Summary
  lines.push('');
  lines.push('Comentário Geral');
  lines.push(escapeCSV(gradingResult.summary_comment));
  
  return lines.join('\n');
}


/**
 * Exports grading result to CSV file
 */
export function exportToCSV(
  gradingResult: GradingResult,
  examTitle?: string,
  studentIdentifier?: string | null
): void {
  const csvContent = generateCSVContent(gradingResult, examTitle, studentIdentifier);
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const studentName = gradingResult.student_metadata.name || studentIdentifier || 'aluno';
  const sanitizedName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `resultado_${sanitizedName}_${Date.now()}.csv`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates HTML content for PDF export
 */
function generatePDFHTML(
  gradingResult: GradingResult,
  examTitle?: string,
  studentIdentifier?: string | null
): string {
  const finalScore = calculateFinalScore(gradingResult);
  const maxScore = gradingResult.questions.reduce((sum, q) => sum + q.max_points, 0);
  const scorePercentage = maxScore > 0 ? ((finalScore / maxScore) * 100).toFixed(1) : '0';
  const overrideCount = gradingResult.overrides?.length ?? 0;
  
  const questionsHTML = gradingResult.questions.map((question) => {
    const override = getOverride(gradingResult, question.number);
    const effectiveScore = getEffectiveScore(question, gradingResult);
    const isOverridden = override !== undefined;
    
    return `
      <div class="question-card">
        <div class="question-header">
          <span class="question-number">Questão ${question.number}</span>
          <span class="question-topic">${question.topic}</span>
          <span class="question-score ${isOverridden ? 'overridden' : ''}">${effectiveScore}/${question.max_points} pts</span>
        </div>
        ${isOverridden ? `<div class="override-badge">Ajustado (original: ${override.originalScore} pts)</div>` : ''}
        <div class="question-section">
          <strong>Resposta do Aluno:</strong>
          <p>${question.student_response_transcription || 'Resposta não identificada'}</p>
        </div>
        <div class="question-section">
          <strong>Análise da IA:</strong>
          <p>${question.reasoning}</p>
        </div>
        <div class="question-section feedback">
          <strong>Feedback para o Aluno:</strong>
          <p>${question.feedback_for_student}</p>
        </div>
      </div>
    `;
  }).join('');


  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Resultado da Avaliação - ${examTitle || 'Prova'}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #0F172A; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #E2E8F0; }
        .header h1 { color: #2563EB; font-size: 24px; margin-bottom: 8px; }
        .header .exam-title { color: #64748B; font-size: 16px; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px; }
        .summary-card { background: #F1F5F9; border-radius: 8px; padding: 16px; }
        .summary-card .label { font-size: 12px; color: #64748B; text-transform: uppercase; margin-bottom: 4px; }
        .summary-card .value { font-size: 20px; font-weight: 600; color: #0F172A; }
        .summary-card .sub { font-size: 12px; color: #64748B; }
        .score-card { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; }
        .score-card .label, .score-card .sub { color: rgba(255,255,255,0.8); }
        .score-card .value { color: white; }
        .override-banner { background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; color: #92400E; }
        .summary-comment { background: #EFF6FF; border-left: 4px solid #2563EB; padding: 16px; margin-bottom: 30px; border-radius: 0 8px 8px 0; }
        .summary-comment h3 { font-size: 14px; color: #2563EB; margin-bottom: 8px; }
        .question-card { border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; margin-bottom: 16px; page-break-inside: avoid; }
        .question-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
        .question-number { background: #2563EB; color: white; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 14px; }
        .question-topic { flex: 1; font-weight: 500; }
        .question-score { font-weight: 600; color: #10B981; }
        .question-score.overridden { color: #F59E0B; }
        .override-badge { background: #FEF3C7; color: #92400E; font-size: 12px; padding: 4px 8px; border-radius: 4px; margin-bottom: 12px; display: inline-block; }
        .question-section { margin-bottom: 12px; }
        .question-section strong { display: block; font-size: 12px; color: #64748B; text-transform: uppercase; margin-bottom: 4px; }
        .question-section p { background: #F8FAFC; padding: 12px; border-radius: 6px; font-size: 14px; }
        .question-section.feedback p { background: #F0FDF4; border-left: 3px solid #10B981; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0; color: #64748B; font-size: 12px; }
        @media print { body { padding: 20px; } .question-card { break-inside: avoid; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Resultado da Avaliação</h1>
        <div class="exam-title">${examTitle || 'Prova'}</div>
      </div>
      
      <div class="summary-grid">
        <div class="summary-card">
          <div class="label">Aluno</div>
          <div class="value">${gradingResult.student_metadata.name || studentIdentifier || 'Não identificado'}</div>
          <div class="sub">ID: ${gradingResult.student_metadata.student_id || 'N/A'}</div>
        </div>
        <div class="summary-card score-card">
          <div class="label">Pontuação Final</div>
          <div class="value">${finalScore.toFixed(1)} / ${maxScore}</div>
          <div class="sub">${scorePercentage}% de aproveitamento</div>
        </div>
        <div class="summary-card">
          <div class="label">Questões</div>
          <div class="value">${gradingResult.questions.filter(q => q.is_correct).length} / ${gradingResult.questions.length}</div>
          <div class="sub">corretas</div>
        </div>
      </div>
      
      ${overrideCount > 0 ? `<div class="override-banner">⚠️ ${overrideCount} ${overrideCount === 1 ? 'nota foi ajustada' : 'notas foram ajustadas'} manualmente pelo professor</div>` : ''}
      
      <div class="summary-comment">
        <h3>Comentário Geral</h3>
        <p>${gradingResult.summary_comment}</p>
      </div>
      
      <h2 style="margin-bottom: 16px; font-size: 18px;">Detalhamento por Questão</h2>
      ${questionsHTML}
      
      <div class="footer">
        <p>Relatório gerado em ${formatExportDate()} • Educassol</p>
      </div>
    </body>
    </html>
  `;
}


/**
 * Exports grading result to PDF using browser print functionality
 * Opens a new window with formatted HTML and triggers print dialog
 */
export async function exportToPDF(
  gradingResult: GradingResult,
  examTitle?: string,
  studentIdentifier?: string | null
): Promise<void> {
  const htmlContent = generatePDFHTML(gradingResult, examTitle, studentIdentifier);
  
  // Open new window with the HTML content
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Não foi possível abrir a janela de impressão. Verifique se pop-ups estão permitidos.');
  }
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load then trigger print
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

/**
 * Export format type
 */
export type ExportFormat = 'pdf' | 'csv';

/**
 * Export grading result to specified format
 */
export async function exportGradingResult(
  gradingResult: GradingResult,
  format: ExportFormat,
  examTitle?: string,
  studentIdentifier?: string | null
): Promise<void> {
  if (format === 'pdf') {
    await exportToPDF(gradingResult, examTitle, studentIdentifier);
  } else {
    exportToCSV(gradingResult, examTitle, studentIdentifier);
  }
}
