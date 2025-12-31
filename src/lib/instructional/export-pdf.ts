/**
 * PDF Export Utility for Instructional Design Platform
 * Requirements: 12.1, 12.2, 12.4
 * 
 * Provides PDF export functionality for lesson plans, quizzes, and worksheets
 * with consistent formatting and branding.
 */

import jsPDF from 'jspdf';
import type { LessonPlan } from './lesson-plan';
import type { Quiz } from './quiz';
import type { Worksheet } from './worksheet';

// Brand colors
const COLORS = {
  primary: '#6366f1', // Indigo
  secondary: '#8b5cf6', // Violet
  text: '#1f2937', // Gray-800
  textLight: '#6b7280', // Gray-500
  border: '#e5e7eb', // Gray-200
};

// Font sizes
const FONT_SIZES = {
  title: 24,
  subtitle: 16,
  heading: 14,
  body: 11,
  small: 9,
};

// Page margins
const MARGINS = {
  top: 20,
  bottom: 20,
  left: 20,
  right: 20,
};

/**
 * Helper to add page header with branding
 */
function addHeader(doc: jsPDF, title: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Brand header bar
  doc.setFillColor(99, 102, 241); // primary color
  doc.rect(0, 0, pageWidth, 15, 'F');
  
  // Brand name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Educasol', MARGINS.left, 10);
  
  // Document title
  doc.setTextColor(COLORS.text);
  doc.setFontSize(FONT_SIZES.title);
  doc.setFont('helvetica', 'bold');
  doc.text(title, MARGINS.left, 35);
  
  return 45; // Return Y position after header
}

/**
 * Helper to add page footer
 */
function addFooter(doc: jsPDF, pageNumber: number): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setTextColor(COLORS.textLight);
  doc.setFontSize(FONT_SIZES.small);
  doc.setFont('helvetica', 'normal');
  
  // Page number
  doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Generated date
  const date = new Date().toLocaleDateString();
  doc.text(`Generated: ${date}`, pageWidth - MARGINS.right, pageHeight - 10, { align: 'right' });
}

/**
 * Helper to add a section heading
 */
function addSectionHeading(doc: jsPDF, text: string, y: number): number {
  doc.setTextColor(COLORS.primary);
  doc.setFontSize(FONT_SIZES.heading);
  doc.setFont('helvetica', 'bold');
  doc.text(text, MARGINS.left, y);
  
  // Underline
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setDrawColor(COLORS.border);
  doc.line(MARGINS.left, y + 2, pageWidth - MARGINS.right, y + 2);
  
  return y + 10;
}

/**
 * Helper to add wrapped text and return new Y position
 */
function addWrappedText(doc: jsPDF, text: string, y: number, maxWidth?: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const width = maxWidth || (pageWidth - MARGINS.left - MARGINS.right);
  
  doc.setTextColor(COLORS.text);
  doc.setFontSize(FONT_SIZES.body);
  doc.setFont('helvetica', 'normal');
  
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, MARGINS.left, y);
  
  return y + (lines.length * 5) + 3;
}

/**
 * Check if we need a new page
 */
function checkNewPage(doc: jsPDF, currentY: number, neededSpace: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  
  if (currentY + neededSpace > pageHeight - MARGINS.bottom) {
    doc.addPage();
    addFooter(doc, doc.getNumberOfPages() - 1);
    return MARGINS.top + 10;
  }
  
  return currentY;
}

/**
 * Export a lesson plan to PDF
 * Requirements: 12.1, 12.4
 */
