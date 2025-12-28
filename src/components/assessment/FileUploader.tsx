import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  CheckCircle2, 
  AlertCircle,
  Loader2 
} from "lucide-react";
import { validateFile, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/assessment/file-validation";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  examId: string;
  examTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
}

type FileStatus = "pending" | "uploading" | "success" | "error";

interface FileUploadItem {
  id: string;
  file: File;
  studentIdentifier: string;
  status: FileStatus;
  progress: number;
  error?: string;
  submissionId?: string;
}

const FileUploader = ({ 
  examId, 
  examTitle, 
  open, 
  onOpenChange, 
  onUploadComplete 
}: FileUploaderProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const generateFileId = () => `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const getFileIcon = (mimeType: string) => {
    if (mimeType === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    return <Image className="h-5 w-5 text-blue-500" />;
  };

  const getStatusBadge = (status: FileStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      case "uploading":
        return <Badge variant="default">Enviando...</Badge>;
      case "success":
        return <Badge className="bg-green-500 hover:bg-green-600">Enviado</Badge>;
      case "error":
        return <Badge variant="destructive">Erro</Badge>;
    }
  };

  const validateAndAddFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validatedFiles: FileUploadItem[] = [];

    for (const file of fileArray) {
      const validation = validateFile(file.type, file.size);
      
      if (validation.valid) {
        // Check for duplicates
        const isDuplicate = files.some(
          (f) => f.file.name === file.name && f.file.size === file.size
        );
        
        if (!isDuplicate) {
          validatedFiles.push({
            id: generateFileId(),
            file,
            studentIdentifier: "",
            status: "pending",
            progress: 0,
          });
        }
      } else {
        toast({
          title: "Arquivo inválido",
          description: `${file.name}: ${validation.errors.join(", ")}`,
          variant: "destructive",
        });
      }
    }

    if (validatedFiles.length > 0) {
      setFiles((prev) => [...prev, ...validatedFiles]);
    }
  }, [files, toast]);

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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  }, [validateAndAddFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [validateAndAddFiles]);

  const handleRemoveFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const handleStudentIdentifierChange = useCallback((fileId: string, value: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, studentIdentifier: value } : f
      )
    );
  }, []);

  const uploadSingleFile = async (fileItem: FileUploadItem): Promise<FileUploadItem> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { ...fileItem, status: "error", error: "Não autenticado" };
    }

    const formData = new FormData();
    formData.append("file", fileItem.file);
    formData.append("exam_id", examId);
    if (fileItem.studentIdentifier.trim()) {
      formData.append("student_identifier", fileItem.studentIdentifier.trim());
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-exam`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          ...fileItem,
          status: "error",
          progress: 0,
          error: result.error || "Erro ao enviar arquivo",
        };
      }

      return {
        ...fileItem,
        status: "success",
        progress: 100,
        submissionId: result.submission_id,
      };
    } catch (error) {
      return {
        ...fileItem,
        status: "error",
        progress: 0,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  };

  const handleUploadAll = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) {
      toast({
        title: "Nenhum arquivo pendente",
        description: "Adicione arquivos para enviar.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Update all pending files to uploading status
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "pending" ? { ...f, status: "uploading" as FileStatus, progress: 10 } : f
      )
    );

    // Upload files sequentially to avoid overwhelming the server
    for (const fileItem of pendingFiles) {
      // Update progress to show we're working on this file
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, progress: 50 } : f
        )
      );

      const result = await uploadSingleFile(fileItem);

      setFiles((prev) =>
        prev.map((f) => (f.id === fileItem.id ? result : f))
      );
    }

    setIsUploading(false);

    // Check results
    const updatedFiles = files.filter((f) => pendingFiles.some((p) => p.id === f.id));
    const successCount = updatedFiles.filter((f) => f.status === "success").length;
    const errorCount = updatedFiles.filter((f) => f.status === "error").length;

    if (successCount > 0) {
      toast({
        title: "Upload concluído",
        description: `${successCount} arquivo(s) enviado(s) com sucesso${errorCount > 0 ? `, ${errorCount} com erro` : ""}.`,
      });
      onUploadComplete?.();
    } else if (errorCount > 0) {
      toast({
        title: "Erro no upload",
        description: "Nenhum arquivo foi enviado com sucesso.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    if (isUploading) {
      toast({
        title: "Upload em andamento",
        description: "Aguarde o término do upload antes de fechar.",
        variant: "destructive",
      });
      return;
    }
    setFiles([]);
    onOpenChange(false);
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const successCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const maxSizeMB = (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload de Provas</DialogTitle>
          <DialogDescription>
            Envie as provas escaneadas para "{examTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50",
              isUploading && "pointer-events-none opacity-50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_MIME_TYPES.join(",")}
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-1">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p className="text-sm text-muted-foreground">
              PDF, JPEG ou PNG • Máximo {maxSizeMB}MB por arquivo
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  Arquivos ({files.length})
                </h4>
                <div className="flex gap-2 text-sm">
                  {pendingCount > 0 && (
                    <span className="text-muted-foreground">{pendingCount} pendente(s)</span>
                  )}
                  {successCount > 0 && (
                    <span className="text-green-600">{successCount} enviado(s)</span>
                  )}
                  {errorCount > 0 && (
                    <span className="text-destructive">{errorCount} com erro</span>
                  )}
                </div>
              </div>

              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {files.map((fileItem) => (
                  <div key={fileItem.id} className="p-3 space-y-2">
                    <div className="flex items-center gap-3">
                      {getFileIcon(fileItem.file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {fileItem.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(fileItem.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      {getStatusBadge(fileItem.status)}
                      {fileItem.status === "pending" && !isUploading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(fileItem.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      {fileItem.status === "uploading" && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {fileItem.status === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {fileItem.status === "error" && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>

                    {/* Student Identifier Input */}
                    {fileItem.status === "pending" && (
                      <div className="flex items-center gap-2 pl-8">
                        <Label className="text-xs whitespace-nowrap">Aluno:</Label>
                        <Input
                          placeholder="Nome ou ID do aluno (opcional)"
                          value={fileItem.studentIdentifier}
                          onChange={(e) =>
                            handleStudentIdentifierChange(fileItem.id, e.target.value)
                          }
                          className="h-7 text-xs"
                          disabled={isUploading}
                        />
                      </div>
                    )}

                    {/* Progress Bar */}
                    {fileItem.status === "uploading" && (
                      <Progress value={fileItem.progress} className="h-1" />
                    )}

                    {/* Error Message */}
                    {fileItem.status === "error" && fileItem.error && (
                      <p className="text-xs text-destructive pl-8">
                        {fileItem.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              {successCount > 0 ? "Fechar" : "Cancelar"}
            </Button>
            {pendingCount > 0 && (
              <Button
                onClick={handleUploadAll}
                disabled={isUploading || pendingCount === 0}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar {pendingCount} arquivo(s)
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploader;
