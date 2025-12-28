# Requirements Document

## Introduction

This document specifies the requirements for integrating automated assessment capabilities into EducaSol. The feature enables educators to upload scanned handwritten exams (PDFs/images), have them automatically graded using Google Gemini 1.5 Pro's multimodal AI, and generate verifiable PDF reports with QR codes. This integration transforms EducaSol from a content generation platform into a complete educational ecosystem that handles both content creation and assessment evaluation.

## Glossary

- **EducaSol**: The existing educational platform for Brazilian schools, supporting content generation and class management
- **Educator**: A user with the role of teacher, school_admin, or district_admin who creates and manages exams
- **Student**: A learner whose exam submissions are graded by the system
- **Exam**: An assessment entity containing title, description, rubric, and associated class
- **Submission**: A scanned PDF or image file of a student's handwritten exam answers
- **Rubric**: A JSON structure defining grading criteria, point allocations, and expected answers
- **Grading Result**: The AI-generated evaluation output containing scores, feedback, and transcriptions
- **Verification Token**: A UUID that uniquely identifies a grading result for QR code verification
- **Gemini 1.5 Pro**: Google's multimodal AI model used for handwriting recognition and grading
- **Edge Function**: A Supabase serverless function running on Deno runtime

## Requirements

### Requirement 1: Exam Creation and Management

**User Story:** As an educator, I want to create and manage exams with custom rubrics, so that I can define grading criteria before students submit their work.

#### Acceptance Criteria

1. WHEN an educator creates a new exam THEN the EducaSol System SHALL store the exam with title, description, rubric, and associated class_id
2. WHEN an educator provides a rubric THEN the EducaSol System SHALL validate that the rubric contains question definitions with point allocations
3. WHEN an educator updates an exam THEN the EducaSol System SHALL preserve existing submissions and results while updating exam metadata
4. WHEN an educator views their exams THEN the EducaSol System SHALL display only exams belonging to their associated school
5. WHEN an educator deletes an exam with no submissions THEN the EducaSol System SHALL remove the exam record from the database

### Requirement 2: Exam File Upload and Storage

**User Story:** As an educator, I want to upload scanned student exams in bulk, so that I can process multiple submissions efficiently.

#### Acceptance Criteria

1. WHEN an educator uploads a file THEN the EducaSol System SHALL accept only PDF, JPEG, or PNG formats
2. WHEN an educator uploads a file exceeding 10MB THEN the EducaSol System SHALL reject the upload and display a size limit error
3. WHEN a valid file is uploaded THEN the EducaSol System SHALL store the file in Supabase Storage with path structure user_{id}/exam_{id}/{timestamp}_{filename}
4. WHEN a file is successfully stored THEN the EducaSol System SHALL create a submission record with storage_path and status set to uploaded
5. WHEN an educator uploads multiple files THEN the EducaSol System SHALL process each file independently and report individual success or failure status

### Requirement 3: AI-Powered Grading Engine

**User Story:** As an educator, I want the system to automatically grade handwritten exams using AI, so that I can save time and ensure consistent evaluation.

#### Acceptance Criteria

1. WHEN a submission is queued for grading THEN the EducaSol System SHALL retrieve the file from storage and convert it to Base64 format
2. WHEN the grading process starts THEN the EducaSol System SHALL construct a prompt combining the exam rubric and system instructions for Gemini 1.5 Pro
3. WHEN calling the Gemini API THEN the EducaSol System SHALL enforce JSON schema output using response_mime_type and response_schema parameters
4. WHEN Gemini returns a valid response THEN the EducaSol System SHALL parse the JSON and store it in the results table with the submission_id
5. WHEN the Gemini API returns an error or times out THEN the EducaSol System SHALL implement exponential backoff retry logic up to 3 attempts
6. WHEN grading completes successfully THEN the EducaSol System SHALL update the submission status to graded
7. WHEN grading fails after all retries THEN the EducaSol System SHALL update the submission status to failed and log the error

