import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Minimize2,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { EDUCASSOL_COLORS } from '@/lib/colors';
import { FADE_UP_ITEM, EDUCASSOL_SPRING } from '@/lib/motion';
import type { Annotation, AnnotationLocation } from '@/lib/assessment/annotation';

/**
 * Text selection data from the viewer
 */
export interface TextSelection {
  text: string;
  startOffset: number;
  endOffset: number;
  pageNumber: number;
}

/**
 * Props for PDFViewer component
 */
export interface PDFViewerProps {
  /** URL of the PDF or image file to display */
  fileUrl: string;
  /** File type: 'pdf', 'jpeg', 'png' */
  fileType?: 'pdf' | 'jpeg' | 'png';
  /** Annotations to highlight on the document */
  annotations?: Annotation[];
  /** Callback when user selects text */
  onTextSelect?: (selection: TextSelection) => void;
  /** Optional class name */
  className?: string;
}

/**
 * Zoom level constraints
 */
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

/**
 * PDFViewer Component
 * 
 * Displays PDF or image submissions with zoom, pan controls and annotation highlighting.
 * Uses iframe for PDF rendering to leverage browser's native PDF viewer.
 * 
 * Requirements: 8.3, 4.1
 */
export function PDFViewer({
  fileUrl,
  fileType = 'pdf',
  annotations = [],
  onTextSelect,
  className,
}: PDFViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(1); // For images, always 1 page
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Pan state for dragging
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const isPdf = fileType === 'pdf';
  const isImage = fileType === 'jpeg' || fileType === 'png';

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  // Reset zoom
  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // Toggle fullscreen
  const handleToggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle pan start
  const handlePanStart = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  }, [zoom, panOffset]);

  // Handle pan move
  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  }, [isPanning, startPan]);

  // Handle pan end
  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleResetZoom]);

  // Handle content load
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  // Handle content error
  const handleError = useCallback(() => {
    setIsLoading(false);
    setError('Failed to load document. Please try again.');
  }, []);

  // Get annotation style for highlighting
  const getAnnotationStyle = (location: AnnotationLocation): React.CSSProperties => {
    if ('x' in location && 'y' in location) {
      // Image annotation
      return {
        position: 'absolute',
        left: `${location.x}px`,
        top: `${location.y}px`,
        width: `${location.width}px`,
        height: `${location.height}px`,
        border: `2px solid ${EDUCASSOL_COLORS.accent}`,
        backgroundColor: `${EDUCASSOL_COLORS.accent}20`,
        pointerEvents: 'none',
      };
    }
    return {};
  };

  // Filter annotations for current page
  const currentPageAnnotations = annotations.filter(
    (a) => a.location.pageNumber === currentPage
  );

  return (
    <motion.div
      ref={containerRef}
      variants={FADE_UP_ITEM}
      initial="hidden"
      animate="show"
      className={cn(
        'relative flex flex-col h-full bg-muted/30 rounded-lg overflow-hidden',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
    >
      {/* Controls Overlay */}
      <div 
        className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-lg p-1 shadow-md"
        role="toolbar"
        aria-label="Controles do visualizador"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Diminuir zoom"
          className="h-7 w-7 md:h-8 md:w-8"
        >
          <ZoomOut className="h-3 w-3 md:h-4 md:w-4" aria-hidden="true" />
        </Button>
        
        <span 
          className="text-xs font-medium px-1 md:px-2 min-w-[2.5rem] md:min-w-[3rem] text-center"
          aria-live="polite"
          aria-label={`Zoom atual: ${Math.round(zoom * 100)}%`}
        >
          {Math.round(zoom * 100)}%
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Aumentar zoom"
          className="h-7 w-7 md:h-8 md:w-8"
        >
          <ZoomIn className="h-3 w-3 md:h-4 md:w-4" aria-hidden="true" />
        </Button>
        
        <div className="w-px h-4 bg-border mx-1" aria-hidden="true" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetZoom}
          aria-label="Restaurar zoom para 100%"
          className="h-7 w-7 md:h-8 md:w-8"
        >
          <RotateCw className="h-3 w-3 md:h-4 md:w-4" aria-hidden="true" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleFullscreen}
          aria-label={isFullscreen ? 'Sair do modo tela cheia' : 'Entrar em modo tela cheia'}
          className="h-7 w-7 md:h-8 md:w-8"
        >
          {isFullscreen ? (
            <Minimize2 className="h-3 w-3 md:h-4 md:w-4" aria-hidden="true" />
          ) : (
            <Maximize2 className="h-3 w-3 md:h-4 md:w-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Page Navigation (for multi-page documents) */}
      {totalPages > 1 && (
        <div 
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-lg p-1 shadow-md"
          role="navigation"
          aria-label="Navegação de páginas"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            aria-label="Página anterior"
            className="h-7 w-7 md:h-8 md:w-8"
          >
            <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" aria-hidden="true" />
          </Button>
          
          <span 
            className="text-xs font-medium px-2"
            aria-live="polite"
            aria-label={`Página ${currentPage} de ${totalPages}`}
          >
            {currentPage} / {totalPages}
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Próxima página"
            className="h-7 w-7 md:h-8 md:w-8"
          >
            <ChevronRight className="h-3 w-3 md:h-4 md:w-4" aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Content Area */}
      <div
        ref={contentRef}
        className={cn(
          'flex-1 overflow-auto relative',
          zoom > 1 && 'cursor-grab',
          isPanning && 'cursor-grabbing'
        )}
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="space-y-4 w-full max-w-md p-8">
              <Skeleton className="h-[400px] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div 
            className="absolute inset-0 flex items-center justify-center"
            role="alert"
            aria-live="assertive"
          >
            <Card className="max-w-sm mx-4">
              <CardContent className="pt-6 text-center">
                <FileText 
                  className="h-12 w-12 mx-auto mb-4" 
                  style={{ color: EDUCASSOL_COLORS.error }}
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                  }}
                  aria-label="Tentar carregar o documento novamente"
                >
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Document Content */}
        <motion.div
          className="min-h-full flex items-center justify-center p-4"
          style={{
            transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            transformOrigin: 'center center',
          }}
          transition={EDUCASSOL_SPRING}
        >
          {isPdf && (
            <iframe
              src={`${fileUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full min-h-[600px] border-0 rounded-lg shadow-lg bg-white"
              title="PDF Viewer"
              onLoad={handleLoad}
              onError={handleError}
            />
          )}

          {isImage && (
            <div className="relative">
              <img
                src={fileUrl}
                alt="Submission"
                className="max-w-full h-auto rounded-lg shadow-lg"
                onLoad={handleLoad}
                onError={handleError}
                draggable={false}
              />
              
              {/* Annotation Overlays for Images */}
              {currentPageAnnotations.map((annotation) => (
                <div
                  key={annotation.id}
                  style={getAnnotationStyle(annotation.location)}
                  title={annotation.content}
                  className="transition-opacity hover:opacity-80"
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default PDFViewer;