export function exportLessonPlanToPDF(lessonPlan: LessonPlan): Blob {
  const doc = new jsPDF();
  let y = addHeader(doc, lessonPlan.topic);
  
  // Metadata section
  doc.setTextColor(COLORS.textLight);
  doc.setFontSize(FONT_SIZES.body);
  doc.text(`Grade: ${lessonPlan.gradeLevel} | Subject: ${lessonPlan.subject} | Duration: ${lessonPlan.duration} min`, MARGINS.left, y);
  y += 8;
  doc.text(`Date: ${new Date(lessonPlan.date).toLocaleDateString()}`, MARGINS.left, y);
  y += 10;
  
  // Standards
  y = addSectionHeading(doc, 'Standards', y);
  lessonPlan.standards.forEach(standard => {
    y = addWrappedText(doc, `• ${standard}`, y);
  });
  y += 5;
  
  // Learning Objective
  y = checkNewPage(doc, y, 30);
  y = addSectionHeading(doc, 'Learning Objective', y);
  y = addWrappedText(doc, lessonPlan.learningObjective, y);
  y += 5;
  
  // Key Vocabulary
  y = checkNewPage(doc, y, 40);
  y = addSectionHeading(doc, 'Key Vocabulary', y);
  lessonPlan.keyVocabulary.forEach(vocab => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${vocab.term}: `, MARGINS.left, y);
    const termWidth = doc.getTextWidth(`${vocab.term}: `);
    doc.setFont('helvetica', 'normal');
    const defLines = doc.splitTextToSize(vocab.definition, doc.internal.pageSize.getWidth() - MARGINS.left - MARGINS.right - termWidth);
    doc.text(defLines, MARGINS.left + termWidth, y);
    y += (defLines.length * 5) + 3;
    y = checkNewPage(doc, y, 15);
  });
  y += 5;
  
  // Materials Needed
  if (lessonPlan.materialsNeeded.length > 0) {
    y = checkNewPage(doc, y, 30);
    y = addSectionHeading(doc, 'Materials Needed', y);
    lessonPlan.materialsNeeded.forEach(material => {
      y = addWrappedText(doc, `• ${material}`, y);
    });
    y += 5;
  }
  
  // Lesson Phases
  y = checkNewPage(doc, y, 50);
  y = addSectionHeading(doc, 'Lesson Phases', y);
  
  lessonPlan.phases.forEach((phase, index) => {
    y = checkNewPage(doc, y, 40);
    
    // Phase header
    doc.setFillColor(243, 244, 246); // Gray-100
    doc.rect(MARGINS.left, y - 4, doc.internal.pageSize.getWidth() - MARGINS.left - MARGINS.right, 8, 'F');
    doc.setTextColor(COLORS.text);
    doc.setFontSize(FONT_SIZES.body);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${phase.name} (${phase.duration} min)`, MARGINS.left + 2, y);
    y += 10;
    
    // Teacher Script
    doc.setFont('helvetica', 'bold');
    doc.text('Teacher Script:', MARGINS.left, y);
    y += 5;
    y = addWrappedText(doc, phase.teacherScript, y);
    
    // Student Action
    y = checkNewPage(doc, y, 20);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Action:', MARGINS.left, y);
    y += 5;
    y = addWrappedText(doc, phase.studentAction, y);
    
    // Differentiation Notes
    if (phase.differentiationNotes) {
      y = checkNewPage(doc, y, 25);
      doc.setTextColor(COLORS.secondary);
      doc.setFont('helvetica', 'italic');
      doc.text('Support: ', MARGINS.left, y);
      doc.setTextColor(COLORS.text);
      doc.setFont('helvetica', 'normal');
      y = addWrappedText(doc, phase.differentiationNotes.support, y + 5);
      
      doc.setTextColor(COLORS.secondary);
      doc.setFont('helvetica', 'italic');
      doc.text('Extension: ', MARGINS.left, y);
      doc.setTextColor(COLORS.text);
      doc.setFont('helvetica', 'normal');
      y = addWrappedText(doc, phase.differentiationNotes.extension, y + 5);
    }
    
    y += 8;
  });
  
  // Formative Assessment
  y = checkNewPage(doc, y, 30);
  y = addSectionHeading(doc, 'Formative Assessment', y);
  doc.setFont('helvetica', 'bold');
  doc.text(`Type: ${lessonPlan.formativeAssessment.type}`, MARGINS.left, y);
  y += 6;
  y = addWrappedText(doc, lessonPlan.formativeAssessment.question, y);
  
  // Add footer to last page
  addFooter(doc, doc.getNumberOfPages());
  
  return doc.output('blob');
}

/**
 * Export a quiz to PDF
 * Requirements: 12.2, 12.4
 */
