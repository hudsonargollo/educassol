/**
 * CSV Export Utility for Instructional Design Platform
 * Requirement: 12.2
 * 
 * Provides CSV export functionality for quizzes,
 * enabling import into LMS platforms and spreadsheet applications.
 */

import type { Quiz, QuizQuestion } from './quiz';

/**
 * Escape a value for CSV format
 * Handles quotes, commas, and newlines
 */
function escapeCSV(value: string | number | undefined): string {
  if (value === undefined || value === null) {
    return '';
  }
  
  const str = String(value);
  
  // If the value contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Convert an array of values to a CSV row
 */
function toCSVRow(values: (string | number | undefined)[]): string {
  return values.map(escapeCSV).join(',');
}

/**
 * Get the correct answer text for a question
 */
function getCorrectAnswer(question: QuizQuestion): string {
  if (question.type === 'multiple-choice' || question.type === 'true-false') {
    if (question.options && question.correctOptionIndex !== undefined) {
      return question.options[question.correctOptionIndex];
    }
  }
  
  if (question.type === 'short-answer' && question.correctAnswer) {
    return question.correctAnswer;
  }
  
  return '';
}

/**
 * Get the correct option letter for multiple choice questions
 */
function getCorrectOptionLetter(question: QuizQuestion): string {
  if ((question.type === 'multiple-choice' || question.type === 'true-false') && 
      question.correctOptionIndex !== undefined) {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    return letters[question.correctOptionIndex] || '';
  }
  return '';
}

/**
 * Export quiz to CSV format (Questions and Answers)
 * Requirement: 12.2 - Export quizzes as CSV format
 * 
 * CSV Format:
 * Question Number, Question Text, Type, Option A, Option B, Option C, Option D, Correct Answer, Correct Letter, Bloom's Level, Explanation
 */
export function exportQuizToCSV(quiz: Quiz): string {
  const headers = [
    'Question Number',
    'Question Text',
    'Type',
    'Option A',
    'Option B',
    'Option C',
    'Option D',
    'Correct Answer',
    'Correct Letter',
    "Bloom's Level",
    'Explanation',
  ];
  
  const rows: string[] = [toCSVRow(headers)];
  
  quiz.questions.forEach((question, index) => {
    const options = question.options || [];
    
    const row = [
      index + 1,
      question.text,
      question.type,
      options[0] || '',
      options[1] || '',
      options[2] || '',
      options[3] || '',
      getCorrectAnswer(question),
      getCorrectOptionLetter(question),
      question.bloomLevel,
      question.explanation,
    ];
    
    rows.push(toCSVRow(row));
  });
  
  return rows.join('\n');
}

/**
 * Export quiz to CSV format for LMS import (simplified format)
 * Many LMS platforms expect a specific format for quiz import
 * 
 * CSV Format:
 * Type, Question, Answer, Distractor1, Distractor2, Distractor3, Points
 */
export function exportQuizToLMSCSV(quiz: Quiz, pointsPerQuestion: number = 1): string {
  const headers = [
    'Type',
    'Question',
    'Answer',
    'Distractor1',
    'Distractor2',
    'Distractor3',
    'Points',
  ];
  
  const rows: string[] = [toCSVRow(headers)];
  
  quiz.questions.forEach(question => {
    let type = '';
    let answer = '';
    const distractors: string[] = [];
    
    switch (question.type) {
      case 'multiple-choice':
        type = 'MC';
        if (question.options && question.correctOptionIndex !== undefined) {
          answer = question.options[question.correctOptionIndex];
          question.options.forEach((opt, idx) => {
            if (idx !== question.correctOptionIndex) {
              distractors.push(opt);
            }
          });
        }
        break;
        
      case 'true-false':
        type = 'TF';
        if (question.options && question.correctOptionIndex !== undefined) {
          answer = question.options[question.correctOptionIndex];
        }
        break;
        
      case 'short-answer':
        type = 'SA';
        answer = question.correctAnswer || '';
        break;
    }
    
    const row = [
      type,
      question.text,
      answer,
      distractors[0] || '',
      distractors[1] || '',
      distractors[2] || '',
      pointsPerQuestion,
    ];
    
    rows.push(toCSVRow(row));
  });
  
  return rows.join('\n');
}

/**
 * Export quiz answer key to CSV
 * Simple format for grading reference
 * 
 * CSV Format:
 * Question Number, Correct Answer, Explanation
 */
export function exportQuizAnswerKeyToCSV(quiz: Quiz): string {
  const headers = ['Question Number', 'Correct Answer', 'Explanation'];
  const rows: string[] = [toCSVRow(headers)];
  
  quiz.questions.forEach((question, index) => {
    const row = [
      index + 1,
      getCorrectAnswer(question),
      question.explanation,
    ];
    
    rows.push(toCSVRow(row));
  });
  
  return rows.join('\n');
}

/**
 * Create a Blob from CSV content
 */
export function csvToBlob(csvContent: string): Blob {
  // Add BOM for Excel compatibility with UTF-8
  const BOM = '\uFEFF';
  return new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
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
 * Export and download quiz as CSV
 */
export function downloadQuizCSV(quiz: Quiz, filename?: string): void {
  const csvContent = exportQuizToCSV(quiz);
  const blob = csvToBlob(csvContent);
  const name = filename || `quiz-${quiz.title.replace(/\s+/g, '-').toLowerCase()}.csv`;
  downloadBlob(blob, name);
}

/**
 * Export and download quiz in LMS format
 */
export function downloadQuizLMSCSV(quiz: Quiz, filename?: string, pointsPerQuestion?: number): void {
  const csvContent = exportQuizToLMSCSV(quiz, pointsPerQuestion);
  const blob = csvToBlob(csvContent);
  const name = filename || `quiz-lms-${quiz.title.replace(/\s+/g, '-').toLowerCase()}.csv`;
  downloadBlob(blob, name);
}

/**
 * Export and download quiz answer key as CSV
 */
export function downloadQuizAnswerKeyCSV(quiz: Quiz, filename?: string): void {
  const csvContent = exportQuizAnswerKeyToCSV(quiz);
  const blob = csvToBlob(csvContent);
  const name = filename || `quiz-answers-${quiz.title.replace(/\s+/g, '-').toLowerCase()}.csv`;
  downloadBlob(blob, name);
}
