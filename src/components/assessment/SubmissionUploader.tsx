import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  CloudUpload
} from "lucide-react";
import { 
  validateFile, 
  ALLOWED_MIME_TYPES, 
  MAX_FILE_SIZE_BYTES,
  generateStoragePath 
} from "@/lib/assessment";
import { EDUCASSOL_COLORS } from "@/lib/colors";
import { FADE_UP_ITEM, STAGGER_PARENT, EDUCASSOL_SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AccessControlGuard } from "./AccessControlGuard";
import type { ExamAccessContext, SubmissionAccessContext } from "@/lib/assessment/access-control";

/**
 * Upload progress status
 */
export type UploadStatus = 'idle' | 'validating' | 'uploading' | 'processing' | 'complete' | 'error';

/**
 * Upload progress state
 */
export interface UploadProgress {
  status: UploadStatus;
  progress: number; // 0-100
  message: string;
}

/**
 * Submission data returned after successful upload
 */
export interface Submission {
  id: string;
  examId: string;
  storagePath: string;
  fileType: string;
  uploadedAt: Date;
}

/**
 * Props for SubmissionUploader component
 */
export interface SubmissionUploaderProps {
  examId: string;
  educatorId: string;
  onUploadComplete: (submission: Submission) => void;
  onError: (error: string) => void;
  /** Exam context for access control (Requirements: 7.1, 7.2) */
  examContext?: ExamAccessContext;
  /** Callback when access is denied */
  onAccessDenied?: (reason: string) => void;
  /** Callback to navigate to login */
  onLoginRequired?: () => void;
}

/**
 * Maps MIME type to submission_file_type enum
 */
const mimeToFileType = (mimeType: string): 'pdf' | 'jpeg' | 'png' => {
  switch (mimeType.toLowerCase()) {
    case 'application/pdf':
      return 'pdf';
    case 'image/jpeg':
      return 'jpeg';
    case 'image/png':
      return 'png';
    default:
      return 'pdf';
  }
};

/**
 * SubmissionUploader Component
 * 
 * Handles file uploads with drag-and-drop support, validation, and progress feedback.
 * Uses existing validateFile() for type/size validation and generateStoragePath() for path generation.
 * Responsive design for mobile devices with proper accessibility.
 * 
 * Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 10.1, 10.2, 10.3, 10.4, 10.5
 */
