/**
 * StreamingContent Component
 * 
 * Displays AI-generated content with typing animation and sparkle indicator.
 * 
 * Requirements:
 * - 9.2: Display typing animation effect for text content
 * - 9.3: Display visual indicator (sparkle animation) during processing
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Props for the StreamingContent component
 */
export interface StreamingContentProps {
  /** The content to display with typing animation */
  content: string;
  /** Whether the content is currently being streamed */
  isStreaming: boolean;
  /** Speed of typing animation in milliseconds per character */
  typingSpeed?: number;
  /** CSS class name for the container */
  className?: string;
  /** Callback when typing animation completes */
  onComplete?: () => void;
}

/**
 * Sparkle animation component shown during processing
 * Requirement 9.3: Display visual indicator (sparkle animation)
 */
function SparkleIndicator({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Sparkles className="h-4 w-4 text-examai-purple-500 animate-pulse" />
      <span className="text-sm text-muted-foreground animate-pulse">
        Generating...
      </span>
    </span>
  );
}

/**
 * Typing cursor component
 */
function TypingCursor() {
  return (
    <span className="inline-block w-0.5 h-5 bg-examai-purple-500 animate-blink ml-0.5" />
  );
}

/**
 * StreamingContent Component
 * 
 * Displays content with a typing animation effect for streamed text.
 * Shows a sparkle indicator while content is being generated.
 */
export function StreamingContent({
  content,
  isStreaming,
  typingSpeed = 15,
  className,
  onComplete,
}: StreamingContentProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const contentRef = useRef(content);
  const indexRef = useRef(0);

  // Reset when content changes significantly (new generation)
  useEffect(() => {
    if (content !== contentRef.current) {
      // If new content is shorter or completely different, reset
      if (content.length < displayedContent.length || !content.startsWith(displayedContent)) {
        setDisplayedContent('');
        indexRef.current = 0;
      }
      contentRef.current = content;
    }
  }, [content, displayedContent]);

  // Typing animation effect
  // Requirement 9.2: Display typing animation effect for text content
  useEffect(() => {
    if (!content) {
      setDisplayedContent('');
      indexRef.current = 0;
      return;
    }

    // If we've already displayed all content, no need to animate
    if (indexRef.current >= content.length) {
      if (isTyping) {
        setIsTyping(false);
        onComplete?.();
      }
      return;
    }

    setIsTyping(true);

    const timer = setInterval(() => {
      if (indexRef.current < content.length) {
        // Add multiple characters at once for faster display
        const charsToAdd = Math.min(3, content.length - indexRef.current);
        indexRef.current += charsToAdd;
        setDisplayedContent(content.slice(0, indexRef.current));
      } else {
        clearInterval(timer);
        setIsTyping(false);
        onComplete?.();
      }
    }, typingSpeed);

    return () => clearInterval(timer);
  }, [content, typingSpeed, onComplete, isTyping]);

  // Show sparkle indicator when streaming but no content yet
  if (isStreaming && !content) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <SparkleIndicator />
      </div>
    );
  }

  // Show nothing if no content
  if (!content && !isStreaming) {
    return null;
  }

  return (
    <div className={cn('relative', className)}>
      {/* Streaming indicator at top */}
      {isStreaming && (
        <div className="absolute -top-6 left-0">
          <SparkleIndicator />
        </div>
      )}

      {/* Content with typing effect */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <span className="whitespace-pre-wrap">{displayedContent}</span>
        {(isTyping || isStreaming) && <TypingCursor />}
      </div>
    </div>
  );
}


/**
 * StreamingJSON Component
 * 
 * Specialized component for displaying streamed JSON content
 * with syntax highlighting and formatting.
 */
export interface StreamingJSONProps {
  /** The JSON content to display */
  content: unknown;
  /** Whether the content is currently being streamed */
  isStreaming: boolean;
  /** CSS class name for the container */
  className?: string;
}

export function StreamingJSON({
  content,
  isStreaming,
  className,
}: StreamingJSONProps) {
  const formattedContent = content ? JSON.stringify(content, null, 2) : '';

  return (
    <div className={cn('relative', className)}>
      {isStreaming && (
        <div className="absolute -top-6 left-0">
          <SparkleIndicator />
        </div>
      )}

      <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
        <code>{formattedContent}</code>
        {isStreaming && <TypingCursor />}
      </pre>
    </div>
  );
}

/**
 * LoadingSparkle Component
 * 
 * Standalone sparkle loading indicator for use in other components.
 */
export interface LoadingSparkleProps {
  /** Loading message to display */
  message?: string;
  /** Size of the sparkle icon */
  size?: 'sm' | 'md' | 'lg';
  /** CSS class name */
  className?: string;
}

export function LoadingSparkle({
  message = 'Generating...',
  size = 'md',
  className,
}: LoadingSparkleProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-5 w-5',
    lg: 'h-8 w-8',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className="relative">
        <Sparkles className={cn(sizeClasses[size], 'text-examai-purple-500 animate-pulse')} />
        <div className="absolute inset-0 animate-ping">
          <Sparkles className={cn(sizeClasses[size], 'text-examai-purple-500/30')} />
        </div>
      </div>
      <span className={cn(textSizeClasses[size], 'text-muted-foreground animate-pulse')}>
        {message}
      </span>
    </div>
  );
}

export default StreamingContent;