### Requirement 4: Grading Result JSON Schema

**User Story:** As a developer, I want the AI output to follow a strict schema, so that the frontend can reliably display grading results.

#### Acceptance Criteria

1. WHEN Gemini generates output THEN the EducaSol System SHALL enforce a schema containing student_metadata, questions array, summary_comment, and total_score
2. WHEN processing student_metadata THEN the EducaSol System SHALL extract name, student_id, and handwriting_quality fields
3. WHEN processing each question THEN the EducaSol System SHALL include number, topic, student_response_transcription, is_correct, points_awarded, max_points, reasoning, and feedback_for_student
4. WHEN serializing grading results THEN the EducaSol System SHALL store the complete JSON in the ai_output column of the results table
5. WHEN deserializing grading results THEN the EducaSol System SHALL parse the ai_output JSON and reconstruct the typed result object

### Requirement 5: PDF Report Generation

**User Story:** As an educator, I want to generate professional PDF reports for each graded exam, so that students receive official documentation of their results.

#### Acceptance Criteria

1. WHEN an educator requests a PDF report THEN the EducaSol System SHALL generate a document using React-PDF containing student info, scores, and feedback
2. WHEN generating the PDF THEN the EducaSol System SHALL include a QR code linking to the verification URL with the result's verification_token
3. WHEN the QR code is generated THEN the EducaSol System SHALL create a Base64 Data URI using the qrcode library compatible with Deno
4. WHEN the PDF is complete THEN the EducaSol System SHALL store it in Supabase Storage bucket graded-reports and update the pdf_report_url in results
5. WHEN an educator downloads a report THEN the EducaSol System SHALL stream the PDF binary from storage to the browser

### Requirement 6: Grade Verification System

**User Story:** As a third party (registrar, parent), I want to verify the authenticity of a grade report by scanning its QR code, so that I can trust the document has not been altered.

#### Acceptance Criteria

1. WHEN a QR code is scanned THEN the EducaSol System SHALL redirect to a public verification page with the verification_token as a URL parameter
2. WHEN the verification page loads THEN the EducaSol System SHALL query the results table using the verification_token
3. WHEN a valid token is found THEN the EducaSol System SHALL display student initials, exam title, date, and total score
4. WHEN an invalid or missing token is provided THEN the EducaSol System SHALL display a verification failed message
5. WHEN the verification endpoint receives excessive requests THEN the EducaSol System SHALL apply rate limiting to prevent enumeration attacks

### Requirement 7: Role-Based Access Control for Assessments

**User Story:** As a system administrator, I want assessment data protected by role-based access, so that users can only access data they are authorized to view.

#### Acceptance Criteria

1. WHEN an educator queries exams THEN the EducaSol System SHALL return only exams where educator_id matches the authenticated user or user belongs to the same school
2. WHEN a student accesses results THEN the EducaSol System SHALL return only results where the student_identifier matches their profile
3. WHEN RLS policies are applied THEN the EducaSol System SHALL enforce access control at the database level using auth.uid() checks
4. WHEN a user attempts unauthorized access THEN the EducaSol System SHALL return an empty result set rather than an error to prevent information leakage

### Requirement 8: Dashboard Integration

**User Story:** As an educator, I want to view grading progress and results in my dashboard, so that I can monitor the status of all submissions.

#### Acceptance Criteria

1. WHEN an educator views the assessment dashboard THEN the EducaSol System SHALL display a list of exams with submission counts and grading status
2. WHEN submissions are being processed THEN the EducaSol System SHALL show real-time status updates using Supabase Realtime subscriptions
3. WHEN an educator clicks on an exam THEN the EducaSol System SHALL display all submissions with their individual grading status and scores
4. WHEN an educator clicks on a graded submission THEN the EducaSol System SHALL display the detailed AI feedback and transcription
5. WHEN filtering results THEN the EducaSol System SHALL support filtering by status (uploaded, processing, graded, failed) and score range