export const SubmissionUploader = ({
  examId,
  educatorId,
  onUploadComplete,
  onError,
  examContext,
  onAccessDenied,
  onLoginRequired,
}: SubmissionUploaderProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: 'idle',
    progress: 0,
    message: '',
  });

  const maxSizeMB = (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0);

  const getFileIcon = (mimeType: string) => {
    if (mimeType === "application/pdf") {
      return <FileText className="h-8 w-8" style={{ color: EDUCASSOL_COLORS.error }} />;
    }
    return <Image className="h-8 w-8" style={{ color: EDUCASSOL_COLORS.primary }} />;
  };

  const getStatusColor = (status: UploadStatus) => {
    switch (status) {
      case 'complete':
        return EDUCASSOL_COLORS.success;
      case 'error':
        return EDUCASSOL_COLORS.error;
      case 'uploading':
      case 'processing':
        return EDUCASSOL_COLORS.accent;
      default:
        return EDUCASSOL_COLORS.primary;
    }
  };

  const validateAndSetFile = useCallback((file: File) => {
    // Validate file type and size
    const validation = validateFile(file.type, file.size);
    
    if (!validation.valid) {
      const errorMessage = validation.errors.join('. ');
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: errorMessage,
      });
      onError(errorMessage);
      toast({
        title: "Arquivo inválido",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }

    setSelectedFile(file);
    setUploadProgress({
      status: 'idle',
      progress: 0,
      message: 'Arquivo selecionado. Clique em "Enviar" para fazer upload.',
    });
    return true;
  }, [onError, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (uploadProgress.status === 'uploading' || uploadProgress.status === 'processing') {
      return;
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  }, [uploadProgress.status, validateAndSetFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [validateAndSetFile]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setUploadProgress({
      status: 'idle',
      progress: 0,
      message: '',
    });
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Validate again before upload
    setUploadProgress({
      status: 'validating',
      progress: 10,
      message: 'Validando arquivo...',
    });

    const validation = validateFile(selectedFile.type, selectedFile.size);
    if (!validation.valid) {
      const errorMessage = validation.errors.join('. ');
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: errorMessage,
      });
      onError(errorMessage);
      return;
    }

    // Generate storage path
    const pathResult = generateStoragePath({
      educatorId,
      examId,
      filename: selectedFile.name,
    });

    if (!pathResult.success || !pathResult.path) {
      const errorMessage = pathResult.error || 'Erro ao gerar caminho de armazenamento';
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: errorMessage,
      });
      onError(errorMessage);
      return;
    }

    // Start upload
    setUploadProgress({
      status: 'uploading',
      progress: 30,
      message: 'Enviando arquivo...',
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('exam-submissions')
        .upload(pathResult.path, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      setUploadProgress({
        status: 'processing',
        progress: 70,
        message: 'Processando submissão...',
      });

      // Create submission record in database
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          exam_id: examId,
          storage_path: pathResult.path,
          file_type: mimeToFileType(selectedFile.type),
          file_size_bytes: selectedFile.size,
          status: 'uploaded' as const,
        })
        .select()
        .single();

      if (submissionError) {
        // Try to clean up uploaded file
        await supabase.storage.from('exam-submissions').remove([pathResult.path]);
        throw new Error(submissionError.message);
      }

      setUploadProgress({
        status: 'complete',
        progress: 100,
        message: 'Upload concluído com sucesso!',
      });

      const submission: Submission = {
        id: submissionData.id,
        examId: submissionData.exam_id,
        storagePath: submissionData.storage_path,
        fileType: submissionData.file_type,
        uploadedAt: new Date(submissionData.uploaded_at),
      };

      toast({
        title: "Upload concluído",
        description: "A submissão foi enviada com sucesso.",
      });

      onUploadComplete(submission);

      // Reset state after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress({
          status: 'idle',
          progress: 0,
          message: '',
        });
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao enviar arquivo';
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: errorMessage,
      });
      onError(errorMessage);
      toast({
        title: "Erro no upload",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const isUploading = uploadProgress.status === 'uploading' || uploadProgress.status === 'processing' || uploadProgress.status === 'validating';

  // Content to be wrapped with AccessControlGuard
  const content = (
    <motion.div
      variants={STAGGER_PARENT}
      initial="hidden"
      animate="show"
      className="space-y-3 md:space-y-4"
      role="region"
      aria-label="Upload de submissão"
    >
      {/* Drop Zone */}
      <motion.div variants={FADE_UP_ITEM}>
        <Card
          className={cn(
            "border-2 border-dashed transition-all duration-200 cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
            isUploading && "pointer-events-none opacity-60"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && !selectedFile && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !isUploading && !selectedFile) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label={selectedFile ? `Arquivo selecionado: ${selectedFile.name}` : "Clique ou arraste um arquivo para fazer upload"}
        >
          <CardContent className="p-4 md:p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_MIME_TYPES.join(",")}
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
              aria-label="Selecionar arquivo para upload"
            />
            
            <AnimatePresence mode="wait">
              {!selectedFile ? (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={EDUCASSOL_SPRING}
                >
                  <CloudUpload 
                    className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4" 
                    style={{ color: isDragging ? EDUCASSOL_COLORS.primary : EDUCASSOL_COLORS.textMuted }}
                    aria-hidden="true"
                  />
                  <p className="text-sm md:text-lg font-medium mb-1" style={{ color: EDUCASSOL_COLORS.textMain }}>
                    Arraste o arquivo aqui ou clique para selecionar
                  </p>
                  <p className="text-xs md:text-sm" style={{ color: EDUCASSOL_COLORS.textMuted }}>
                    PDF, JPEG ou PNG • Máximo {maxSizeMB}MB
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="file-selected"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={EDUCASSOL_SPRING}
                  className="flex items-center justify-center gap-3 md:gap-4"
                >
                  {getFileIcon(selectedFile.type)}
                  <div className="text-left min-w-0">
                    <p className="font-medium truncate max-w-[150px] md:max-w-xs text-sm md:text-base" style={{ color: EDUCASSOL_COLORS.textMain }}>
                      {selectedFile.name}
                    </p>
                    <p className="text-xs md:text-sm" style={{ color: EDUCASSOL_COLORS.textMuted }}>
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  {!isUploading && uploadProgress.status !== 'complete' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      aria-label="Remover arquivo selecionado"
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Section */}
      <AnimatePresence>
        {(uploadProgress.status !== 'idle' || selectedFile) && (
          <motion.div
            variants={FADE_UP_ITEM}
            initial="hidden"
            animate="show"
            exit="hidden"
          >
            <Card>
              <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3">
                {/* Status Message */}
                <div className="flex items-center gap-2" role="status" aria-live="polite">
                  {uploadProgress.status === 'validating' && (
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: EDUCASSOL_COLORS.accent }} aria-hidden="true" />
                  )}
                  {uploadProgress.status === 'uploading' && (
                    <Upload className="h-4 w-4 animate-pulse" style={{ color: EDUCASSOL_COLORS.accent }} aria-hidden="true" />
                  )}
                  {uploadProgress.status === 'processing' && (
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: EDUCASSOL_COLORS.accent }} aria-hidden="true" />
                  )}
                  {uploadProgress.status === 'complete' && (
                    <CheckCircle2 className="h-4 w-4" style={{ color: EDUCASSOL_COLORS.success }} aria-hidden="true" />
                  )}
                  {uploadProgress.status === 'error' && (
                    <AlertCircle className="h-4 w-4" style={{ color: EDUCASSOL_COLORS.error }} aria-hidden="true" />
                  )}
                  <span 
                    className="text-xs md:text-sm font-medium"
                    style={{ color: getStatusColor(uploadProgress.status) }}
                  >
                    {uploadProgress.message || (selectedFile && uploadProgress.status === 'idle' ? 'Pronto para enviar' : '')}
                  </span>
                </div>

                {/* Progress Bar with Animation */}
                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    role="progressbar"
                    aria-valuenow={uploadProgress.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progresso do upload: ${uploadProgress.progress}%`}
                  >
                    <Progress 
                      value={uploadProgress.progress} 
                      className="h-2"
                      style={{ 
                        '--progress-background': EDUCASSOL_COLORS.accent 
                      } as React.CSSProperties}
                    />
                  </motion.div>
                )}

                {/* Shimmer Skeleton during processing */}
                {uploadProgress.status === 'processing' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                    aria-busy="true"
                    aria-label="Processando arquivo"
                  >
                    <Skeleton className="h-3 md:h-4 w-3/4 animate-shimmer" />
                    <Skeleton className="h-3 md:h-4 w-1/2 animate-shimmer" />
                  </motion.div>
                )}

                {/* Action Buttons */}
                {selectedFile && uploadProgress.status !== 'complete' && (
                  <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveFile}
                      disabled={isUploading}
                      className="w-full sm:w-auto"
                      aria-label="Cancelar upload"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleUpload}
                      disabled={isUploading || uploadProgress.status === 'error'}
                      className="w-full sm:w-auto"
                      style={{ 
                        backgroundColor: isUploading ? EDUCASSOL_COLORS.accent : EDUCASSOL_COLORS.primary 
                      }}
                      aria-label={isUploading ? 'Enviando arquivo' : 'Enviar arquivo'}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                          Enviar
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // Build submission context for access control if examContext is provided
  const submissionAccessContext: SubmissionAccessContext | undefined = examContext
    ? {
        submissionId: '', // Not yet created
        examId: examContext.examId,
        examEducatorId: examContext.educatorId,
        examSchoolId: examContext.schoolId,
      }
    : undefined;

  // If examContext is provided, wrap with AccessControlGuard for exam-level access
  // Requirements: 7.1 - Verify educator role before showing grading features
  // Requirements: 7.2 - Verify exam ownership before grading
  if (examContext) {
    return (
      <AccessControlGuard
        requireEducator={true}
        examContext={examContext}
        submissionContext={submissionAccessContext}
        accessType="create"
        onAccessDenied={onAccessDenied}
        onLoginRequired={onLoginRequired}
      >
        {content}
      </AccessControlGuard>
    );
  }

  // Otherwise, just require educator role
  return (
    <AccessControlGuard
      requireEducator={true}
      onAccessDenied={onAccessDenied}
      onLoginRequired={onLoginRequired}
    >
      {content}
    </AccessControlGuard>
  );
};

export default SubmissionUploader;