export function exportQuizToPDF(quiz: Quiz): Blob {
  const doc = new jsPDF();
  let y = addHeader(doc, quiz.title);
  
  // Instructions
  y = addSectionHeading(doc, 'Instructions', y);
  y = addWrappedText(doc, quiz.instructions, y);
  y += 10;
  
  // Questions
  y = addSectionHeading(doc, 'Questions', y);
  
  quiz.questions.forEach((question, index) => {
    y = checkNewPage(doc, y, 50);
    
    // Question number and text
    doc.setTextColor(COLORS.text);
    doc.setFontSize(FONT_SIZES.body);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. `, MARGINS.left, y);
    
    const questionLines = doc.splitTextToSize(
      question.text,
      doc.internal.pageSize.getWidth() - MARGINS.left - MARGINS.right - 10
    );
    doc.setFont('helvetica', 'normal');
    doc.text(questionLines, MARGINS.left + 10, y);
    y += (questionLines.length * 5) + 5;
    
    // Bloom's level badge
    doc.setTextColor(COLORS.secondary);
    doc.setFontSize(FONT_SIZES.small);
    doc.text(`[${question.bloomLevel.toUpperCase()}]`, MARGINS.left + 10, y);
    y += 6;
    
    // Options for multiple choice and true/false
    if (question.options && question.options.length > 0) {
      const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
      question.options.forEach((option, optIndex) => {
        doc.setTextColor(COLORS.text);
        doc.setFontSize(FONT_SIZES.body);
        doc.text(`${optionLabels[optIndex]}. ${option}`, MARGINS.left + 15, y);
        y += 6;
      });
    }
    
    // Answer line for short answer
    if (question.type === 'short-answer') {
      doc.setDrawColor(COLORS.border);
      doc.line(MARGINS.left + 15, y + 2, doc.internal.pageSize.getWidth() - MARGINS.right, y + 2);
      y += 10;
    }
    
    y += 8;
  });
  
  // Answer Key (new page)
  doc.addPage();
  addFooter(doc, doc.getNumberOfPages() - 1);
  y = addHeader(doc, `${quiz.title} - Answer Key`);
  
  quiz.questions.forEach((question, index) => {
    y = checkNewPage(doc, y, 30);
    
    doc.setTextColor(COLORS.text);
    doc.setFontSize(FONT_SIZES.body);
    doc.setFont('helvetica', 'bold');
    
    let answer = '';
    if (question.type === 'multiple-choice' && question.options && question.correctOptionIndex !== undefined) {
      const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
      answer = `${optionLabels[question.correctOptionIndex]}. ${question.options[question.correctOptionIndex]}`;
    } else if (question.type === 'true-false' && question.correctOptionIndex !== undefined) {
      answer = question.options?.[question.correctOptionIndex] || '';
    } else if (question.correctAnswer) {
      answer = question.correctAnswer;
    }
    
    doc.text(`${index + 1}. ${answer}`, MARGINS.left, y);
    y += 6;
    
    // Explanation
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(COLORS.textLight);
    const explLines = doc.splitTextToSize(
      `Explanation: ${question.explanation}`,
      doc.internal.pageSize.getWidth() - MARGINS.left - MARGINS.right - 10
    );
    doc.text(explLines, MARGINS.left + 5, y);
    y += (explLines.length * 5) + 8;
  });
  
  addFooter(doc, doc.getNumberOfPages());
  
  return doc.output('blob');
}

/**
 * Export a worksheet to PDF
 * Requirements: 12.2, 12.4
 */
export function exportWorksheetToPDF(worksheet: Worksheet): Blob {
  const doc = new jsPDF();
  let y = addHeader(doc, worksheet.title);
  
  // Name and Date fields
  doc.setTextColor(COLORS.text);
  doc.setFontSize(FONT_SIZES.body);
  doc.text('Name: _______________________', MARGINS.left, y);
  doc.text('Date: _______________', doc.internal.pageSize.getWidth() - MARGINS.right - 50, y);
  y += 15;
  
  // Sections
  worksheet.sections.forEach((section, sectionIndex) => {
    y = checkNewPage(doc, y, 40);
    y = addSectionHeading(doc, `Section ${sectionIndex + 1}: ${section.type.replace('-', ' ').toUpperCase()}`, y);
    y = addWrappedText(doc, section.instructions, y);
    y += 5;
    
    const content = section.content as Record<string, unknown>;
    
    if (section.type === 'vocabulary-matching' && 'terms' in content) {
      const terms = content.terms as Array<{ term: string; definition: string }>;
      
      // Terms column
      doc.setFont('helvetica', 'bold');
      doc.text('Terms:', MARGINS.left, y);
      y += 6;
      
      terms.forEach((item, idx) => {
        doc.setFont('helvetica', 'normal');
        doc.text(`${idx + 1}. ${item.term}`, MARGINS.left + 5, y);
        y += 6;
      });
      
      y += 5;
      
      // Definitions column (shuffled order hint)
      doc.setFont('helvetica', 'bold');
      doc.text('Definitions:', MARGINS.left, y);
      y += 6;
      
      const shuffledDefs = [...terms].sort(() => Math.random() - 0.5);
      const defLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      shuffledDefs.forEach((item, idx) => {
        doc.setFont('helvetica', 'normal');
        const defLines = doc.splitTextToSize(
          `${defLabels[idx]}. ${item.definition}`,
          doc.internal.pageSize.getWidth() - MARGINS.left - MARGINS.right - 10
        );
        doc.text(defLines, MARGINS.left + 5, y);
        y += (defLines.length * 5) + 2;
        y = checkNewPage(doc, y, 15);
      });
    }
    
    if (section.type === 'cloze' && 'text' in content) {
      const cloze = content as { text: string; answers: string[] };
      y = addWrappedText(doc, cloze.text, y);
      y += 10;
      
      // Word bank
      doc.setFont('helvetica', 'bold');
      doc.text('Word Bank:', MARGINS.left, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(cloze.answers.join('   |   '), MARGINS.left + 5, y);
      y += 10;
    }
    
    if (section.type === 'short-answer' && 'questions' in content) {
      const questions = content.questions as Array<{ question: string; expectedAnswer: string }>;
      
      questions.forEach((q, idx) => {
        y = checkNewPage(doc, y, 25);
        doc.setFont('helvetica', 'normal');
        y = addWrappedText(doc, `${idx + 1}. ${q.question}`, y);
        
        // Answer lines
        doc.setDrawColor(COLORS.border);
        for (let i = 0; i < 3; i++) {
          doc.line(MARGINS.left + 5, y + 3, doc.internal.pageSize.getWidth() - MARGINS.right, y + 3);
          y += 8;
        }
        y += 5;
      });
    }
    
    if (section.type === 'diagram-labeling' && 'imageDescription' in content) {
      const diagram = content as { imageDescription: string; labels: Array<{ position: string; answer: string }> };
      
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(COLORS.textLight);
      y = addWrappedText(doc, `[Diagram: ${diagram.imageDescription}]`, y);
      y += 5;
      
      doc.setTextColor(COLORS.text);
      doc.setFont('helvetica', 'normal');
      diagram.labels.forEach((label, idx) => {
        doc.text(`${idx + 1}. ${label.position}: _______________`, MARGINS.left + 5, y);
        y += 6;
      });
    }
    
    y += 10;
  });
  
  addFooter(doc, doc.getNumberOfPages());
  
  return doc.output('blob');
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export and download a lesson plan as PDF
 */
export function downloadLessonPlanPDF(lessonPlan: LessonPlan, filename?: string): void {
  const blob = exportLessonPlanToPDF(lessonPlan);
  const name = filename || `lesson-plan-${lessonPlan.topic.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  downloadBlob(blob, name);
}

/**
 * Export and download a quiz as PDF
 */
export function downloadQuizPDF(quiz: Quiz, filename?: string): void {
  const blob = exportQuizToPDF(quiz);
  const name = filename || `quiz-${quiz.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  downloadBlob(blob, name);
}

/**
 * Export and download a worksheet as PDF
 */
export function downloadWorksheetPDF(worksheet: Worksheet, filename?: string): void {
  const blob = exportWorksheetToPDF(worksheet);
  const name = filename || `worksheet-${worksheet.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  downloadBlob(blob, name);
}
